import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validatePasswordStrength = (pwd: string): boolean => {
  if (pwd.length < 8) return false;
  if (!/[A-Z]/.test(pwd)) return false; // uppercase
  if (!/[a-z]/.test(pwd)) return false; // lowercase
  if (!/[0-9]/.test(pwd)) return false; // number
  if (!/[!@#$%^&*]/.test(pwd)) return false; // special char
  return true;
};

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    const hasName = name.trim().length > 0;
    const validEmail = emailPattern.test(email);
    const validPassword = validatePasswordStrength(password);
    const matches = password === confirmPassword;
    return hasName && validEmail && validPassword && matches;
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Unable to sign up. Please try again.';
      // Map backend error to user-friendly message
      if (message === 'User already exists') {
        message = 'An account with this email already exists. Please log in instead.';
      }
      setError(message);
    } finally {
      setLoading(false);
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
          <h1 className='text-3xl font-bold'>Create account</h1>
          <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>Join NutriLens in seconds.</p>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Alex Nutrition'
              className='w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-gray-700'
              required
            />
          </div>

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
                placeholder='At least 8 characters'
                minLength={8}
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
            <p className='text-xs text-gray-500'>
              Must contain uppercase, lowercase, number, and special character (!@#$%^&*).
            </p>
            {password && !validatePasswordStrength(password) && (
              <p className='text-xs text-red-500'>
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>Confirm Password</label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Re-enter password'
                className='w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 pr-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-gray-700'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-primary transition'
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className='text-xs text-red-500'>Passwords do not match.</p>
            )}
          </div>

          {error && <p className='text-sm text-red-500'>{error}</p>}
          {success && <p className='text-sm text-green-600'>{success}</p>}

          <button
            type='submit'
            disabled={!isValid || loading}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70'
          >
            {loading ? <Spinner label='Creating account...' /> : 'Sign up'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-600 dark:text-gray-400'>
          Already have an account?{' '}
          <Link to='/login' className='font-semibold text-brand-primary hover:underline'>
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
