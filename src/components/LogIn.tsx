import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const LogIn = () => {
    const { loginWithRedirect, isLoading } = useAuth0();
    const { isAuthenticated, user, handleAuthRedirect, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            handleAuthRedirect();
        }
    }, [isAuthenticated, handleAuthRedirect]);

    const handleLogin = () => {
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

    // If already authenticated and user exists, redirect will happen via useEffect
    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-purple-600 font-medium">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center justify-center">
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
        </div>
    );
};

export default LogIn;    