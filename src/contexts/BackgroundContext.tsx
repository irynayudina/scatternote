import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService } from '../services/api';
import { getBackgroundImageUrl } from '../config/backgroundImages';

interface BackgroundContextType {
  desktopBackground: string | null;
  backgroundImageUrl: string | null;
  backgroundStyle: React.CSSProperties;
  isLoading: boolean;
  refreshBackground: () => Promise<void>;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const [desktopBackground, setDesktopBackground] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDesktopBackground = async () => {
    if (!auth0User || !isAuthenticated) {
      setDesktopBackground(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get user data from session storage
      const userData = sessionStorage.getItem('user');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const background = await apiService.getDesktopBackground(parsedUser.id);
        setDesktopBackground(background);
      } else {
        setDesktopBackground(null);
      }
    } catch (error) {
      console.error('Error loading desktop background:', error);
      setDesktopBackground(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBackground = async () => {
    await loadDesktopBackground();
  };

  useEffect(() => {
    if (!auth0Loading) {
      loadDesktopBackground();
    }
  }, [auth0User, isAuthenticated, auth0Loading]);

  // Get background image URL
  const backgroundImageUrl = getBackgroundImageUrl(desktopBackground);
  
  // Create background style
  const backgroundStyle = backgroundImageUrl 
    ? {
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }
    : {
        background: 'linear-gradient(to bottom right, #fdf2f8, #faf5ff, #fdf2f8)',
        minHeight: '100vh'
      };

  const value: BackgroundContextType = {
    desktopBackground,
    backgroundImageUrl,
    backgroundStyle,
    isLoading,
    refreshBackground
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}; 