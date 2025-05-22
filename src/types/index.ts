
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  stats: {
    totalUploads: number;
    totalFlashcards: number;
    totalQuizzes: number;
    totalCorrect: number;
    totalAttempts: number;
  };
}

export interface Upload {
  id: string;
  userId: string;
  title: string;
  type: 'pdf' | 'image' | 'text';
  originalContent?: string;
  extractedText: string;
  topics: string[];
  createdAt: Date;
}

export interface Quiz {
  id: string;
  uploadId: string;
  title: string;
  userId: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  uploadId: string;
  userId: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: number;
  nextReview: Date;
  reviewCount: number;
  createdAt: Date;
}

export interface ReviewSession {
  id: string;
  userId: string;
  flashcardId: string;
  rating: 'easy' | 'medium' | 'hard';
  reviewedAt: Date;
}

export type QuizResult = {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: Date;
};

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
