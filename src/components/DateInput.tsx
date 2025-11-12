'use client';

import { motion } from 'framer-motion';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  autoFocus?: boolean;
}

export function DateInput({
  label,
  value,
  onChange,
  min,
  max,
  required = false,
  autoFocus = false,
}: DateInputProps) {
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
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        autoFocus={autoFocus}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
      />
    </motion.div>
  );
}
