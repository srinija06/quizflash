
import { useState } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/storage/database';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const Profile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveProfile = () => {
    if (!user) return;
    
    setIsSaving(true);
    
    setTimeout(() => {
      try {
        // Update user in database
        db.updateUser(user.id, { name, email });
        
        // Update user in localStorage for our prototype
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.id === user.id) {
          storedUser.name = name;
          storedUser.email = email;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
        
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error('Failed to update profile');
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };
  
  // Calculate statistics
  const calculateAccuracy = () => {
    if (!user) return 0;
    
    const { totalCorrect, totalAttempts } = user.stats;
    if (totalAttempts === 0) return 0;
    
    return (totalCorrect / totalAttempts) * 100;
  };
  
  const accuracy = calculateAccuracy();
  
  // Chart data
  const chartData = [
    { name: 'Correct', value: user?.stats.totalCorrect || 0, color: '#4ade80' },
    { name: 'Incorrect', value: (user?.stats.totalAttempts || 0) - (user?.stats.totalCorrect || 0), color: '#f87171' },
  ].filter(item => item.value > 0);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
                <CardDescription>
                  Your learning progress overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Uploads</div>
                    <div className="text-2xl font-bold">{user?.stats.totalUploads || 0}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Quizzes</div>
                    <div className="text-2xl font-bold">{user?.stats.totalQuizzes || 0}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Flashcards</div>
                    <div className="text-2xl font-bold">{user?.stats.totalFlashcards || 0}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <div className="text-2xl font-bold">{accuracy.toFixed(0)}%</div>
                  </div>
                </div>
                
                {user?.stats.totalAttempts && user.stats.totalAttempts > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-2">Answer Distribution</h4>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

export default Profile;
