import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../api/authService';
import logoWide from '../assets/logo-wide.png';

interface SetNewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function SetNewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get token from query params
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<SetNewPasswordFormData>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const password = watch('password');

  const setNewPasswordMutation = useMutation({
    mutationFn: (password: string) => {
      if (!token) {
        throw new Error('Password reset token is missing');
      }
      return authService.setNewPassword(token, password);
    },
    onSuccess: () => {
      navigate('/login', { 
        state: { message: 'Your password has been set successfully. You can now log in.' } 
      });
    },
  });

  const onSubmit = (data: SetNewPasswordFormData) => {
    setNewPasswordMutation.mutate(data.password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <img 
            src={logoWide} 
            alt="Report Buddy" 
            className="h-10 w-auto"
          />
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Set New Password
        </h2>
        
        {!token ? (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  Invalid or expired token. Please request a new password reset link.
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Request new link
              </Link>
            </div>
          </div>
        ) : (
          <>
            {setNewPasswordMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {(setNewPasswordMutation.error as Error).message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`
                        appearance-none block w-full px-3 py-2 border 
                        ${errors.password ? 'border-red-300' : 'border-gray-300'} 
                        rounded-md shadow-sm placeholder-gray-400 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                        pr-10 sm:text-sm
                      `}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                          message: 'Password must include uppercase, lowercase, number and special character'
                        }
                      })}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`
                        appearance-none block w-full px-3 py-2 border 
                        ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} 
                        rounded-md shadow-sm placeholder-gray-400 focus:outline-none 
                        focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                        pr-10 sm:text-sm
                      `}
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={setNewPasswordMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {setNewPasswordMutation.isPending ? 'Setting password...' : 'Set new password'}
                </button>
              </div>
              
              <div className="text-sm text-center">
                <Link 
                  to="/login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}