import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { UploadZone } from '../components/UploadZone';
import { Reproduce } from '../components/Reproduce';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    // Navigate to analysis page with the file
    // We can't pass the File object directly in state reliably in all scenarios,
    // but usually in SPA it works.
    // Alternatively, we can create a context, but let's try passing via state first.
    // However, URL.createObjectURL is safer for visuals, but we need the File for upload.
    // For now, let's assume we can pass the file object in state for immediate use.
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
      <Reproduce />
    </motion.div>
  );
};
