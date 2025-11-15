import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, syncUserProfile } = useAuth();

  useEffect(() => {
    // If authenticated but user not loaded, try to sync
    if (isAuthenticated && !user && !isLoading) {
      syncUserProfile();
    }
  }, [isAuthenticated, user, isLoading, syncUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // For routes that require a complete user profile (not just Auth0 auth)
  // We allow access but components will handle redirect if needed
  return <>{children}</>;
};

export default ProtectedRoute; 