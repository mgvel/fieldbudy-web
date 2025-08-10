import { useAuth } from './hooks/useAuth';
import { Navigate, useRoutes } from 'react-router-dom';
import { routes } from './routes';

export default function AppRoutes() {
  const { user } = useAuth();


  const processedRoutes = routes.map(route => {
    if (route.condition && !route.condition(user)) {
      return { ...route, element: <Navigate to={route.redirect} replace /> };
    }
    return route;
  });

  const element = useRoutes(processedRoutes);
  return element;
}
