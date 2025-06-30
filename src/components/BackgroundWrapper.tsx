import React from 'react';
import type { ReactNode } from 'react';
import { useBackground } from '../contexts/BackgroundContext';

interface BackgroundWrapperProps {
  children: ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  const { backgroundStyle, isLoading } = useBackground();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={backgroundStyle}>
      {children}
    </div>
  );
};

export default BackgroundWrapper; 