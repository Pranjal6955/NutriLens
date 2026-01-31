import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { HistorySidebar } from './components/HistorySidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Analysis } from './pages/Analysis';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { getHistory, clearHistory } from './api';
import { authService } from './utils/auth';
import type { MealData } from './api';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot/Chatbot';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState<MealData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await getHistory();
        setHistory(data.data);
      } catch (err) {
        // Silently handle history fetch errors
      }
    };

    fetchHistory();

    const handleHistoryUpdate = () => {
      if (isAuthenticated) {
        fetchHistory();
      }
    };
    window.addEventListener('historyUpdated', handleHistoryUpdate);

    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, [isAuthenticated]);

  const handleClearHistory = async () => {
    if (!isAuthenticated) return;
    
    try {
      await clearHistory();
      setHistory([]);
    } catch (err) {
      // Silently handle clear history errors
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--glass-bg)',
            color: 'var(--text-color)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      
      <Navbar showHistory={showHistory} setShowHistory={setShowHistory} />

      <main className="flex-1 max-w-4xl mx-auto px-4 pt-32">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>

        {isAuthenticated && (
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
        )}
      </main>

      <Footer />
      {isAuthenticated && <Chatbot />}
      <ScrollToTop />
    </div>
  );
};

export default App;
