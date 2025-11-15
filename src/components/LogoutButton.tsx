import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const LogoutButton = () => {
  const { logout: auth0Logout } = useAuth0();
  const { clearUser } = useAuth();

  const handleLogout = () => {
    // Clear user from store
    clearUser();
    
    // Clear any remaining session storage
    sessionStorage.clear();
    localStorage.removeItem('user-storage');
    
    // Logout from Auth0
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
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