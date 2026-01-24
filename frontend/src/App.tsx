import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { HistorySidebar } from './components/HistorySidebar';
import { Home } from './pages/Home';
import { Analysis } from './pages/Analysis';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { getHistory, clearHistory } from './api';
import type { MealData } from './api';
import Footer from './components/Footer';
import { useAuth } from './context/AuthContext';
import { RedirectIfAuthenticated, RequireAuth } from './components/RouteGuards';
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  const [history, setHistory] = useState<MealData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(data.data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };

    if (status === 'authenticated') {
      fetchHistory();
    } else if (status === 'unauthenticated') {
      setHistory([]);
    }

    // Listen for history updates from other components
    const handleHistoryUpdate = () => {
      fetchHistory();
    };
    window.addEventListener('historyUpdated', handleHistoryUpdate);

    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, [status]);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  return (
    <div className='min-h-screen flex flex-col transition-colors duration-300'>
      {/* Navbar */}
      <Navbar showHistory={showHistory} setShowHistory={setShowHistory} />

      {/* Main Content */}
      <main className='flex-1 max-w-4xl mx-auto px-4 pt-32'>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<Home />} />
            <Route element={<RedirectIfAuthenticated />}>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<Signup />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path='/analysis' element={<Analysis />} />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </AnimatePresence>

        <HistorySidebar
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={history}
          onSelectMeal={(meal) => {
            navigate('/analysis', { state: { result: meal } });
            setShowHistory(false);
          }}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
