import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const SignUp = () => {
    const { loginWithRedirect, isAuthenticated, user, isLoading, logout } = useAuth0();
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
            const userData = await apiService.getProfile(user.sub!);
            // User already exists, store data and redirect to home
            sessionStorage.setItem('user', JSON.stringify(userData));
            if (user.sub) {
                sessionStorage.setItem('token', user.sub);
            }
            navigate('/home-board');
        } catch (error: any) {
            console.error('Error checking existing user:', error);
            if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
                // User doesn't exist yet, redirect to username selection
                navigate('/username-selection');
            } else {
                // Some other error, redirect to username selection as fallback
                navigate('/username-selection');
            }
        }
    };

    const handleSignUp = () => {
        setError(null);
        loginWithRedirect({
            authorizationParams: {
                screen_hint: 'signup',
            },
        });
    };

    const handleStartOver = () => {
        // Clear session storage
        sessionStorage.clear();
        // Logout from Auth0 and redirect to signup page
        logout({
            logoutParams: {
                returnTo: window.location.origin + '/signup',
            },
        });
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-purple-500">
                        Join ScatterNote and start organizing your thoughts
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <div className="space-y-6">
                    <Button 
                        onClick={handleSignUp}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-3 px-4 rounded-md shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Sign up with Auth0
                    </Button>
                    
                    <div className="text-center">
                        <p className="text-sm text-purple-600">
                            Already have an account?{' '}
                            <button 
                                onClick={() => navigate('/')}
                                className="font-medium text-purple-500 hover:text-purple-400 underline"
                            >
                                Sign in here
                            </button>
                        </p>
                    </div>

                    <div className="pt-4 border-t border-purple-200">
                        <Button 
                            onClick={handleStartOver}
                            variant="outline"
                            className="w-full text-purple-600 border-purple-300 hover:bg-purple-50 font-medium py-2 px-4 rounded-md transition-all duration-200"
                        >
                            Start Over
                        </Button>
                        <p className="text-xs text-purple-500 text-center mt-2">
                            Clear all data and start fresh
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp; 