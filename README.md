🧠 AI-Powered Quiz & Flashcard Generator

Transform your study materials into interactive quizzes and spaced-repetition flashcards using Google Gemini AI


🚀 Live Demo
Deployed App: https://ai-quiz-flashcard-generator.vercel.app
📋 Table of Contents

Overview
Features
Tech Stack
Getting Started
Environment Variables
Project Structure
API Endpoints
AI Integration
Deployment
Contributing
License

🎯 Overview
This full-stack web application helps students transform their lecture materials into interactive learning tools. Upload PDFs, images, or paste text content, and our AI automatically generates:

Multiple-choice quizzes with detailed explanations
Flashcards with spaced repetition scheduling
Topic-based organization for efficient studying

Perfect for students, educators, and anyone looking to optimize their learning workflow.
✨ Features
🔐 Authentication & User Management

Email/password authentication with session management
User profiles with learning statistics
Onboarding flow for new users

📤 Content Upload & Processing

PDF Upload: Extract text from lecture slides and documents
Image Upload: OCR processing using Tesseract.js
Direct Text Input: Paste content directly from notes
Real-time processing with progress indicators

🤖 AI-Powered Generation

Smart Quiz Creation: 5-10 multiple-choice questions per upload
Flashcard Generation: 10-15 Q&A pairs with topic tagging
Intelligent Explanations: Detailed answer explanations
Powered by Google Gemini API for high-quality content

📊 Interactive Learning Interface

Timed Quiz Mode: 30-second timer per question with instant feedback
Flashcard Review: Smooth flip animations and rating system
Progress Tracking: Visual progress bars and completion stats
Performance Analytics: Track your learning progress over time

🧪 Spaced Repetition System

SM-2 Algorithm: Scientifically-proven spacing intervals
Difficulty Rating: Easy (4 days), Medium (2 days), Hard (1 day)
Daily Review Queue: Automatically schedules due cards
Long-term Retention: Optimized for memory consolidation

📱 Modern UI/UX

Responsive Design: Seamless experience on all devices
Dark/Light Mode: Toggle between themes
Smooth Animations: Polished interactions and transitions
Accessibility: WCAG compliant with keyboard navigation

🛠️ Tech Stack
LayerTechnologyPurposeFrontendNext.js 14+ (App Router)React framework with SSRStylingTailwind CSSUtility-first CSS frameworkLanguageTypeScriptType-safe developmentAI ServicesGoogle Gemini APIContent generationFile Processingpdf-parse, Tesseract.jsPDF parsing and OCRStoragelocalStorage/JSONClient-side data persistenceAuthenticationCustom JWTSession managementDeploymentVercelServerless hosting
🚀 Getting Started
Prerequisites

Node.js 18+ and npm/yarn
Google Gemini API key
Git

Installation

Clone the repository

bashgit clone https://github.com/yourusername/ai-quiz-flashcard-generator.git
cd ai-quiz-flashcard-generator

Install dependencies

bashnpm install
# or
yarn install

Set up environment variables

bashcp .env.example .env.local

Add your API keys (see Environment Variables)
Run the development server

bashnpm run dev
# or
yarn dev

Open your browser
Navigate to http://localhost:3000

🔧 Environment Variables
Create a .env.local file in the root directory:
env# Google Gemini AI API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
Getting API Keys
Google Gemini API Key:

Go to Google AI Studio
Sign in with your Google account
Create a new API key
Copy the key to your .env.local file

📁 Project Structure
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx        # Main dashboard
│   ├── upload/page.tsx           # File upload interface
│   ├── review/page.tsx           # Flashcard review
│   ├── quiz/[id]/page.tsx        # Quiz interface
│   ├── profile/page.tsx          # User profile
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── upload/
│   │   ├── generate/
│   │   └── review/
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   ├── dashboard/                # Dashboard components
│   ├── upload/                   # Upload components
│   ├── quiz/                     # Quiz components
│   └── flashcard/                # Flashcard components
├── lib/                          # Utility libraries
│   ├── ai/gemini.ts             # Gemini AI integration
│   ├── ocr/tesseract.ts         # OCR processing
│   ├── pdf/parser.ts            # PDF text extraction
│   ├── auth/session.ts          # Authentication logic
│   ├── storage/database.ts      # Data management
│   └── spaced-repetition/       # SR algorithm
├── types/                        # TypeScript definitions
│   └── index.ts
├── public/                       # Static assets
└── README.md
🔌 API Endpoints
Authentication

POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout

Content Management

POST /api/upload - File upload and text extraction
POST /api/generate - AI content generation
GET /api/dashboard - User dashboard data

Learning Features

GET /api/quiz/[id] - Fetch quiz questions
GET /api/flashcards/[uploadId] - Fetch flashcards
POST /api/review - Submit flashcard rating

