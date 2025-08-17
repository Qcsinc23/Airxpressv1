// app/components/ui/FormField.tsx
'use client';

import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError | string;
  warning?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, name, error, warning, required, disabled, icon, description, children, className = '' }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <motion.div
        ref={ref}
        className={`space-y-2 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <label
            htmlFor={name}
            className={`flex items-center text-sm font-semibold transition-colors duration-200 ${
              errorMessage 
                ? 'text-red-600' 
                : isFocused 
                ? 'text-blue-600' 
                : 'text-gray-700'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
            {label}
            {required && (
              <motion.span
                className="ml-1 text-red-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                *
              </motion.span>
            )}
          </label>
          {description && (
            <span className="text-xs text-gray-500 hidden sm:block max-w-xs">
              {description}
            </span>
          )}
        </div>

        <div
          className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={() => setIsFocused(false)}
        >
          <motion.div
            animate={{
              scale: isFocused ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>

          {/* Focus ring animation - fixed positioning */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-400/50 pointer-events-none z-10"
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: isFocused ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            style={{
              transform: 'none',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
        </div>

        <AnimatePresence>
          {(errorMessage || warning) && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {errorMessage && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  <motion.svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                  </motion.svg>
                  <span>{errorMessage}</span>
                </div>
              )}
              
              {warning && !errorMessage && (
                <div className="flex items-center text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <motion.svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                  </motion.svg>
                  <span>{warning}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

FormField.displayName = 'FormField';

// Enhanced input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  warning?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, warning, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-200 
          focus:outline-none focus:ring-0 focus:border-transparent
          placeholder:text-gray-400
          ${error 
            ? 'border-red-300 bg-red-50/50 text-red-900' 
            : warning
            ? 'border-amber-300 bg-amber-50/50'
            : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
          }
          ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

// Enhanced select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  warning?: boolean;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, warning, className = '', children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-4 py-3 bg-white/70 border-2 rounded-xl transition-all duration-200 
            focus:outline-none focus:ring-0 focus:border-transparent appearance-none
            ${error 
              ? 'border-red-300 bg-red-50/50 text-red-900' 
              : warning
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
            }
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}`}
          {...props}
        >
          {children}
        </select>
        <motion.svg
          className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>
    );
  }
);

Select.displayName = 'Select';

// Radio group component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  onChange,
  error,
  disabled,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <motion.label
          key={option.value}
          className={`relative cursor-pointer block ${
            option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          whileHover={{ scale: disabled || option.disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled || option.disabled ? 1 : 0.98 }}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || option.disabled}
            className="peer sr-only"
          />
          <motion.div
            className={`p-4 bg-white/60 border-2 rounded-xl transition-all duration-200
              peer-checked:border-blue-500 peer-checked:bg-blue-50/50 
              hover:border-gray-300 peer-focus:ring-2 peer-focus:ring-blue-200
              ${error ? 'border-red-300' : 'border-gray-200'}`}
            animate={{
              borderColor: value === option.value ? '#3b82f6' : '#e5e7eb',
              backgroundColor: value === option.value ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {option.icon && (
                  <span className="text-lg mr-3">{option.icon}</span>
                )}
                <div>
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  )}
                </div>
              </div>
              <motion.div
                className={`w-5 h-5 border-2 rounded-full flex items-center justify-center
                  ${value === option.value ? 'border-blue-500' : 'border-gray-300'}`}
                animate={{
                  borderColor: value === option.value ? '#3b82f6' : '#d1d5db',
                }}
              >
                <motion.div
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: value === option.value ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.label>
      ))}
    </div>
  );
};