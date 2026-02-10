import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../utils/auth';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message =
        (error as ErrorResponse)?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true);
    try {
      await authService.googleAuth(credential);
      toast.success('Google login successful!');
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const message =
        (error as ErrorResponse)?.response?.data?.message ||
        'Google login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login was cancelled or failed.');
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <div className='glass rounded-2xl p-8 shadow-xl'>
          <div className='text-center mb-8'>
            <img
              src='/Nutrilens_logo.png'
              alt='NutriLens Logo'
              className='w-16 h-16 mx-auto mb-4'
            />
            <h1 className='text-3xl font-bold mb-2'>Welcome Back</h1>
            <p className='text-gray-600 dark:text-gray-400'>Sign in to your NutriLens account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text='Sign in with Google'
            />

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300 dark:border-gray-600' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white dark:bg-gray-800 text-gray-500'>
                  Or continue with email
                </span>
              </div>
            </div>
            <div>
              <label htmlFor='email' className='block text-sm font-medium mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  type='email'
                  id='email'
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-brand-primary focus:border-transparent
                           transition-colors'
                  placeholder='Enter your email'
                />
              </div>
              {errors.email && <p className='mt-1 text-sm text-red-500'>{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  className='w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-brand-primary focus:border-transparent
                           transition-colors'
                  placeholder='Enter your password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
              {errors.password && (
                <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>
              )}
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Forgot your password? Contact support
              </span>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-3 px-4 rounded-lg
                       transition-colors duration-200 flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <>
                  <LogIn className='w-5 h-5' />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-gray-600 dark:text-gray-400'>
              Don't have an account?{' '}
              <Link
                to='/signup'
                className='text-brand-primary hover:text-brand-primary/80 font-medium transition-colors'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
