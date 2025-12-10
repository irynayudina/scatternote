import './App.css'
import LogIn from '@/components/pages/LogIn/LogIn'
import SignUp from '@/components/pages/SignUp/SignUp'
import UsernameSelection from '@/components/pages/UsernameSelection/UsernameSelection'
import Desktop from '@/components/pages/Desktop/Desktop'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeBoard from '@/components/pages/Desk/Desk';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { auth0Config } from '@/auth/auth0-config';
import ProtectedRoute from '@/components/pages/ProtectedRoute';
import KnowledgeBase from '@/components/pages/KnowledgeBase/KnowledgeBase';
import Settings from '@/components/pages/Settings/Settings';
import { BackgroundProvider } from './contexts/BackgroundContext';
import BackgroundWrapper from '@/components/pages/BackgroundWrapper';
import { ApolloProvider } from '@apollo/client';
import { client, setTokenGetter } from '@/services/graphql-api';
import GraphQLTest from '@/components/pages/GraphQLTest/GraphQLTest';
import { useEffect } from 'react';

// Component to set up token getter after Auth0 is initialized
function TokenGetterSetup() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    setTokenGetter(async () => {
      if (!isAuthenticated) return null;
      try {
        return await getAccessTokenSilently();
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  return null;
}

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <TokenGetterSetup />
      <ApolloProvider client={client}>
        <BackgroundProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/test-graphql" element={<GraphQLTest />} />
              <Route 
                path="/username-selection" 
                element={
                  <ProtectedRoute>
                    <BackgroundWrapper>
                      <UsernameSelection onComplete={() => {
                        // This will be handled by the UsernameSelection component
                        window.location.href = '/home-board';
                      }} />
                    </BackgroundWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/home-board" 
                element={
                  <ProtectedRoute>
                    <BackgroundWrapper>
                      <HomeBoard />
                    </BackgroundWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/desktop/:id" 
                element={
                  <ProtectedRoute>
                    <BackgroundWrapper>
                      <Desktop />
                    </BackgroundWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/knowledge-base" 
                element={
                  <ProtectedRoute>
                    <BackgroundWrapper>
                      <KnowledgeBase />
                    </BackgroundWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <BackgroundWrapper>
                      <Settings />
                    </BackgroundWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </BrowserRouter>
        </BackgroundProvider>
      </ApolloProvider>
    </Auth0Provider>
  )
}

export default App
