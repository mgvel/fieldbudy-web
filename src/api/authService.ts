import { httpClient } from './httpClient';
import { AuthResponse } from '../types/user';

export const authService = {
  login: (email: string, password: string, rememberMe: boolean) => {
    return httpClient.post<AuthResponse>(
      '/user/login',
      { email, password, rememberMe },
      { requiresAuth: false }
    );
  },
  
  logout: () => {
    
    return Promise.resolve();
  },
  
  forgotPassword: (email: string) => {
    return httpClient.post<{ message: string }>(
      '/user/forgot-password',
      { email },
      { requiresAuth: false }
    );
  },
  
  setNewPassword: (token: string, password: string) => {
    return httpClient.post<{ message: string }>(
      '/user/set-new-password',
      { token, password },
      { requiresAuth: false }
    );
  }
};