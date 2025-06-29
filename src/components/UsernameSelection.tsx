import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '../services/api';

interface UsernameSelectionProps {
  onComplete: (userData: any) => void;
}

const UsernameSelection = ({ onComplete }: UsernameSelectionProps) => {
  const { user, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [isLoading, user, navigate]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userData = await apiService.createUserWithUsername({
        sub: user?.sub!,
        email: user?.email!,
        email_verified: user?.email_verified!,
        username: username.trim(),
        name: user?.name!,
        nickname: user?.nickname!,
        picture: user?.picture!,
        updated_at: user?.updated_at!
      });
      
      // Store user data in session storage
      sessionStorage.setItem('user', JSON.stringify(userData));
      if (user?.sub) {
        sessionStorage.setItem('token', user.sub);
      }
      
      onComplete(userData);
    } catch (error: any) {
      console.error('Error creating user with username:', error);
      
      if (error.message?.includes('Username is already taken')) {
        setError('This username is already taken. Please choose another one.');
      } else {
        setError('Failed to create your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-600">
            Choose your username
          </h2>
          <p className="mt-2 text-center text-sm text-purple-500">
            This will be your unique identifier on ScatterNote
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-purple-700">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className="mt-1 block w-full px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-purple-500">
              3-20 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-md shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSelection; 