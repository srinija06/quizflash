
import { User, Upload, Quiz, Flashcard, ReviewSession, QuizResult } from '@/types';

// Define collection names
const COLLECTIONS = {
  USERS: 'users',
  UPLOADS: 'uploads',
  QUIZZES: 'quizzes',
  FLASHCARDS: 'flashcards',
  REVIEW_SESSIONS: 'review_sessions',
  QUIZ_RESULTS: 'quiz_results',
};

// Generic function to get all items from a collection
const getCollection = <T>(collectionName: string): T[] => {
  const collection = localStorage.getItem(collectionName);
  return collection ? JSON.parse(collection) : [];
};

// Generic function to save a collection
const saveCollection = <T>(collectionName: string, data: T[]): void => {
  localStorage.setItem(collectionName, JSON.stringify(data));
};

// Generic function to add an item to a collection
const addItem = <T>(collectionName: string, item: T): T => {
  const collection = getCollection<T>(collectionName);
  collection.push(item);
  saveCollection(collectionName, collection);
  return item;
};

// Generic function to update an item in a collection
const updateItem = <T extends { id: string }>(collectionName: string, id: string, updates: Partial<T>): T | null => {
  const collection = getCollection<T>(collectionName);
  const index = collection.findIndex((item) => item.id === id);
  
  if (index !== -1) {
    collection[index] = { ...collection[index], ...updates };
    saveCollection(collectionName, collection);
    return collection[index];
  }
  
  return null;
};

// Generic function to get an item by ID
const getItemById = <T extends { id: string }>(collectionName: string, id: string): T | null => {
  const collection = getCollection<T>(collectionName);
  return collection.find((item) => item.id === id) || null;
};

// Generic function to delete an item by ID
const deleteItemById = <T extends { id: string }>(collectionName: string, id: string): boolean => {
  const collection = getCollection<T>(collectionName);
  const filteredCollection = collection.filter((item) => item.id !== id);
  
  if (filteredCollection.length < collection.length) {
    saveCollection(collectionName, filteredCollection);
    return true;
  }
  
  return false;
};

// Generic function to query items
const queryItems = <T>(collectionName: string, predicate: (item: T) => boolean): T[] => {
  const collection = getCollection<T>(collectionName);
  return collection.filter(predicate);
};

// Create database service
export const db = {
  // User methods
  getUsers: () => getCollection<User>(COLLECTIONS.USERS),
  getUserById: (id: string) => getItemById<User>(COLLECTIONS.USERS, id),
  addUser: (user: User) => addItem<User>(COLLECTIONS.USERS, user),
  updateUser: (id: string, updates: Partial<User>) => updateItem<User>(COLLECTIONS.USERS, id, updates),
  
  // Upload methods
  getUploads: () => getCollection<Upload>(COLLECTIONS.UPLOADS),
  getUploadById: (id: string) => getItemById<Upload>(COLLECTIONS.UPLOADS, id),
  getUploadsByUserId: (userId: string) => queryItems<Upload>(COLLECTIONS.UPLOADS, (upload) => upload.userId === userId),
  addUpload: (upload: Upload) => addItem<Upload>(COLLECTIONS.UPLOADS, upload),
  updateUpload: (id: string, updates: Partial<Upload>) => updateItem<Upload>(COLLECTIONS.UPLOADS, id, updates),
  
  // Quiz methods
  getQuizzes: () => getCollection<Quiz>(COLLECTIONS.QUIZZES),
  getQuizById: (id: string) => getItemById<Quiz>(COLLECTIONS.QUIZZES, id),
  getQuizzesByUserId: (userId: string) => queryItems<Quiz>(COLLECTIONS.QUIZZES, (quiz) => quiz.userId === userId),
  getQuizzesByUploadId: (uploadId: string) => queryItems<Quiz>(COLLECTIONS.QUIZZES, (quiz) => quiz.uploadId === uploadId),
  addQuiz: (quiz: Quiz) => addItem<Quiz>(COLLECTIONS.QUIZZES, quiz),
  updateQuiz: (id: string, updates: Partial<Quiz>) => updateItem<Quiz>(COLLECTIONS.QUIZZES, id, updates),
  
  // Flashcard methods
  getFlashcards: () => getCollection<Flashcard>(COLLECTIONS.FLASHCARDS),
  getFlashcardById: (id: string) => getItemById<Flashcard>(COLLECTIONS.FLASHCARDS, id),
  getFlashcardsByUserId: (userId: string) => queryItems<Flashcard>(COLLECTIONS.FLASHCARDS, (flashcard) => flashcard.userId === userId),
  getFlashcardsByUploadId: (uploadId: string) => queryItems<Flashcard>(COLLECTIONS.FLASHCARDS, (flashcard) => flashcard.uploadId === uploadId),
  getDueFlashcards: (userId: string) => {
    const now = new Date();
    return queryItems<Flashcard>(COLLECTIONS.FLASHCARDS, 
      (flashcard) => flashcard.userId === userId && new Date(flashcard.nextReview) <= now
    );
  },
  addFlashcard: (flashcard: Flashcard) => addItem<Flashcard>(COLLECTIONS.FLASHCARDS, flashcard),
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => updateItem<Flashcard>(COLLECTIONS.FLASHCARDS, id, updates),
  
  // Review session methods
  getReviewSessions: () => getCollection<ReviewSession>(COLLECTIONS.REVIEW_SESSIONS),
  addReviewSession: (session: ReviewSession) => addItem<ReviewSession>(COLLECTIONS.REVIEW_SESSIONS, session),
  getReviewSessionsByUserId: (userId: string) => queryItems<ReviewSession>(
    COLLECTIONS.REVIEW_SESSIONS, 
    (session) => session.userId === userId
  ),
  
  // Quiz result methods
  getQuizResults: () => getCollection<QuizResult>(COLLECTIONS.QUIZ_RESULTS),
  addQuizResult: (result: QuizResult) => addItem<QuizResult>(COLLECTIONS.QUIZ_RESULTS, result),
  getQuizResultsByUserId: (userId: string) => queryItems<QuizResult>(
    COLLECTIONS.QUIZ_RESULTS, 
    (result) => result.quizId.startsWith(userId)
  ),
};
