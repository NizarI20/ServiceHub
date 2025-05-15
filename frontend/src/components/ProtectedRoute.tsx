import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'provider' | 'any';
}

const ProtectedRoute = ({ children, requiredRole = 'any' }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, token } = useAuth();

  useEffect(() => {
    // Log authentication state for debugging
    console.log('Auth state:', { isAuthenticated, isLoading, user, token });
  }, [isAuthenticated, isLoading, user, token]);

  // If still loading, show a loading spinner
  if (isLoading) {
    return <LoadingSpinner fullScreen size="lg" message="Authenticating..." />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  // If role check is required
  if (requiredRole !== 'any' && user.role !== requiredRole) {
    toast.error(`This page is only accessible to ${requiredRole}s`);
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and role check passes, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
