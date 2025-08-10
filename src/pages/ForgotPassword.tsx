import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/authService';
import logoWide from '../assets/logo-wide.png';

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
    }
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => {
      return authService.forgotPassword(email);
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data.email);
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
          Reset your password
        </h2>
        
        {isSubmitted ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Password reset instructions have been sent to your email.
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {forgotPasswordMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {(forgotPasswordMutation.error as Error).message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              
              <div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
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