import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logoWide from '../assets/logo-wide.png';


interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoggingIn, loginError } = useAuth();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = (data: SignInFormData) => {
    login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              Login to your account
            </h2>
            
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {(loginError as Error).message || 'Invalid credentials. Please try again.'}
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
                
                <div>
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="password" 
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="text-sm">
                      <Link 
                        to="/forgot-password" 
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        I forgot password
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                    {...register('rememberMe')}
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me on this device
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              
              {/* <div className="text-sm text-center">
                <Link 
                  to="/set-new-password" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Registered New Users
                </Link>
              </div> */}
            </form>

        </div>
      </div>
    </div>
  );
}