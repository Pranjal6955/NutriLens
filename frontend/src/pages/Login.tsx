import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => emailPattern.test(email) && password.length > 0, [email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      setLoading(false);
      const redirectState = location.state as { from?: string; payload?: unknown };
      const redirectTo = redirectState?.from || '/analysis';
      navigate(redirectTo, { replace: true, state: redirectState?.payload });
    } catch (err) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Unable to login. Please try again.';
      setError(message);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-y-auto px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-md rounded-3xl border border-[var(--glass-border)] bg-white/70 p-8 shadow-2xl backdrop-blur dark:bg-black/60'
      >
        <div className='mb-6 text-center'>
          <h1 className='text-3xl font-bold'>Welcome back</h1>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>Log in to continue your journey.</p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className='w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-gray-700'
              required
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-gray-700'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-primary transition'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}

          <button
            type='submit'
            disabled={!isValid || loading}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70'
          >
            {loading ? <Spinner label='Signing in...' /> : 'Login'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-600 dark:text-gray-400'>
          Don’t have an account?{' '}
          <Link to='/signup' className='font-semibold text-brand-primary hover:underline'>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
