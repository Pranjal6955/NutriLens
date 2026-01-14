import React from 'react';
import { RefreshCcw, Sparkles, Loader2, Soup } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MealData } from '../api';

interface ImagePreviewProps {
  preview: string;
  loading: boolean;
  result: MealData | null;
  onUpload: () => void;
  onReset: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  preview,
  loading,
  result,
  onUpload,
  onReset,
}) => {
  return (
    <motion.div
      key='preview'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='space-y-6'
    >
      <div className='text-center'>
        <h2 className='text-4xl font-bold mb-2 flex items-center justify-center gap-3'>
          <Soup className='w-8 h-8 text-brand-primary' />
          {result ? 'Bon Appétit!' : 'Ready to Analyze?'}
        </h2>
        <p className='text-lg text-gray-500 dark:text-gray-400'>
          {result ? 'Here is your nutritional breakdown' : 'Ensure your food is clearly visible'}
        </p>
      </div>

      <div className='relative aspect-video rounded-3xl overflow-hidden glass p-2'>
        <img src={preview} alt='Preview' className='w-full h-full object-cover rounded-2xl' />
        {loading && (
          <motion.div
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent z-10 shadow-[0_0_15px_rgba(0,255,128,0.5)]'
          />
        )}
        {loading && <div className='absolute inset-0 bg-black/20 backdrop-blur-[1px] z-0' />}
        <button
          onClick={onReset}
          className='absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors z-20'
        >
          <RefreshCcw className='w-5 h-5' />
        </button>
      </div>

      {!result && !loading && (
        <div className='flex flex-col md:flex-row gap-4'>
          <button
            onClick={onReset}
            className='md:w-auto px-6 py-4 rounded-2xl font-bold text-lg border-2 border-white hover:bg-white/10 transition-colors flex items-center justify-center space-x-2'
          >
            <RefreshCcw className='w-5 h-5' />
            <span>Retake</span>
          </button>
          <button
            onClick={onUpload}
            className='flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2'
          >
            <Sparkles className='w-5 h-5' />
            <span>Analyze</span>
          </button>
        </div>
      )}

      {loading && (
        <div className='w-full bg-black border border-white/10 py-6 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 text-white shadow-xl shadow-brand-primary/10'>
          <Loader2 className='w-6 h-6 animate-spin text-brand-primary' />
          <span className='animate-pulse tracking-wide'>AI is scanning your plate...</span>
        </div>
      )}
    </motion.div>
  );
};
