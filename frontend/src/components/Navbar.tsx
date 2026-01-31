import { History, LogOut, User } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThemeToggle } from './ThemeToggle';
import { authService } from '../utils/auth';

interface NavbarProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export const Navbar = ({ showHistory, setShowHistory }: NavbarProps) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-[var(--glass-border)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img
            src="/Nutrilens_logo.png"
            alt="NutriLens Logo"
            className="w-18 h-18 object-contain"
          />
          <span className="text-2xl font-bold tracking-tight">
            Nutri<span className="text-brand-primary transition-colors">Lens</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/Pranjal6955/NutriLens/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full
               border border-[var(--glass-border)]
               text-sm font-medium
               text-gray-700 dark:text-gray-300
               transition-all duration-300
               hover:bg-gray-900 dark:hover:bg-white/10
               hover:text-white hover:border-white/50
               hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105"
          >
            <FaGithub className="text-base" />
            Star our Repo
          </a>

          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                aria-label="History"
              >
                <History className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-brand-primary transition-colors" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-black/5 dark:bg-white/5">
                  <User className="w-5 h-5 text-brand-primary" />
                  <span className="text-sm font-medium hidden sm:inline">{user?.userName}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-full transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
