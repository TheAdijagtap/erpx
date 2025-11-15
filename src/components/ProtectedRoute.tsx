import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('auth_token');
      const expires = sessionStorage.getItem('auth_expires');

      if (!token || !expires) {
        setIsAuthenticated(false);
        return;
      }

      const expiresDate = new Date(expires);
      const now = new Date();

      if (now > expiresDate) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_expires');
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
