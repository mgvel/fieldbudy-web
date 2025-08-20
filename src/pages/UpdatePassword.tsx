import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import logoWide from '../assets/logo-wide.png';
import {Eye, EyeOff } from 'lucide-react';


interface UpdatePasswordFormData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export function UpdatePassword() {
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);  // State for button loading
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<UpdatePasswordFormData>();

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      setIsLoggingIn(true); // Show loading state on submit

      // Corrected Axios POST request
      const response = await axiosInstance.put('/user/update-password', {
        email: data.email,
        newPassword: data.newPassword
      });

      if (response.data) {
        useAuthStore.getState().setUser({ isDummyPassword: false });
        toast.success("Password updated successfully!");
        navigate('/dashboard', { replace: true });
      } else {
        toast.error("Failed to update password");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoggingIn(false); // Hide loading state after the request
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          <div className="flex justify-center bg-blue-950">
            <img 
              src={logoWide} 
              alt="Report Buddy" 
              className="h-10 w-auto"
            />
          </div>
          
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Set New Password
          </h2>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`
                      appearance-none block w-full px-3 py-2 border 
                      ${errors.email ? 'border-red-300' : 'border-gray-300'} 
                      rounded-md shadow-sm placeholder-gray-400 focus:outline-none 
                      focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                      sm:text-sm
                    `}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <TextField
                fullWidth
                margin="normal"
                label="New Password"
                type="password"
                {...register('newPassword', { 
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Confirm New Password"
                type={showPassword ? "text" : "password"}
                {...register('confirmPassword', { 
                  required: 'Please confirm your new password',
                  validate: value => 
                    value === watch('newPassword') || "Passwords don't match"
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  )
                }}
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Updating...' : 'Update Password'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
