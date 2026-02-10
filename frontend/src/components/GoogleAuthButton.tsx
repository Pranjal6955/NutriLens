import React, { useEffect } from 'react';
import { FaGoogle } from 'react-icons/fa';

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
  text?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  text = 'Continue with Google',
}) => {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError();
            }
          },
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [onSuccess, onError]);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogleLogin}
      className='w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200
                 font-medium'
    >
      <FaGoogle className='w-5 h-5 text-red-500' />
      {text}
    </button>
  );
};
