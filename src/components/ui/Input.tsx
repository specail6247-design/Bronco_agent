'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  disableMotion?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, disableMotion = false, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full notranslate" translate="no" suppressHydrationWarning={true}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            suppressHydrationWarning
            className={`
              input-field
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          disableMotion ? (
            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              <span>{error}</span>
            </p>
          ) : (
            <motion.p 
              className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.p>
          )
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-slate-500">
            <span>{hint}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full notranslate" translate="no" suppressHydrationWarning={true}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          suppressHydrationWarning
          className={`
            input-field resize-none
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <motion.p 
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-slate-500">
            <span>{hint}</span>
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full notranslate" translate="no" suppressHydrationWarning={true}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          suppressHydrationWarning
          className={`
            input-field cursor-pointer
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <motion.p 
            className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
