import { useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useUserStore } from '@/stores/userStore';

/**
 * Centralized authentication hook that manages:
 * - Auth0 authentication state
 * - Access token retrieval
 * - User profile synchronization with backend
 * - Navigation based on auth state
 */
export const useAuth = () => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading: auth0Loading,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0();

  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const setError = useUserStore((state) => state.setError);
  const clearUser = useUserStore((state) => state.clearUser);

  /**
   * Get the current access token from Auth0
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  /**
   * Check if user exists in backend and sync user data
   */
  const syncUserProfile = useCallback(async (): Promise<boolean> => {
    if (!auth0User || !isAuthenticated) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to get existing user profile
      let userData;
      try {
        userData = await apiService.getProfile(auth0User.sub!);
      } catch (error: any) {
        // User doesn't exist yet - this is expected for new users
        if (error.message?.includes('not found') || error.status === 404) {
          return false; // User needs to complete registration
        }
        throw error; // Re-throw unexpected errors
      }

      if (userData) {
        // User exists, sync to store
        setUser(userData);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error syncing user profile:', error);
      setError(error.message || 'Failed to load user profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth0User, isAuthenticated, setUser, setLoading, setError]);

  /**
   * Create user in backend with username (for new users)
   */
  const createUserWithUsername = useCallback(async (username: string) => {
    if (!auth0User || !isAuthenticated) {
      throw new Error('Not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await apiService.createUserWithUsername({
        sub: auth0User.sub!,
        email: auth0User.email!,
        email_verified: auth0User.email_verified!,
        username: username.trim(),
        name: auth0User.name!,
        nickname: auth0User.nickname!,
        picture: auth0User.picture!,
        updated_at: auth0User.updated_at!,
      });

      setUser(userData);
      return userData;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create account';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [auth0User, isAuthenticated, setUser, setLoading, setError]);

  /**
   * Handle authentication redirect based on user state
   */
  const handleAuthRedirect = useCallback(async () => {
    if (auth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      // Not authenticated - stay on current page or redirect to login
      return;
    }

    // Check if user exists in backend
    const userExists = await syncUserProfile();
    const currentUser = useUserStore.getState().user;

    if (userExists && currentUser) {
      // User is fully set up, redirect to home
      navigate('/home-board', { replace: true });
    } else if (isAuthenticated && auth0User) {
      // User authenticated but not in backend - needs username selection
      navigate('/username-selection', { replace: true });
    }
  }, [auth0Loading, isAuthenticated, auth0User, syncUserProfile, navigate]);

  /**
   * Clear all auth data and logout
   */
  const logout = useCallback(async () => {
    clearUser();
    // Note: Actual logout is handled by LogoutButton component
  }, [clearUser]);

  return {
    // Auth0 state
    auth0User,
    isAuthenticated,
    isLoading: auth0Loading || useUserStore.getState().isLoading,
    auth0Error,
    
    // App user state
    user,
    
    // Methods
    getAccessToken,
    syncUserProfile,
    createUserWithUsername,
    handleAuthRedirect,
    logout,
    
    // Store methods (exposed for convenience)
    setError,
    clearUser,
  };
};

