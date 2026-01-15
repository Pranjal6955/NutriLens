import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronRight, Trash2 } from 'lucide-react';
import { getImageUrl } from '../api';
import type { MealData } from '../api';


interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: MealData[];
    onSelectMeal: (meal: MealData) => void;
    onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    onClose,
    history,
    onSelectMeal,
    onClearHistory,
}) => {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside - handled by the overlay in App.tsx usually,
    // but here we can include the overlay as part of the component logic
    // if we want to extract *all* drawer logic including overlay.
    // The user said: "Move the sliding drawer logic and the overlay (backdrop)."

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
                    />

                    {/* Sidebar */}
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className='fixed right-0 top-0 h-full w-full md:w-96 glass z-[60] shadow-2xl p-6 overflow-y-auto'
                    >
                        <div className='flex items-center justify-between mb-8'>
                            <h2 className='text-2xl font-bold flex items-center'>
                                <History className='w-6 h-6 mr-2 text-brand-primary' /> History
                            </h2>
                            <div className='flex items-center space-x-2'>
                                {history.length > 0 && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to clear your history?')) {
                                                onClearHistory();
                                            }
                                        }}
                                        className='p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors'
                                        title='Clear History'
                                    >
                                        <Trash2 className='w-5 h-5' />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className='p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors'
                                >
                                    <ChevronRight className='w-6 h-6' />
                                </button>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            {history.length === 0 ? (
                                <div className='text-center py-20 text-gray-500 dark:text-gray-400'>
                                    <p>No meals analyzed yet.</p>
                                </div>
                            ) : (
                                history.map((meal) => (
                                    <div
                                        key={meal._id}
                                        className='group glass p-3 rounded-2xl flex items-center space-x-4 hover:bg-white/10 dark:hover:bg-white/5 transition-colors cursor-pointer'
                                        onClick={() => {
                                            onSelectMeal(meal);
                                            onClose();
                                        }}
                                    >
                                        <div className='w-16 h-16 rounded-xl overflow-hidden flex-shrink-0'>
                                            <img
                                                src={getImageUrl(meal.imagePath)}
                                                alt={meal.foodName}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='font-bold truncate'>{meal.foodName}</p>
                                            <p className='text-xs text-gray-500 dark:text-gray-400'>
                                                {meal.calories} kcal • {new Date(meal.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <ChevronRight className='w-4 h-4 text-gray-500 dark:text-gray-600 group-hover:text-current transition-colors' />
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
