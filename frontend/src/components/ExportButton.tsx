import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react';
import type { MealData } from '../api';
import { generateCSV, generatePDF, generateTXT } from '../utils/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportButtonProps {
  result: MealData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const options = [
    { label: 'Export as TXT', icon: FileText, action: () => generateTXT(result) },
    { label: 'Export as CSV', icon: FileSpreadsheet, action: () => generateCSV(result) },
    { label: 'Export as PDF', icon: FileJson, action: () => generatePDF(result) },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-black hover:bg-brand-primary text-brand-primary hover:text-black px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-brand-primary/20"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                >
                  <option.icon className="w-4 h-4 mr-3 text-brand-primary" />
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
