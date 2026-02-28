import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { UploadZone } from '../components/UploadZone';
import { Reproduce } from '../components/Reproduce';
import { RecipeRecommendations } from '../components/RecipeRecommendations';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    navigate('/analysis', { state: { file } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='space-y-16'
    >
      <Hero />
      <UploadZone onFileChange={handleFileSelect} />
      <RecipeRecommendations />
      <Reproduce />
    </motion.div>
  );
};
