// src/components/RequireDummyPassword.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


export function RequireDummyPassword({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.isDummyPassword) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return children;
}
