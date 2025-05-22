
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/storage/database';
import { Upload, Quiz, Flashcard } from '@/types';

const Dashboard = () => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<number>(0);
  
  useEffect(() => {
    if (user) {
      // Fetch user's uploads
      const userUploads = db.getUploadsByUserId(user.id);
      setUploads(userUploads);
      
      // Fetch user's quizzes
      const userQuizzes = db.getQuizzesByUserId(user.id);
      setQuizzes(userQuizzes);
      
      // Fetch user's flashcards
      const userFlashcards = db.getFlashcardsByUserId(user.id);
      setFlashcards(userFlashcards);
      
      // Calculate due flashcards
      const now = new Date();
      const due = userFlashcards.filter(flashcard => new Date(flashcard.nextReview) <= now);
      setDueFlashcards(due.length);
    }
  }, [user]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uploads.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flashcards.length}</div>
            </CardContent>
          </Card>
          
          <Card className={dueFlashcards > 0 ? 'border-primary' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dueFlashcards}</div>
            </CardContent>
            {dueFlashcards > 0 && (
              <CardFooter className="pt-0">
                <Button asChild size="sm" variant="outline">
                  <Link to="/review">Review Now</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/upload">Upload New Content</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/review">Review Flashcards</Link>
            </Button>
          </div>
        </div>
        
        {/* Recent Uploads */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
          </div>
          
          {uploads.length > 0 ? (
            <div className="space-y-4">
              {uploads.slice(0, 5).map((upload) => (
                <Card key={upload.id}>
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{upload.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(upload.createdAt).toLocaleDateString()} • {upload.type}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {upload.topics.map((topic, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        View Quizzes
                      </Button>
                      <Button variant="outline" size="sm">
                        View Flashcards
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No uploads yet</CardTitle>
                <CardDescription>
                  Upload your study materials to get started.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link to="/upload">Upload Now</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Recent Quizzes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Quizzes</h2>
          </div>
          
          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.slice(0, 3).map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>
                      {quiz.questions.length} Questions
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild>
                      <Link to={`/quiz/${quiz.id}`}>Take Quiz</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No quizzes yet</CardTitle>
                <CardDescription>
                  Upload content to generate quizzes automatically.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <Link to="/upload">Upload Content</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
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

export default Dashboard;
