import { useState } from 'react';
import { History, LogOut } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

interface NavbarProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export const Navbar = ({ showHistory, setShowHistory }: NavbarProps) => {
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className='fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-[var(--glass-border)] transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <img
            src='/Nutrilens_logo.png'
            alt='NutriLens Logo'
            className='w-18 h-18 object-contain'
          />
          <span className='text-2xl font-bold tracking-tight'>
            Nutri<span className='text-brand-primary transition-colors'>Lens</span>
          </span>
        </div>
        <div className='flex items-center space-x-4'>
          {/* Star our Repo CTA */}
          <a
            href='https://github.com/Pranjal6955/NutriLens/'
            target='_blank'
            rel='noopener noreferrer'
            className='hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full
               border border-[var(--glass-border)]
               text-sm font-medium
               text-gray-700 dark:text-gray-300
               transition-all duration-300
               hover:bg-gray-900 dark:hover:bg-white/10
               hover:text-white hover:border-white/50
               hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105'
          >
            <FaGithub className='text-base' />
            Star our Repo
          </a>

          <ThemeToggle />

          {status === 'authenticated' ? (
            <div className='flex items-center gap-2'>
              <div className='hidden sm:flex flex-col items-end text-right'>
                <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                  {user?.userName}
                </span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-white/40 hover:bg-black/5 dark:text-gray-200 dark:hover:bg-white/10'
              >
                {isLoggingOut ? <Spinner /> : <LogOut className='h-4 w-4' />} Logout
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <button
                onClick={() => navigate('/login')}
                className='rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:text-brand-primary dark:text-gray-200'
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className='rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg'
              >
                Sign up
              </button>
            </div>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className='p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors'
            aria-label='History'
          >
            <History className='w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-brand-primary transition-colors' />
          </button>
        </div>
      </div>
    </nav>
  );
};
