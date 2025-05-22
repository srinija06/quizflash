
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';

const Index = () => {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/dashboard');
    }
  }, [status, user, navigate]);
  
  const features = [
    {
      title: "AI-Powered Quiz Generation",
      description: "Upload lecture materials and automatically create quizzes tailored to your content.",
      icon: "📝",
    },
    {
      title: "Smart Flashcards",
      description: "Generate comprehensive flashcard sets with spaced repetition to optimize your learning.",
      icon: "🧠",
    },
    {
      title: "Multiple Format Support",
      description: "Process content from PDFs, images with OCR, or directly paste your text.",
      icon: "📄",
    },
    {
      title: "Personalized Learning",
      description: "Track your progress and focus on areas that need improvement.",
      icon: "📈",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-secondary py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="bg-primary rounded-2xl p-3 text-primary-foreground font-bold text-3xl mb-2">
                QF
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter max-w-2xl">
                Transform Your Study Materials into Interactive Learning Tools
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[700px]">
                Upload your lecture notes, slides, or textbooks and let our AI create customized quizzes
                and flashcards to enhance your learning experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/auth/register">Get Started for Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How QuizFlash Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Simple 3-Step Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Content</h3>
                <p className="text-muted-foreground">
                  Upload your PDF files, images, or paste your text directly into the platform.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your content and generates quizzes and flashcards automatically.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-primary-foreground font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Learn & Review</h3>
                <p className="text-muted-foreground">
                  Take quizzes, practice with flashcards, and track your progress as you learn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold">Ready to Transform Your Learning?</h2>
              <p className="text-muted-foreground text-lg max-w-[600px]">
                Join thousands of students who are studying smarter, not harder.
              </p>
              <Button asChild size="lg" className="rounded-full mt-6">
                <Link to="/auth/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1 text-primary-foreground font-bold text-sm">Q</div>
            <span className="text-sm font-semibold">QuizFlash</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 QuizFlash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