🤖 AI Integration
How We Use Google Gemini API
Our application leverages Google Gemini's advanced language understanding to transform raw educational content into structured learning materials.
Quiz Generation Process

Content Analysis: Extract and clean text from uploaded materials
Intelligent Questioning: Generate diverse question types covering key concepts
Answer Validation: Ensure accurate answers with detailed explanations
Difficulty Balancing: Mix easy, medium, and challenging questions

Example Prompt Structure:
javascriptconst quizPrompt = `
Generate 8 multiple-choice questions from this educational content.
Focus on key concepts, definitions, and relationships.

Content: ${extractedText}

Return JSON format:
{
  "questions": [
    {
      "question": "Clear, specific question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}
`;
Flashcard Generation Process

Concept Extraction: Identify key terms and concepts
Question Formulation: Create clear, concise questions
Answer Optimization: Provide comprehensive but digestible answers
Topic Tagging: Organize cards by subject area

Example Prompt Structure:
javascriptconst flashcardPrompt = `
Create 12 flashcard pairs from this content.
Focus on definitions, key concepts, and important relationships.

Content: ${extractedText}

Return JSON format:
{
  "flashcards": [
    {
      "question": "Front of card (question/term)",
      "answer": "Back of card (definition/explanation)",
      "topic": "Subject category"
    }
  ]
}
`;
AI Quality Assurance

Content Validation: Verify generated content accuracy
Duplicate Detection: Prevent similar questions/cards
Difficulty Assessment: Balance question complexity
Topic Coherence: Ensure logical content organization

🎯 Spaced Repetition Algorithm
Our implementation uses a simplified SM-2 (SuperMemo 2) algorithm:
typescriptfunction calculateNextReview(rating: 'easy' | 'medium' | 'hard', currentInterval: number) {
  const intervals = {
    hard: Math.max(1, Math.floor(currentInterval * 0.8)),
    medium: Math.max(1, Math.floor(currentInterval * 1.3)),
    easy: Math.max(1, Math.floor(currentInterval * 2.5))
  };
  
  return intervals[rating];
}
Rating System:

Hard (😰): Review tomorrow (1 day)
Medium (🤔): Review in 2-3 days
Easy (😊): Review in 4+ days

🎨 Key Features Deep Dive
Upload Processing Pipeline

File Validation: Check file type and size limits
Content Extraction:

PDFs: Use pdf-parse for text extraction
Images: OCR with Tesseract.js
Text: Direct processing


Text Cleaning: Remove formatting, normalize content
Preview Generation: Show extracted content to user
AI Processing: Generate quizzes and flashcards

Quiz Experience

Adaptive Timing: 30-second default with pause option
Immediate Feedback: Show correct/incorrect instantly
Detailed Explanations: Learn from mistakes
Performance Tracking: Monitor improvement over time
Retake Options: Practice until perfect

Flashcard Review Flow

Card Presentation: Clean, distraction-free interface
Smooth Animations: Satisfying flip animations
Self-Assessment: Rate your recall honestly
Progress Visualization: See daily/weekly progress
Streak Tracking: Maintain learning momentum

📊 Performance Optimizations

Lazy Loading: Load content as needed
Image Optimization: Next.js automatic optimization
Code Splitting: Route-based splitting
Caching: Strategic localStorage usage
Debounced Search: Smooth filtering experience

🔒 Security Features

Input Validation: Sanitize all user inputs
XSS Protection: Prevent cross-site scripting
Rate Limiting: Protect against API abuse
File Upload Security: Validate file types and sizes
JWT Authentication: Secure session management

🚀 Deployment
Deploy to Vercel (Recommended)

Connect GitHub: Link your repository to Vercel
Configure Environment: Add environment variables in Vercel dashboard
Deploy: Automatic deployment on push to main branch

bash# Install Vercel CLI
npm i -g vercel

# Deploy from local
vercel --prod
Environment Variables for Production
envGOOGLE_GEMINI_API_KEY=your_production_api_key
JWT_SECRET=your_production_jwt_secret
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NODE_ENV=production
🧪 Testing
bash# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
📈 Future Enhancements

 Supabase Integration: Full database and authentication
 Collaborative Study: Share flashcard decks with friends
 Advanced Analytics: Detailed learning insights
 Mobile App: React Native companion
 Offline Mode: Study without internet
 Export Options: PDF/Anki deck exports
 Voice Recognition: Audio-based flashcard review
 Multi-language Support: Internationalization

🤝 Contributing
We welcome contributions! Please see our Contributing Guide for details.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

Google Gemini AI - Powering our content generation
Next.js Team - Amazing React framework
Tailwind CSS - Beautiful utility-first CSS
Tesseract.js - OCR capabilities
Vercel - Seamless deployment platform

📞 Support

📧 Email: lakshmisrinijavennam@gmail.com
💬 Discord: Join our community



