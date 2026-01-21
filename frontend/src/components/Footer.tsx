/* eslint-disable prettier/prettier */
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className='mt-20 border-t border-black/10 dark:border-white/15 bg-[var(--bg-color)]'>
      <div className='mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10'>
        {/* Brand */}
        <div>
          <img src='/Nutrilens_logo.png' alt='NutriLens Logo' className='w-20 mb-3' />
          <p className='text-sm text-slate-500 dark:text-slate-400 max-w-xs'>
            AI-powered nutrition insights to help you make healthier food choices.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className='font-semibold mb-3'>Product</h4>
          <ul className='space-y-2 text-sm text-slate-500 dark:text-slate-400'>
            <li>
              <a href='/' className='hover:text-[var(--primary-color)]'>
                Home
              </a>
            </li>
            <li>
              <a href='/analysis' className='hover:text-[var(--primary-color)]'>
                Analysis
              </a>
            </li>
            <li>
              <button
                onClick={() => window.dispatchEvent(new Event('toggleHistory'))}
                className='hover:text-[var(--primary-color)]'
              >
                History
              </button>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className='font-semibold mb-3'>Resources</h4>
          <ul className='space-y-2 text-sm text-slate-500 dark:text-slate-400'>
            <li>
              <a href='/docs' className='hover:text-[var(--primary-color)]'>
                Documentation
              </a>
            </li>
            <li>
              <a href='/faq' className='hover:text-[var(--primary-color)]'>
                FAQs
              </a>
            </li>
            <li>
              <a href='/support' className='hover:text-[var(--primary-color)]'>
                Support
              </a>
            </li>
          </ul>
        </div>

        {/* GitHub / Social */}
        <div>
          <h4 className='font-semibold mb-3'>Community</h4>

          {/* Star Repo CTA */}

          <div className='flex gap-4 text-xl text-slate-500 dark:text-slate-400'>
            <a
              href='https://github.com/your-org'
              className='transition-colors hover:text-[var(--primary-color)]'
            >
              <FaGithub />
            </a>
            <a href='https://linkedin.com' className='hover:text-[#0a66c2]'>
              <FaLinkedin />
            </a>
            <a
              href='https://twitter.com'
              className='transition-colors hover:text-black dark:hover:text-white'
            >
              <FaXTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className='text-center text-xs py-4 border-t border-black/10 dark:border-white/15 text-slate-400'>
        © 2026 NutriLens. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
