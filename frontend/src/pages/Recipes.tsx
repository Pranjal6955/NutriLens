import React from 'react';
import { motion } from 'framer-motion';
import { RecipeRecommendations } from '../components/RecipeRecommendations';

export const Recipes: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <RecipeRecommendations />
        </motion.div>
    );
};
