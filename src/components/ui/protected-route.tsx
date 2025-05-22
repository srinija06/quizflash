
import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Additional logic for unauthenticated users if needed
      console.log('User is not authenticated');
    }
  }, [status]);
  
  if (status === 'loading') {
    // Show loading indicator while checking authentication status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 rounded bg-muted"></div>
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (status === 'unauthenticated') {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If user is authenticated, render the children components
  return <>{children}</>;
}
