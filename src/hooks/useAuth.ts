import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { User, UserRole } from '../types/user';
import { toast } from 'react-toastify'; 

export function useAuth() {
  const navigate = useNavigate();
  const { token, user, isAuthenticated, login, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ 
      email, 
      password, 
      rememberMe = false 
    }: { 
      email: string; 
      password: string; 
      rememberMe: boolean;
    }) => {
      return authService.login(email, password, rememberMe);
    },
    onSuccess: (data) => {
      const { token, user } = data.payload;
      login(token, user);
      toast.success(`Welcome back, ${user.fullName}!`, {
        position: "top-right",
        autoClose: 3000,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      toast.info('You have been logged out successfully.', {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed. Please try again.', {
        position: "top-right",
        autoClose: 5000,
      });
    },
    onSettled: () => {
      logout();
      navigate('/login');
    },
  });

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role as UserRole);
    }
    
    return user.role === roles;
  };

  return {
    token,
    user,
    isAuthenticated,
    hasRole,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}