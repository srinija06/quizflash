
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/storage/database';
import { Quiz as QuizType, QuizQuestion } from '@/types';

const Quiz = () => {
  const { id: quizId } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch quiz data
  useEffect(() => {
    if (quizId) {
      const fetchedQuiz = db.getQuizById(quizId);
      if (fetchedQuiz) {
        setQuiz(fetchedQuiz);
        // Start timer when quiz loads
        setIsTimerActive(true);
      } else {
        toast.error('Quiz not found');
        navigate('/dashboard');
      }
    }
  }, [quizId, navigate]);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0 && !isAnswered) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      // Time's up, handle as wrong answer
      handleAnswer();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isTimerActive, isAnswered]);
  
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  const handleOptionSelect = (value: string) => {
    setSelectedOption(parseInt(value));
  };
  
  const handleAnswer = () => {
    if (selectedOption === null && timeLeft > 0) {
      toast.error('Please select an option');
      return;
    }
    
    setIsTimerActive(false);
    setIsAnswered(true);
    
    const isAnswerCorrect = selectedOption === currentQuestion?.correctAnswer;
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
      setIsTimerActive(true);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      
      // Save quiz result
      const quizResult = {
        quizId: `${user?.id}-${quizId}-${Date.now()}`,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
      };
      
      db.addQuizResult(quizResult);
      
      // Update user stats
      if (user) {
        const updatedStats = {
          totalCorrect: user.stats.totalCorrect + score,
          totalAttempts: user.stats.totalAttempts + quiz.questions.length,
        };
        
        db.updateUser(user.id, { stats: { ...user.stats, ...updatedStats } });
        
        // Update user in local storage (for our mockup)
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id === user.id) {
          storedUser.stats = { ...storedUser.stats, ...updatedStats };
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      }
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  
  if (!quiz) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
            <div className="h-4 w-32 rounded bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 container py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Quiz Completed</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold mb-2">{percentage}%</div>
                <p className="text-muted-foreground">
                  You scored {score} out of {quiz.questions.length} questions
                </p>
              </div>
              
              <div className="mb-8 px-4">
                {percentage >= 80 ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-md">
                    <p className="font-medium">Excellent work!</p>
                    <p>You've mastered this content.</p>
                  </div>
                ) : percentage >= 60 ? (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
                    <p className="font-medium">Good job!</p>
                    <p>You're making good progress, but some review might help.</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-700 p-4 rounded-md">
                    <p className="font-medium">Keep practicing!</p>
                    <p>Try reviewing the material again before retaking the quiz.</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setIsAnswered(false);
                setTimeLeft(30);
                setIsTimerActive(true);
                setScore(0);
                setQuizCompleted(false);
              }}>
                Retake Quiz
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{quiz.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </p>
              </div>
              
              <div className={`px-3 py-2 rounded-lg font-medium ${
                timeLeft > 10 
                  ? 'bg-secondary' 
                  : timeLeft > 5 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-red-100 text-red-700 animate-pulse'
              }`}>
                {timeLeft} sec
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </CardHeader>
          
          <CardContent>
            {currentQuestion && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {currentQuestion.question}
                </h3>
                
                <RadioGroup 
                  value={selectedOption?.toString() || ''}
                  onValueChange={handleOptionSelect}
                  disabled={isAnswered}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center space-x-2 p-3 rounded-lg mb-3 border ${
                        isAnswered && index === currentQuestion.correctAnswer
                          ? 'bg-green-50 border-green-200'
                          : isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer
                            ? 'bg-red-50 border-red-200'
                            : 'hover:bg-secondary/50'
                      }`}
                    >
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`option-${index}`}
                        disabled={isAnswered}
                      />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer py-1"
                      >
                        {option}
                      </Label>
                      
                      {isAnswered && index === currentQuestion.correctAnswer && (
                        <span className="text-green-600 text-lg">✓</span>
                      )}
                      {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && (
                        <span className="text-red-500 text-lg">✗</span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
                
                {isAnswered && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="font-medium mb-1">
                      {isCorrect ? 'Correct!' : 'Incorrect!'}
                    </p>
                    <p>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            {!isAnswered ? (
              <Button onClick={handleAnswer}>Submit Answer</Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Quiz;
