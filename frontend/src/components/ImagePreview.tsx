import React, { useState, useEffect } from 'react';
import {
  RefreshCcw,
  Sparkles,
  Soup,
  Apple,
  Carrot,
  Fish,
  Beef,
  Milk,
  Croissant,
  Wheat,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealData } from '../api';

const LOADING_ICONS = [Apple, Carrot, Fish, Beef, Milk, Croissant, Wheat];

const NUTRITION_FACTS = [
  'Spinach is high in iron and vitamins A and C.',
  'Avocados contain more potassium than bananas.',
  'Almonds are a great source of healthy fats and protein.',
  'Sweet potatoes are rich in beta-carotene.',
  'Drinking water before meals can help with digestion.',
  'Fiber helps maintain bowel health.',
  'Dark chocolate is rich in antioxidants.',
  'Eggs are a complete protein source.',
  'Vitamin D helps your body absorb calcium.',
  'Eating slowly can help you feel fuller.',
];

interface ImagePreviewProps {
  preview: string;
  loading: boolean;
  result: MealData | null;
  onUpload: () => void;
  onReset: () => void;
  onBack: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  preview,
  loading,
  result,
  onUpload,
  onReset,
  onBack,
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % NUTRITION_FACTS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <motion.div
      key='preview'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='space-y-6'
    >
      <div className='flex items-center justify-between mb-2'>
        <button
          onClick={onBack}
          className='flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-black hover:text-brand-primary border border-white/10 backdrop-blur-md transition-all duration-300 group shadow-sm hover:shadow-md'
        >
          <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300' />
          Back
        </button>

        <div className='text-center flex-1 pr-6'>
          <h2 className='text-4xl font-bold flex items-center justify-center gap-3'>
            <Soup className='w-8 h-8 text-brand-primary' />
            {result ? 'Bon Appétit!' : 'Ready to Analyze?'}
          </h2>
          <p className='text-lg text-gray-500 dark:text-gray-400 mt-2'>
            {result ? 'Here is your nutritional breakdown' : 'Ensure your food is clearly visible'}
          </p>
        </div>
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
        <div className='w-full bg-black/40 border border-white/10 py-8 rounded-2xl font-bold text-lg flex flex-col items-center justify-center space-y-6 text-white shadow-xl backdrop-blur-md overflow-hidden'>
          <div className='flex items-center gap-4'>
            {LOADING_ICONS.map((Icon, index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              >
                <Icon className='w-6 h-6 text-brand-primary' />
              </motion.div>
            ))}
          </div>
          <div className='h-6 relative w-full flex justify-center'>
            <AnimatePresence mode='wait'>
              <motion.p
                key={currentFactIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='text-sm text-gray-300 font-medium px-4 text-center absolute w-full'
              >
                Did you know? {NUTRITION_FACTS[currentFactIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};
