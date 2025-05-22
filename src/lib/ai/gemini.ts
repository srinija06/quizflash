
import { QuizQuestion, Flashcard } from '@/types';

// Mock API response for quiz generation
const mockQuizResponse = (text: string): QuizQuestion[] => {
  // In a real app, this would call the Gemini API
  // For this prototype, we'll generate some mock questions based on text keywords
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 5)
    .slice(0, 8);
  
  return keywords.map((keyword, index) => ({
    id: `q-${Date.now()}-${index}`,
    question: `What is the significance of "${keyword}" in this context?`,
    options: [
      `It represents a fundamental concept`,
      `It's a secondary element in the text`,
      `It's only mentioned as a reference`,
      `It's not important to the main theme`,
    ],
    correctAnswer: Math.floor(Math.random() * 4),
    explanation: `"${keyword}" is ${Math.random() > 0.5 ? 'crucial' : 'important'} because it ${Math.random() > 0.5 ? 'establishes the framework' : 'provides context'} for understanding the material.`,
  }));
};

// Mock API response for flashcard generation
const mockFlashcardResponse = (text: string, uploadId: string, userId: string): Flashcard[] => {
  // In a real app, this would call the Gemini API
  // For this prototype, we'll generate some mock flashcards based on text keywords
  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 5)
    .slice(0, 12);
  
  const topics = ['Definitions', 'Concepts', 'Examples', 'Theory', 'Application'];
  
  return keywords.map((keyword, index) => {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    return {
      id: `fc-${Date.now()}-${index}`,
      uploadId,
      userId,
      question: `Define or explain the term: ${keyword}`,
      answer: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} refers to ${
        Math.random() > 0.5 
          ? 'a key concept that helps understand the broader context' 
          : 'an important element that supports the main theory'
      }.`,
      topic: randomTopic,
      difficulty: Math.floor(Math.random() * 3) + 1,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      reviewCount: 0,
      createdAt: new Date(),
    };
  });
};

// Mock topic extraction
const extractTopics = (text: string): string[] => {
  const allWords = text.toLowerCase().replace(/[^\w\s]/g, '').split(' ');
  const frequentWords = [...new Set(allWords)]
    .filter(word => word.length > 5)
    .slice(0, 5);
    
  return frequentWords;
};

// Simulate API call delay
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

export const geminiService = {
  generateQuiz: async (text: string, title: string, uploadId: string, userId: string) => {
    await simulateApiDelay();
    
    // Generate quiz questions
    const questions = mockQuizResponse(text);
    
    return {
      id: `quiz-${Date.now()}`,
      title,
      uploadId,
      userId,
      questions,
      createdAt: new Date(),
    };
  },
  
  generateFlashcards: async (text: string, uploadId: string, userId: string) => {
    await simulateApiDelay();
    
    // Generate flashcards
    const flashcards = mockFlashcardResponse(text, uploadId, userId);
    
    return flashcards;
  },
  
  extractTopics: async (text: string) => {
    await simulateApiDelay();
    
    // Extract topics
    const topics = extractTopics(text);
    
    return topics;
  }
};
