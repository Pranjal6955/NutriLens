import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  History,
  Flame,
  Droplets,
  Dna,
  Wheat,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeImage, getHistory, getImageUrl } from './api';
import type { MealData } from './api';

interface NutrientCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  unit: string;
  color: string;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealData | null>(null);
  const [history, setHistory] = useState<MealData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const NutrientCard = ({ icon: Icon, label, value, unit, color }: NutrientCardProps) => (
    <div
      className={`glass p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 border-b-4 ${color}`}
    >
      <Icon className='w-6 h-6 text-white' />
      <span className='text-gray-400 text-xs font-medium uppercase tracking-wider'>{label}</span>
      <div className='flex items-baseline space-x-1'>
        <span className='text-2xl font-bold'>{value}</span>
        <span className='text-gray-500 text-xs'>{unit}</span>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen pb-20'>
      {/* Navbar */}
      <nav className='fixed top-0 w-full z-50 glass border-b border-white/5'>
        <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <div className='bg-brand-primary p-2 rounded-lg'>
              <Camera className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold tracking-tight'>
              Nutri<span className='text-brand-primary'>Lens</span>
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className='p-2 hover:bg-white/5 rounded-full transition-colors'
          >
            <History className='w-6 h-6 text-gray-400 hover:text-white' />
          </button>
        </div>
      </nav>

      <main className='max-w-4xl mx-auto px-4 pt-32'>
        {/* Hero Section */}
        {!preview && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center space-y-6 mb-12'
          >
            <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight'>
              Know What You <span className='gradient-text'>Eat.</span>
            </h1>
            <p className='text-gray-400 text-lg md:text-xl max-w-2xl mx-auto'>
              Snap a photo of your meal and get instant nutritional insights powered by advanced AI.
              Track calories, macros, and get personalized recommendations.
            </p>
          </motion.div>
        )}

        {/* Upload/Preview Section */}
        <div className='space-y-8'>
          <AnimatePresence mode='wait'>
            {!preview ? (
              <motion.div
                key='dropzone'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className='group relative cursor-pointer'
              >
                <div className='absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200'></div>
                <div className='relative glass rounded-3xl border-2 border-dashed border-gray-700 p-12 flex flex-col items-center space-y-4 hover:border-brand-primary/50 transition-colors'>
                  <div className='p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform'>
                    <Upload className='w-10 h-10 text-brand-primary' />
                  </div>
                  <div className='text-center'>
                    <p className='text-xl font-semibold'>Drop your meal image here</p>
                    <p className='text-gray-400 mt-1'>or click to browse from files</p>
                  </div>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className='hidden'
                    accept='image/*'
                  />
                </div>
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
                  <button
                    onClick={reset}
                    className='absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors'
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
                  <div className='w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3'>
                    <Loader2 className='w-5 h-5 animate-spin text-brand-primary' />
                    <span className='animate-pulse'>AI is scanning your plate...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-8'
              >
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  <div>
                    <h2 className='text-3xl font-bold'>{result.foodName}</h2>
                    <div className='flex items-center mt-1 space-x-2'>
                      {result.isHealthy ? (
                        <span className='flex items-center text-brand-primary text-sm font-medium'>
                          <CheckCircle2 className='w-4 h-4 mr-1' /> Healthy Choice
                        </span>
                      ) : (
                        <span className='flex items-center text-red-400 text-sm font-medium'>
                          <AlertCircle className='w-4 h-4 mr-1' /> Indulgent
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='text-gray-400 text-sm'>
                    Analyzed on {new Date(result.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Macro Stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <NutrientCard
                    icon={Flame}
                    label='Calories'
                    value={result.calories}
                    unit='kcal'
                    color='border-orange-500'
                  />
                  <NutrientCard
                    icon={Dna}
                    label='Protein'
                    value={result.protein}
                    unit='g'
                    color='border-blue-500'
                  />
                  <NutrientCard
                    icon={Wheat}
                    label='Carbs'
                    value={result.carbs}
                    unit='g'
                    color='border-yellow-500'
                  />
                  <NutrientCard
                    icon={Droplets}
                    label='Fat'
                    value={result.fat}
                    unit='g'
                    color='border-pink-500'
                  />
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='glass p-6 rounded-3xl space-y-3'>
                    <h3 className='font-bold text-lg flex items-center text-brand-primary'>
                      <Sparkles className='w-5 h-5 mr-2' /> Analysis
                    </h3>
                    <p className='text-gray-400 leading-relaxed capitalize'>{result.analysis}</p>
                  </div>
                  <div className='glass p-6 rounded-3xl space-y-3'>
                    <h3 className='font-bold text-lg flex items-center text-brand-secondary'>
                      <ChevronRight className='w-5 h-5 mr-2' /> Recommendation
                    </h3>
                    <p className='text-gray-400 leading-relaxed capitalize'>
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                  className='p-2 hover:bg-white/5 rounded-full'
                >
                  <ChevronRight className='w-6 h-6' />
                </button>
              </div>

              <div className='space-y-4'>
                {history.length === 0 ? (
                  <div className='text-center py-20 text-gray-500'>
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
                        <p className='text-xs text-gray-500'>
                          {meal.calories} kcal • {new Date(meal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className='w-4 h-4 text-gray-600 group-hover:text-white transition-colors' />
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
