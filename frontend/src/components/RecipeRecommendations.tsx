import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle, Utensils } from 'lucide-react';
import { getRecommendations } from '../api';
import type { Recipe } from '../api';
import { RecipeCard } from './RecipeCard';

export const RecipeRecommendations: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRecommendations();
            setRecipes(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to load recommendations';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    return (
        <section className='py-16' id='recipe-recommendations'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className='text-center mb-12'
            >
                <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium mb-4'>
                    <Sparkles className='w-4 h-4' />
                    Powered by AI
                </div>
                <h2 className='text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-blue-500'>
                    Recipe Suggestions
                </h2>
                <p className='text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto'>
                    Personalized meal ideas based on your daily nutritional goals and scan history
                </p>
            </motion.div>

            {loading && (
                <div className='grid grid-cols-1 gap-6'>
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className='glass rounded-3xl p-6 space-y-4 shimmer'
                        >
                            <div className='flex items-center gap-3'>
                                <div className='w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700' />
                                <div className='h-6 w-48 rounded-lg bg-gray-200 dark:bg-gray-700' />
                            </div>
                            <div className='h-4 w-24 rounded-lg bg-gray-200 dark:bg-gray-700' />
                            <div className='flex gap-2'>
                                <div className='h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700' />
                                <div className='h-7 w-24 rounded-full bg-gray-200 dark:bg-gray-700' />
                                <div className='h-7 w-20 rounded-full bg-gray-200 dark:bg-gray-700' />
                                <div className='h-7 w-16 rounded-full bg-gray-200 dark:bg-gray-700' />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='glass rounded-3xl p-8 text-center space-y-4'
                >
                    <AlertTriangle className='w-12 h-12 mx-auto text-amber-500' />
                    <p className='text-gray-500 dark:text-gray-400'>{error}</p>
                    <button
                        onClick={fetchRecommendations}
                        className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full gradient-bg text-white font-medium text-sm hover:opacity-90 transition-opacity'
                    >
                        <RefreshCw className='w-4 h-4' />
                        Try Again
                    </button>
                </motion.div>
            )}

            {!loading && !error && recipes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='glass rounded-3xl p-8 text-center space-y-4'
                >
                    <Utensils className='w-12 h-12 mx-auto text-gray-400' />
                    <p className='text-gray-500 dark:text-gray-400'>
                        No recipes available right now. Try again later.
                    </p>
                </motion.div>
            )}

            {!loading && !error && recipes.length > 0 && (
                <div className='grid grid-cols-1 gap-6'>
                    {recipes.map((recipe, index) => (
                        <RecipeCard key={index} recipe={recipe} index={index} />
                    ))}

                    <div className='text-center pt-4'>
                        <button
                            onClick={fetchRecommendations}
                            className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[var(--glass-border)] text-sm font-medium hover:bg-brand-primary/10 hover:border-brand-primary/30 hover:text-brand-primary transition-all duration-300'
                        >
                            <RefreshCw className='w-4 h-4' />
                            Get New Suggestions
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};
