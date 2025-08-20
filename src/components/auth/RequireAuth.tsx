import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/user';
// (optional) import your store to read hydration status if you want

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1) Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2) Force users with dummy password to update it first
  //    Allow them to remain on /update-password to avoid a loop.
  if (user?.isDummyPassword && location.pathname !== '/update-password') {
    return <Navigate to="/update-password" state={{ from: location }} replace />;
  }

  // (Keep this reverse check if user already updated and is on /update-password)
  if (!user?.isDummyPassword && location.pathname === '/update-password') {
    return <Navigate to="/dashboard" replace />;
  }

  // 3) Role gating
  if (allowedRoles && user) {
    const hasAllowedRole = allowedRoles.includes(user.role as UserRole);
    if (!hasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
