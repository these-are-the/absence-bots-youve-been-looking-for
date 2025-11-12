'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface TypeformStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function TypeformStep({
  title,
  description,
  children,
  showBack = false,
  onBack,
}: TypeformStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12"
      >
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          {title}
        </motion.h1>
        
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 mb-8"
          >
            {description}
          </motion.p>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
