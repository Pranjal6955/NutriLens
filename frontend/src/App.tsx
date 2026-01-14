import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, History, ChevronRight, Loader2, RefreshCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnalysisResults } from './components/AnalysisResults';
import { Reproduce } from './components/Reproduce';
import { analyzeImage, getHistory, getImageUrl } from './api';
import type { MealData } from './api';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealData | null>(null);
  const [history, setHistory] = useState<MealData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
    }
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
              <motion.div
                key='actions'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='grid md:grid-cols-2 gap-6'
              >
                {/* Upload Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className='group relative cursor-pointer'
                >
                  <div className='relative h-64 bg-transparent rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 border-5 border-gray-400 dark:border-white/10 hover:border-brand-primary/50 transition-colors'>
                    <div className='p-4 bg-brand-primary/10 rounded-2xl group-hover:bg-brand-primary/20 transition-colors'>
                      <Upload className='w-10 h-10 text-brand-primary' />
                    </div>
                    <div className='text-center'>
                      <h3 className='text-xl font-bold'>Upload Image</h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        Select from your gallery
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Camera Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => cameraInputRef.current?.click()}
                  className='group relative cursor-pointer'
                >
                  <div className='relative h-64 bg-transparent rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 border-5 border-gray-400 dark:border-white/10 hover:border-brand-accent/50 transition-colors'>
                    <div className='p-4 bg-brand-accent/10 rounded-2xl group-hover:bg-brand-accent/20 transition-colors'>
                      <Camera className='w-10 h-10 text-brand-accent' />
                    </div>
                    <div className='text-center'>
                      <h3 className='text-xl font-bold'>Take Photo</h3>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        Capture a fresh snap
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Hidden Inputs */}
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className='hidden'
                  accept='image/*'
                />
                <input
                  type='file'
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  className='hidden'
                  accept='image/*'
                  capture='environment'
                />
              </motion.div>
            ) : (
              <motion.div
                key='preview'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='space-y-6'
              >
                <div className='relative aspect-video rounded-3xl overflow-hidden glass p-2'>
                  <img
                    src={preview}
                    alt='Preview'
                    className='w-full h-full object-cover rounded-2xl'
                  />
                  {loading && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className='absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent z-10 shadow-[0_0_15px_rgba(0,255,128,0.5)]'
                    />
                  )}
                  {loading && (
                    <div className='absolute inset-0 bg-black/20 backdrop-blur-[1px] z-0' />
                  )}
                  <button
                    onClick={reset}
                    className='absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors z-20'
                  >
                    <RefreshCcw className='w-5 h-5' />
                  </button>
                </div>

                {!result && !loading && (
                  <button
                    onClick={handleUpload}
                    className='w-full gradient-bg py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2'
                  >
                    <Sparkles className='w-5 h-5' />
                    <span>Analyze Nutritional Value</span>
                  </button>
                )}

                {loading && (
                  <div className='w-full bg-black border border-white/10 py-6 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 text-white shadow-xl shadow-brand-primary/10'>
                    <Loader2 className='w-6 h-6 animate-spin text-brand-primary' />
                    <span className='animate-pulse tracking-wide'>
                      AI is scanning your plate...
                    </span>
                  </div>
                )}
              </motion.div>
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
