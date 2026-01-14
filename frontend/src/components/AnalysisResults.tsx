import React from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Droplets,
  Dna,
  Wheat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { NutrientCard } from './NutrientCard';
import type { MealData } from '../api';

interface AnalysisResultsProps {
  result: MealData;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-8'
    >
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold'>{result.foodName}</h2>
          <div className='flex items-center mt-1 space-x-2'>
            {result.isHealthy ? (
              <span className='flex items-center text-brand-primary text-sm font-medium'>
                <CheckCircle2 className='w-4 h-4 mr-1' /> Healthy Choice
              </span>
            ) : (
              <span className='flex items-center text-red-400 text-sm font-medium'>
                <AlertCircle className='w-4 h-4 mr-1' /> Indulgent
              </span>
            )}
          </div>
        </div>
        <div className='text-gray-600 dark:text-gray-400 text-sm'>
          Analyzed on {new Date(result.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Macro Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <NutrientCard
          icon={Flame}
          label='Calories'
          value={result.calories}
          unit='kcal'
          color='border-orange-500'
        />
        <NutrientCard
          icon={Dna}
          label='Protein'
          value={result.protein}
          unit='g'
          color='border-blue-500'
        />
        <NutrientCard
          icon={Wheat}
          label='Carbs'
          value={result.carbs}
          unit='g'
          color='border-yellow-500'
        />
        <NutrientCard
          icon={Droplets}
          label='Fat'
          value={result.fat}
          unit='g'
          color='border-pink-500'
        />
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <div className='glass p-6 rounded-3xl space-y-3'>
          <h3 className='font-bold text-lg flex items-center text-brand-primary'>
            <Sparkles className='w-5 h-5 mr-2' /> Analysis
          </h3>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed capitalize'>
            {result.analysis}
          </p>
        </div>
        <div className='glass p-6 rounded-3xl space-y-3'>
          <h3 className='font-bold text-lg flex items-center text-brand-secondary'>
            <ChevronRight className='w-5 h-5 mr-2' /> Recommendation
          </h3>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed capitalize'>
            {result.recommendation}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
