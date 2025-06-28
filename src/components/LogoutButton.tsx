import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Logout from Auth0
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    
    // Navigate to login page
    navigate('/');
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
    >
      Sign Out
    </Button>
  );
};

export default LogoutButton; 