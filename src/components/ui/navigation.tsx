
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50';
  };
  
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1.5 text-primary-foreground font-bold text-lg">Q</div>
            <span className="text-lg font-semibold">QuizFlash</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-5">
          {user ? (
            <>
              <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/upload" className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive('/upload')}`}>
                Upload
              </Link>
              <Link to="/review" className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive('/review')}`}>
                Review
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="rounded-full bg-purple-100 w-8 h-8 flex items-center justify-center">
                    <span className="font-medium text-purple-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/auth/login" className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive('/auth/login')}`}>
                Login
              </Link>
              <Link to="/auth/register" className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive('/auth/register')}`}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
