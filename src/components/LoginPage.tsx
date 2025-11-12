'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { TypeformButton } from './TypeformButton';
import { t, Language } from '@/lib/i18n';

interface LoginPageProps {
  onLogin: (email: string, role: 'employee' | 'manager') => void;
  language: Language;
  onShowFeatures: () => void;
  onShowDocumentation: () => void;
}

export function LoginPage({ onLogin, language, onShowFeatures, onShowDocumentation }: LoginPageProps) {
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Skip if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        onLogin('manager@demo.com', 'manager');
      } else if (e.key === '2') {
        e.preventDefault();
        onLogin('employee@demo.com', 'employee');
      } else if (e.key === '3') {
        e.preventDefault();
        onShowFeatures();
      } else if (e.key === '4') {
        e.preventDefault();
        onShowDocumentation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLogin, onShowFeatures, onShowDocumentation]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center"
        >
          VacayBot Demo
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 mb-8 text-center"
        >
          Choose a demo account to explore the absence management system
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Demo Accounts</h2>
            
            <TypeformButton
              label="👔 Demo Manager"
              shortcut="1"
              onClick={() => onLogin('manager@demo.com', 'manager')}
              variant="primary"
              autoFocus
            />
            <p className="text-sm text-gray-500 ml-2">
              View and approve/deny absence requests from employees
            </p>
          </div>

          <div className="space-y-2">
            <TypeformButton
              label="👤 Demo Employee"
              shortcut="2"
              onClick={() => onLogin('employee@demo.com', 'employee')}
              variant="secondary"
            />
            <p className="text-sm text-gray-500 ml-2">
              Request vacation and other absences
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-gray-200 space-y-4"
        >
          <p className="text-sm text-gray-500 text-center">
            These are demo accounts connected to each other. The employee reports to the manager.
          </p>
          
          <div className="space-y-2">
            <TypeformButton
              label={t('absence.showFeatures', language) || 'Show Features'}
              onClick={onShowFeatures}
              variant="outline"
              shortcut="3"
            />
            <TypeformButton
              label={t('absence.showDocumentation', language) || 'Show Documentation'}
              onClick={onShowDocumentation}
              variant="outline"
              shortcut="4"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
