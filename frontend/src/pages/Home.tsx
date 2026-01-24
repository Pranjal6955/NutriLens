import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { UploadZone } from '../components/UploadZone';
import { Reproduce } from '../components/Reproduce';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { status } = useAuth();

  const handleFileSelect = (file: File) => {
    const payload = { file };

    if (status !== 'authenticated') {
      navigate('/login', { state: { from: '/analysis', payload } });
      return;
    }

    navigate('/analysis', { state: payload });
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
      <Reproduce />
    </motion.div>
  );
};
