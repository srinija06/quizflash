
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  
  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll mock a successful login with sample user data
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        createdAt: new Date(),
        stats: {
          totalUploads: 0,
          totalFlashcards: 0,
          totalQuizzes: 0,
          totalCorrect: 0,
          totalAttempts: 0,
        }
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setStatus('authenticated');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    try {
      // For demo purposes, we'll mock a successful registration
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date(),
        stats: {
          totalUploads: 0,
          totalFlashcards: 0,
          totalQuizzes: 0,
          totalCorrect: 0,
          totalAttempts: 0,
        }
      };
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setStatus('authenticated');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setStatus('unauthenticated');
  };
  
  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
