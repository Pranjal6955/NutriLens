import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flame, Dna, Wheat, Droplets, ChevronDown, Sparkles } from 'lucide-react';
import type { Recipe } from '../api';

interface RecipeCardProps {
    recipe: Recipe;
    index: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, index }) => {
    const [expanded, setExpanded] = useState(false);

    const macroPills = [
        { icon: Flame, value: recipe.calories, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { icon: Dna, value: recipe.protein, unit: 'g protein', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Wheat, value: recipe.carbs, unit: 'g carbs', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { icon: Droplets, value: recipe.fat, unit: 'g fat', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className='glass rounded-3xl overflow-hidden hover:border-brand-primary/40 transition-all duration-300'
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className='w-full text-left p-6 focus:outline-none'
                id={`recipe-card-${index}`}
            >
                <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 space-y-3'>
                        <div className='flex items-center gap-2'>
                            <Sparkles className='w-4 h-4 text-amber-400' />
                            <h3 className='text-xl font-bold'>{recipe.title}</h3>
                        </div>

                        <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                            <Clock className='w-4 h-4' />
                            <span>{recipe.prepTime}</span>
                        </div>

                        <div className='flex flex-wrap gap-2'>
                            {macroPills.map((pill, i) => {
                                const Icon = pill.icon;
                                return (
                                    <span
                                        key={i}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${pill.bg} ${pill.color}`}
                                    >
                                        <Icon className='w-3 h-3' />
                                        {pill.value} {pill.unit}
                                    </span>
                                );
                            })}
                        </div>

                        {recipe.tags && recipe.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1.5'>
                                {recipe.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className='px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className='mt-1 shrink-0'
                    >
                        <ChevronDown className='w-5 h-5 text-gray-400' />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className='overflow-hidden'
                    >
                        <div className='px-6 pb-6 space-y-5 border-t border-[var(--glass-border)] pt-5'>
                            <div>
                                <h4 className='text-sm font-bold uppercase tracking-wider text-brand-primary mb-3'>
                                    Ingredients
                                </h4>
                                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                    {recipe.ingredients.map((ingredient, i) => (
                                        <li
                                            key={i}
                                            className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'
                                        >
                                            <span className='w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0' />
                                            {ingredient}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className='text-sm font-bold uppercase tracking-wider text-brand-secondary mb-3'>
                                    Instructions
                                </h4>
                                <ol className='space-y-3'>
                                    {recipe.instructions.map((step, i) => (
                                        <li
                                            key={i}
                                            className='flex gap-3 text-sm text-gray-600 dark:text-gray-400'
                                        >
                                            <span className='flex items-center justify-center w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary text-xs font-bold shrink-0'>
                                                {i + 1}
                                            </span>
                                            <span className='pt-0.5'>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
