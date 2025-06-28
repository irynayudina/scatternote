import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LogIn = () => {
    const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Check if user already exists in our backend
            checkExistingUser();
        }
    }, [isAuthenticated, user]);

    const checkExistingUser = async () => {
        if (!user) return;
        
        try {
            const response = await fetch(`http://localhost:3000/auth/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.sub}` // This would need proper JWT token in production
                },
            });

            if (response.ok) {
                const userData = await response.json();
                // User already exists, store data and redirect to home
                sessionStorage.setItem('user', JSON.stringify(userData));
                if (user.sub) {
                    sessionStorage.setItem('token', user.sub);
                }
                navigate('/home-board');
            } else if (response.status === 401) {
                // User doesn't exist yet, redirect to username selection
                navigate('/username-selection');
            } else {
                // Some other error, redirect to username selection as fallback
                navigate('/username-selection');
            }
        } catch (error) {
            console.error('Error checking existing user:', error);
            // On error, redirect to username selection as fallback
            navigate('/username-selection');
        }
    };

    const handleLogin = () => {
        setError(null);
        loginWithRedirect();
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-600">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-purple-500">
                        Welcome back to ScatterNote
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <div className="space-y-6">
                    <Button 
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-md shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Sign in with Auth0
                    </Button>
                    
                    <div className="text-center">
                        <p className="text-sm text-purple-600">
                            Don't have an account?{' '}
                            <button 
                                onClick={() => navigate('/signup')}
                                className="font-medium text-purple-500 hover:text-purple-400 underline"
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogIn;    