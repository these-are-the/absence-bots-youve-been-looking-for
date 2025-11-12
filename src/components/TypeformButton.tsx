'use client';

import { motion } from 'framer-motion';
import { KeyboardEvent, useEffect, useRef } from 'react';

interface TypeformButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  autoFocus?: boolean;
}

export function TypeformButton({
  label,
  shortcut,
  onClick,
  variant = 'primary',
  disabled = false,
  autoFocus = false,
}: TypeformButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!shortcut || disabled) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only trigger if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === shortcut || e.key === `Digit${shortcut}`) {
        e.preventDefault();
        onClick();
      }
    };

    // Use window.addEventListener for global keyboard handling
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcut, onClick, disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter key when button is focused
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      onClick();
    }
    // Handle shortcut keys
    if (shortcut && (e.key === shortcut || e.key === `Digit${shortcut}`) && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  const baseStyles = 'w-full px-6 py-4 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-500',
  };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{label}</span>
        {shortcut && (
          <span className="text-sm opacity-70 bg-white/20 px-2 py-1 rounded">
            {shortcut.toUpperCase()}
          </span>
        )}
      </div>
    </motion.button>
  );
}
