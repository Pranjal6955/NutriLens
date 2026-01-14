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
  Target,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutrientCard } from './NutrientCard';
import type { MealData } from '../api';

interface AnalysisResultsProps {
  result: MealData;
}

const COLORS = ['#3b82f6', '#eab308', '#ec4899']; // Protein (blue), Carbs (yellow), Fat (pink)

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  // Fallback for backward compatibility
  const protein = result.macronutrients?.protein ?? result.protein ?? 0;
  const carbs = result.macronutrients?.carbs ?? result.carbs ?? 0;
  const fat = result.macronutrients?.fat ?? result.fat ?? 0;

  const chartData = [
    { name: 'Protein', value: protein },
    { name: 'Carbs', value: carbs },
    { name: 'Fat', value: fat },
  ];

  // Logic to handle empty data so chart doesn't break
  const hasMacroData = protein > 0 || carbs > 0 || fat > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className='space-y-8'
    >
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-bold'>{result.foodName}</h2>
          {result.servingSize && (
            <p className='text-gray-500 text-sm'>Serving Size: {result.servingSize}</p>
          )}
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
            {result.healthMetrics?.healthScore !== undefined && (
              <span className='flex items-center text-brand-secondary text-sm font-medium ml-2'>
                <Target className='w-4 h-4 mr-1' /> Score: {result.healthMetrics.healthScore}/100
              </span>
            )}
          </div>
        </div>
        <div className='text-gray-600 dark:text-gray-400 text-sm'>
          Analyzed on {new Date(result.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        {/* Macro Stats Grid - Left Side - Spans 2 cols */}
        <div className='md:col-span-2 space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <NutrientCard
              icon={Flame}
              label='Calories'
              value={result.calories}
              unit='kcal'
              color='border-orange-500'
              textColor='text-orange-500'
            />
            <NutrientCard
              icon={Dna}
              label='Protein'
              value={protein}
              unit='g'
              color='border-blue-500'
              textColor='text-blue-500'
            />
            <NutrientCard
              icon={Wheat}
              label='Carbs'
              value={carbs}
              unit='g'
              color='border-yellow-500'
              textColor='text-yellow-500'
            />
            <NutrientCard
              icon={Droplets}
              label='Fat'
              value={fat}
              unit='g'
              color='border-pink-500'
              textColor='text-pink-500'
            />
          </div>

          {/* Micronutrients if available */}
          {result.micronutrients && (
            <div className='glass p-6 rounded-3xl'>
              <h3 className='font-bold text-lg mb-4'>Micronutrients</h3>
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm'>
                {Object.entries(result.micronutrients).map(([key, value]) => (
                  <div
                    key={key}
                    className='flex justify-between items-center bg-white/5 p-2 rounded-lg'
                  >
                    <span className='capitalize text-gray-500 font-medium'>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className='font-bold'>
                      {value} <span className='text-xs font-normal opacity-70'>mg</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie Chart - Right Side - Spans 1 col */}
        {hasMacroData && (
          <div className='glass p-4 rounded-3xl flex flex-col items-center justify-center min-h-[300px]'>
            <h3 className='font-bold text-lg mb-2'>Macro Distribution</h3>
            <div className='w-full h-[250px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign='bottom' height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <div className='glass p-6 rounded-3xl space-y-3'>
          <h3 className='font-bold text-lg flex items-center text-brand-primary'>
            <Sparkles className='w-5 h-5 mr-2' /> Analysis
          </h3>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed capitalize'>
            {result.analysis}
          </p>
          {result.healthMetrics?.benefits && result.healthMetrics.benefits.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-semibold text-green-600 flex items-center mb-2'>
                <ThumbsUp className='w-4 h-4 mr-2' /> Benefits
              </h4>
              <ul className='list-disc list-inside text-sm text-gray-500 space-y-1'>
                {result.healthMetrics.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className='glass p-6 rounded-3xl space-y-3'>
          <h3 className='font-bold text-lg flex items-center text-brand-secondary'>
            <ChevronRight className='w-5 h-5 mr-2' /> Recommendation
          </h3>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed capitalize'>
            {result.recommendation}
          </p>
          {result.healthMetrics?.concerns && result.healthMetrics.concerns.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-semibold text-red-500 flex items-center mb-2'>
                <ThumbsDown className='w-4 h-4 mr-2' /> Concerns
              </h4>
              <ul className='list-disc list-inside text-sm text-gray-500 space-y-1'>
                {result.healthMetrics.concerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
