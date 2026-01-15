import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePreview } from '../components/ImagePreview';
import { AnalysisResults } from '../components/AnalysisResults';
import { analyzeImage, getImageUrl } from '../api';
import type { MealData } from '../api';

export const Analysis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealData | null>(null);

  // Initialize from location state
  useEffect(() => {
    const state = location.state as { file?: File; result?: MealData };

    if (state?.result) {
      // If we have a result (e.g. from history), show it
      setResult(state.result);
      setPreview(getImageUrl(state.result.imagePath));
    } else if (state?.file) {
      // If we have a file (from upload), prepare for analysis
      setFile(state.file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(state.file);
      setResult(null); // Ensure no previous result is shown
    } else {
      // If neither, redirect back to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await analyzeImage(file);
      setResult(data);
      // We might want to refresh history in App if we could,
      // but for now let's just show the result.
      // Ideally, App should listen for updates or Refetch.
      // Since context is not used, History in App won't update automatically
      // until a reload or if we trigger it.
      // For now, let's dispatch a custom event or rely on user navigating.
      window.dispatchEvent(new Event('historyUpdated'));
    } catch (err) {
      console.error('Analysis failed', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'An unknown error occurred.';
      alert(`Analysis failed: ${errorMessage} `);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-8'
    >
      <AnimatePresence mode='wait'>
        {preview && (
          <ImagePreview
            preview={preview}
            loading={loading}
            result={result}
            onUpload={handleUpload}
            onReset={reset}
            onBack={reset}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{result && !loading && <AnalysisResults result={result} />}</AnimatePresence>
    </motion.div>
  );
};
