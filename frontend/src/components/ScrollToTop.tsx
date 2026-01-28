import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className='fixed bottom-8 left-8 z-50 p-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-1 focus:outline-none animate-fadeIn group cursor-pointer'
      aria-label='Scroll to top'
    >
      <ArrowUp size={24} className='group-hover:scale-110 transition-transform duration-200' />
    </button>
  );
}
