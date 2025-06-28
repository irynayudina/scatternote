import './App.css'
import LogIn from './components/LogIn'
import SignUp from './components/SignUp'
import UsernameSelection from './components/UsernameSelection'
import Desktop from './components/Desktop'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeBoard from './components/Desk';
import { Auth0Provider } from '@auth0/auth0-react';
import { auth0Config } from './auth/auth0-config';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/username-selection" 
            element={
              <ProtectedRoute>
                <UsernameSelection onComplete={() => {
                  // This will be handled by the UsernameSelection component
                  window.location.href = '/home-board';
                }} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/home-board" 
            element={
              <ProtectedRoute>
                <HomeBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/desktop/:id" 
            element={
              <ProtectedRoute>
                <Desktop />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  )
}

export default App
