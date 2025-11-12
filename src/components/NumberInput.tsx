'use client';

import { motion } from 'framer-motion';

interface NumberInputProps {
  label: string;
  value: number | '';
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  required = false,
  placeholder,
  autoFocus = false,
}: NumberInputProps) {
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
        type="number"
        value={value}
        onChange={(e) => {
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) {
            onChange(num);
          } else {
            onChange(0);
          }
        }}
        min={min}
        max={max}
        step={step}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
      />
    </motion.div>
  );
}
