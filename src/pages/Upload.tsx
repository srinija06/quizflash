
import { useState, useRef, ChangeEvent } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { pdfParser } from '@/lib/pdf/parser';
import { ocrService } from '@/lib/ocr/tesseract';
import { geminiService } from '@/lib/ai/gemini';
import { db } from '@/lib/storage/database';
import { useNavigate } from 'react-router-dom';

type UploadType = 'pdf' | 'image' | 'text';

const Upload = () => {
  const [uploadType, setUploadType] = useState<UploadType>('pdf');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleTabChange = (value: string) => {
    setUploadType(value as UploadType);
    setFile(null);
    setTextContent('');
    setExtractedText('');
    setCurrentStep(1);
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const validateAndSetFile = (selectedFile: File) => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds the 10MB limit');
      return;
    }
    
    // Validate file type
    if (uploadType === 'pdf' && !selectedFile.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (uploadType === 'image') {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (!validImageTypes.includes(selectedFile.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, BMP, WEBP)');
        return;
      }
    }
    
    // Set file and generate a title if none provided
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleProcessContent = async () => {
    if (!title) {
      toast.error('Please provide a title for your content');
      return;
    }
    
    if ((uploadType === 'pdf' || uploadType === 'image') && !file) {
      toast.error(`Please upload a ${uploadType === 'pdf' ? 'PDF file' : 'image'}`);
      return;
    }
    
    if (uploadType === 'text' && !textContent) {
      toast.error('Please enter some text content');
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep(2);
    
    try {
      let extractedTextContent = '';
      
      if (uploadType === 'pdf' && file) {
        // Process PDF
        toast.info('Processing PDF file...');
        extractedTextContent = await pdfParser.extractText(file);
      } else if (uploadType === 'image' && file) {
        // Process Image with OCR
        toast.info('Performing OCR on image...');
        extractedTextContent = await ocrService.recognizeText(file);
      } else {
        // Use text directly
        extractedTextContent = textContent;
      }
      
      setExtractedText(extractedTextContent);
      toast.success('Content processed successfully');
    } catch (error) {
      console.error('Error processing content:', error);
      toast.error('Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGenerateContent = async () => {
    if (!user) {
      toast.error('You need to be logged in');
      return;
    }
    
    if (!extractedText) {
      toast.error('No text to generate content from');
      return;
    }
    
    setIsGenerating(true);
    setCurrentStep(3);
    
    try {
      // First, extract topics
      toast.info('Analyzing topics...');
      const topics = await geminiService.extractTopics(extractedText);
      
      // Create upload record
      const uploadData = {
        id: `upload-${Date.now()}`,
        userId: user.id,
        title,
        type: uploadType,
        extractedText,
        topics,
        createdAt: new Date(),
      };
      
      const upload = db.addUpload(uploadData);
      
      // Generate quiz
      toast.info('Generating quiz questions...');
      const quiz = await geminiService.generateQuiz(extractedText, title, upload.id, user.id);
      db.addQuiz(quiz);
      
      // Generate flashcards
      toast.info('Creating flashcards...');
      const flashcards = await geminiService.generateFlashcards(extractedText, upload.id, user.id);
      flashcards.forEach((flashcard) => {
        db.addFlashcard(flashcard);
      });
      
      // Update user stats
      const updatedStats = {
        totalUploads: user.stats.totalUploads + 1,
        totalFlashcards: user.stats.totalFlashcards + flashcards.length,
        totalQuizzes: user.stats.totalQuizzes + 1,
      };
      
      db.updateUser(user.id, { stats: { ...user.stats, ...updatedStats } });
      
      // Update user in local storage (for our mockup)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.id === user.id) {
        storedUser.stats = { ...storedUser.stats, ...updatedStats };
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      
      toast.success('Content generated successfully');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Upload Content</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Learning Materials</CardTitle>
            <CardDescription>
              Upload your lecture notes, slides, or textbook content to generate quizzes and flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {['Upload Content', 'Process & Preview', 'Generate & Save'].map((step, index) => (
                  <div 
                    key={step} 
                    className="flex flex-col items-center"
                    style={{ width: '33%' }}
                  >
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep > index + 1 
                          ? 'bg-primary text-primary-foreground' 
                          : currentStep === index + 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {currentStep > index + 1 ? '✓' : index + 1}
                    </div>
                    <span className="text-xs mt-1 text-center">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary transition-all"
                  style={{ width: `${(currentStep - 1) * 50}%` }}
                ></div>
              </div>
            </div>
            
            {currentStep === 1 && (
              <>
                {/* Step 1: Upload Content */}
                <div className="mb-6">
                  <Label htmlFor="title" className="mb-2 block">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Chapter 5: Cell Biology"
                    className="mb-2"
                    maxLength={100}
                  />
                </div>
                
                <Tabs defaultValue="pdf" value={uploadType} onValueChange={handleTabChange}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="text">Text</TabsTrigger>
                  </TabsList>
                  <TabsContent value="pdf">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        dragActive ? 'border-primary' : 'border-border'
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="mb-4 flex justify-center text-3xl">
                        📄
                      </div>
                      {file ? (
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setFile(null)} 
                            className="mt-3"
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="mb-2">Drag & drop your PDF file here, or</p>
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Maximum file size: 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="image">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        dragActive ? 'border-primary' : 'border-border'
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="mb-4 flex justify-center text-3xl">
                        🖼️
                      </div>
                      {file ? (
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setFile(null)} 
                            className="mt-3"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="mb-2">Drag & drop your image file here, or</p>
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Browse Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Maximum file size: 10MB
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPEG, PNG, GIF, BMP, WEBP
                          </p>
                        </>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="text">
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Paste your lecture notes, article content, or study material here..."
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Characters: {textContent.length}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6 text-right">
                  <Button 
                    onClick={handleProcessContent}
                    disabled={
                      isProcessing || 
                      !title || 
                      ((uploadType === 'pdf' || uploadType === 'image') && !file) ||
                      (uploadType === 'text' && !textContent)
                    }
                  >
                    {isProcessing ? 'Processing...' : 'Process Content'}
                  </Button>
                </div>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                {/* Step 2: Process & Preview */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Processed Content</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="max-h-[300px] overflow-y-auto">
                          <div className="whitespace-pre-wrap">
                            {extractedText}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-2">
                      Characters: {extractedText.length} 
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleGenerateContent}
                      disabled={isGenerating || !extractedText}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Learning Materials'}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {currentStep === 3 && (
              <>
                {/* Step 3: Generating content */}
                <div className="py-10 flex flex-col items-center">
                  <div className="animate-pulse mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/30 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-primary"></div>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Generating Learning Materials</h3>
                  <p className="text-muted-foreground mb-8 text-center max-w-md">
                    Please wait while our AI analyzes your content and creates quizzes and flashcards. 
                    This may take a minute...
                  </p>
                  
                  <div className="w-full max-w-md space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Extracting topics</span>
                        <span>Complete</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Creating quiz questions</span>
                        <span>In progress</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating flashcards</span>
                        <span>Waiting</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2025 QuizFlash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Upload;
