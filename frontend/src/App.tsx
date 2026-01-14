import React, { useState, useEffect } from 'react';
import { History, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnalysisResults } from './components/AnalysisResults';
import { Reproduce } from './components/Reproduce';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { analyzeImage, getHistory, getImageUrl } from './api';
import type { MealData } from './api';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealData | null>(null);
  const [history, setHistory] = useState<MealData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await analyzeImage(file);
      setResult(data);
      fetchHistory();
    } catch (err) {
      console.error('Analysis failed', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'An unknown error occurred.';
      alert(`Analysis failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className='min-h-screen pb-20 transition-colors duration-300'>
      {/* Navbar */}
      <Navbar showHistory={showHistory} setShowHistory={setShowHistory} />

      <main className='max-w-4xl mx-auto px-4 pt-32'>
        {/* Hero Section */}
        {!preview && !result && <Hero />}

        {/* Upload/Preview Section */}
        <div className='space-y-8'>
          <AnimatePresence mode='wait'>
            {!preview ? (
              <UploadZone onFileChange={handleFileSelect} />
            ) : (
              <ImagePreview
                preview={preview}
                loading={loading}
                result={result}
                onUpload={handleUpload}
                onReset={reset}
              />
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {result && !loading && <AnalysisResults result={result} />}
          </AnimatePresence>
        </div>

        {!preview && !result && <Reproduce />}

        {/* History Sidebar/Section */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
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
                <button
                  onClick={() => setShowHistory(false)}
                  className='p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full'
                >
                  <ChevronRight className='w-6 h-6' />
                </button>
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
                      className='group glass p-3 rounded-2xl flex items-center space-x-4 hover:bg-white/10 transition-colors cursor-pointer'
                      onClick={() => {
                        setResult(meal);
                        setPreview(getImageUrl(meal.imagePath));
                        setShowHistory(false);
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
          )}
        </AnimatePresence>

        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
          />
        )}
      </main>
    </div>
  );
};

export default App;
