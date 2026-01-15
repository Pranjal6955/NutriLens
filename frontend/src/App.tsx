import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnalysisResults } from './components/AnalysisResults';
import { Reproduce } from './components/Reproduce';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { HistorySidebar } from './components/HistorySidebar';
import { analyzeImage, getHistory, getImageUrl, clearHistory } from './api';
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

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history', err);
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
        <HistorySidebar
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={history}
          onSelectMeal={(meal) => {
            setResult(meal);
            setPreview(getImageUrl(meal.imagePath));
            setShowHistory(false);
          }}
          onClearHistory={handleClearHistory}
        />

      </main>
    </div>
  );
};

export default App;
