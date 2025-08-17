// app/lib/hooks/useQuoteForm.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QuoteRequestSchema, QuoteRequest } from '../validation/schemas';
import { RateInput } from '../../types/shipping';

// Custom debounce hook to avoid SSR issues
function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
}

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

interface UseQuoteFormOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  onAutoSave?: (data: QuoteRequest) => void;
  onRealTimeValidation?: (isValid: boolean, errors: any) => void;
  defaultValues?: Partial<QuoteRequest>;
}

export function useQuoteForm(options: UseQuoteFormOptions = {}) {
  const {
    autoSave = true,
    autoSaveDelay = 2000,
    onAutoSave,
    onRealTimeValidation,
    defaultValues
  } = options;

  const form = useForm<QuoteRequest>({
    resolver: zodResolver(QuoteRequestSchema),
    mode: 'onChange',
    defaultValues: {
      originZip: '',
      destCountry: '',
      destCity: '',
      serviceLevel: 'EXPRESS',
      afterHours: false,
      isPersonalEffects: false,
      pieces: [{ type: 'box', weight: 10 }],
      ...defaultValues,
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [realTimePricing, setRealTimePricing] = useState<any>(null);

  // Progressive disclosure logic
  const shouldShowStep = useCallback((stepIndex: number) => {
    const values = form.getValues();
    switch (stepIndex) {
      case 0: // Origin & Destination
        return true;
      case 1: // Service Level
        return !!values.originZip && !!values.destCountry;
      case 2: // Package Details
        return !!values.serviceLevel;
      case 3: // Additional Options
        return values.pieces && values.pieces.length > 0;
      default:
        return false;
    }
  }, [form]);

  // Smart form utilities
  const addPiece = useCallback(() => {
    const currentPieces = form.getValues('pieces') || [];
    form.setValue('pieces', [
      ...currentPieces,
      { type: 'box', weight: 10 }
    ]);
  }, [form]);

  const removePiece = useCallback((index: number) => {
    const currentPieces = form.getValues('pieces') || [];
    if (currentPieces.length > 1) {
      form.setValue('pieces', currentPieces.filter((_, i) => i !== index));
    }
  }, [form]);

  const updatePiece = useCallback((index: number, updates: Partial<any>) => {
    const currentPieces = form.getValues('pieces') || [];
    const updatedPieces = [...currentPieces];
    updatedPieces[index] = { ...updatedPieces[index], ...updates };
    form.setValue('pieces', updatedPieces);
  }, [form]);

  // Convert form data to API format
  const convertToRateInput = useCallback((data: QuoteRequest): RateInput => {
    return {
      ...data,
      pieces: data.pieces.map(piece => ({
        type: piece.type,
        weight: piece.weight * LB_TO_KG, // Convert to kg
        dimensions: piece.dimensions ? {
          length: piece.dimensions.length * IN_TO_CM, // Convert to cm
          width: piece.dimensions.width * IN_TO_CM,
          height: piece.dimensions.height * IN_TO_CM,
        } : undefined,
      }))
    };
  }, []);

  // Smart validation messages
  const getFieldError = useCallback((fieldName: string) => {
    const error = form.formState.errors[fieldName as keyof QuoteRequest];
    return error?.message;
  }, [form.formState.errors]);

  const getFieldWarning = useCallback((fieldName: string, value: any) => {
    // Provide helpful warnings before errors
    switch (fieldName) {
      case 'originZip':
        if (value && value.length === 4) {
          return 'ZIP code should be 5 digits';
        }
        break;
      case 'pieces':
        if (value && Array.isArray(value)) {
          const totalWeight = value.reduce((sum: number, piece: any) => sum + (piece.weight || 0), 0);
          if (totalWeight > 400) {
            return 'High total weight may require special handling';
          }
        }
        break;
    }
    return null;
  }, []);

  // Calculate form completion percentage (fixed dependencies)
  const getCompletionPercentage = useCallback(() => {
    const requiredFields = ['originZip', 'destCountry', 'serviceLevel'];
    const values = form.getValues();
    const completedFields = requiredFields.filter(field => {
      const value = values[field as keyof QuoteRequest];
      return value && value !== '';
    });
    
    const piecesValid = values.pieces?.every(piece => piece.weight > 0) || false;
    const totalFields = requiredFields.length + (piecesValid ? 1 : 0);
    const completed = completedFields.length + (piecesValid ? 1 : 0);
    
    return Math.round((completed / totalFields) * 100);
  }, [form]);

  return {
    form,
    currentStep,
    setCurrentStep,
    shouldShowStep,
    isAutoSaving,
    lastSaved,
    realTimePricing,
    setRealTimePricing,
    
    // Form utilities
    addPiece,
    removePiece,
    updatePiece,
    convertToRateInput,
    
    // Validation utilities
    getFieldError,
    getFieldWarning,
    getCompletionPercentage,
    
    // Form state
    isValid: form.formState.isValid,
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
  };
}