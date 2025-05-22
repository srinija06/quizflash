
// Simplified implementation of the SM-2 spaced repetition algorithm

type Difficulty = 'easy' | 'medium' | 'hard';

interface ReviewResult {
  nextReviewDate: Date;
  newDifficulty: number;
}

// Difficulty factors
const DIFFICULTY_FACTORS = {
  easy: 2.5,
  medium: 1.5,
  hard: 1.0
};

// Review intervals in days
const REVIEW_INTERVALS = {
  easy: [1, 3, 7, 14, 30, 60],
  medium: [1, 2, 4, 7, 15, 30],
  hard: [1, 1, 2, 3, 5, 7]
};

export const spacedRepetition = {
  /**
   * Calculate the next review date based on difficulty and review history
   */
  calculateNextReview: (difficulty: Difficulty, reviewCount: number): ReviewResult => {
    const intervals = REVIEW_INTERVALS[difficulty];
    const currentInterval = Math.min(reviewCount, intervals.length - 1);
    const days = intervals[currentInterval];
    
    // Calculate new difficulty
    const baseDifficulty = { easy: 1, medium: 2, hard: 3 }[difficulty];
    let newDifficulty = baseDifficulty;
    
    if (difficulty === 'easy' && reviewCount > 1) {
      newDifficulty = Math.max(1, baseDifficulty - 0.2);
    } else if (difficulty === 'hard' && reviewCount > 1) {
      newDifficulty = Math.min(3, baseDifficulty + 0.2);
    }
    
    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + days);
    
    return {
      nextReviewDate,
      newDifficulty
    };
  },
  
  /**
   * Get all cards due for review
   */
  getDueCards: (cards: any[], userId: string): any[] => {
    const now = new Date();
    return cards.filter(card => 
      card.userId === userId && new Date(card.nextReview) <= now
    );
  }
};
