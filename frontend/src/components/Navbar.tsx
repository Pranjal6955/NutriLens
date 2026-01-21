/* eslint-disable prettier/prettier */
import { History } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export const Navbar = ({ showHistory, setShowHistory }: NavbarProps) => {
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
               hover:bg-black/5 dark:hover:bg-white/10
               hover:text-brand-primary
               transition-colors'
          >
            <FaGithub className='text-base' />⭐ Star our Repo
          </a>

          <ThemeToggle />

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
