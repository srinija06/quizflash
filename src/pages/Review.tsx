
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/storage/database';
import { Flashcard } from '@/types';
import { spacedRepetition } from '@/lib/spaced-repetition/algorithm';
import { useNavigate } from 'react-router-dom';

const Review = () => {
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      // Get due flashcards
      const due = db.getDueFlashcards(user.id);
      
      // Sort by difficulty (harder cards first)
      const sorted = [...due].sort((a, b) => b.difficulty - a.difficulty);
      
      setDueFlashcards(sorted);
      setIsLoading(false);
      
      if (sorted.length === 0) {
        toast.info('No flashcards due for review!');
      }
    }
  }, [user]);
  
  const currentCard = dueFlashcards[currentCardIndex];
  
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleRating = (rating: 'easy' | 'medium' | 'hard') => {
    if (!user || !currentCard) return;
    
    // Calculate next review date using spaced repetition
    const result = spacedRepetition.calculateNextReview(
      rating, 
      currentCard.reviewCount
    );
    
    // Update flashcard
    db.updateFlashcard(currentCard.id, {
      nextReview: result.nextReviewDate,
      difficulty: result.newDifficulty,
      reviewCount: currentCard.reviewCount + 1
    });
    
    // Add review session
    const reviewSession = {
      id: `review-${Date.now()}`,
      userId: user.id,
      flashcardId: currentCard.id,
      rating,
      reviewedAt: new Date(),
    };
    
    db.addReviewSession(reviewSession);
    
    // Move to next card or finish
    if (currentCardIndex < dueFlashcards.length - 1) {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
      setIsFlipped(false);
    } else {
      setReviewCompleted(true);
      toast.success('Review session completed!');
    }
  };
  
  if (isLoading) {
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
  
  if (dueFlashcards.length === 0 || reviewCompleted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1 container py-8">
          <Card className="max-w-xl mx-auto p-6 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
            <p className="text-muted-foreground mb-6">
              You've completed all your flashcard reviews for now. Check back later for more.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              {reviewCompleted && (
                <Button onClick={() => {
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setReviewCompleted(false);
                }}>
                  Review Again
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">Flashcard Review</h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Card {currentCardIndex + 1} of {dueFlashcards.length}
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full mt-2 mb-6 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentCardIndex / dueFlashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {currentCard && (
          <div className="mx-auto max-w-3xl mb-6">
            {/* Flashcard */}
            <div 
              className={`flashcard mx-auto mb-6 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
              onClick={flipCard}
            >
              <div className="flashcard-inner bg-card relative h-[300px] sm:h-[280px] w-full rounded-xl shadow-lg">
                {/* Front */}
                <div className="flashcard-front absolute w-full h-full flex flex-col p-6 rounded-xl border">
                  <div className="text-sm text-muted-foreground mb-2">Question</div>
                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <h3 className="text-xl font-medium">{currentCard.question}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Click to flip
                  </div>
                </div>
                
                {/* Back */}
                <div className="flashcard-back absolute w-full h-full flex flex-col p-6 rounded-xl border">
                  <div className="text-sm text-muted-foreground mb-2">Answer</div>
                  <div className="flex-1 flex items-center justify-center text-center p-4">
                    <p className="text-xl">{currentCard.answer}</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Click to flip back
                  </div>
                </div>
              </div>
            </div>
            
            {/* Topic tag */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium text-foreground">
                {currentCard.topic}
              </span>
            </div>
            
            {/* Rating buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button 
                variant="outline"
                className="border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleRating('hard')}
              >
                Hard (Review Tomorrow)
              </Button>
              <Button 
                variant="outline"
                className="border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                onClick={() => handleRating('medium')}
              >
                Medium (Review in 2 Days)
              </Button>
              <Button 
                variant="outline"
                className="border-green-200 hover:bg-green-50 hover:text-green-600"
                onClick={() => handleRating('easy')}
              >
                Easy (Review in 4 Days)
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Review;
