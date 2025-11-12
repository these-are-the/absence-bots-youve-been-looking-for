'use client';

import { motion } from 'framer-motion';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  autoFocus?: boolean;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  autoFocus = false,
}: TextAreaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        autoFocus={autoFocus}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
      />
    </motion.div>
  );
}
