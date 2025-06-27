'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'sonner';
import type { ToastContextType, ToastMessage } from '@/types/api.types';
import { generateId } from '@/utils/helpers';
import { TOAST_TYPES } from '@/utils/constants';

// Toast state
interface ToastState {
  toasts: ToastMessage[];
}

// Initial state
const initialState: ToastState = {
  toasts: [],
};

// Action types
type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_TOASTS' };

// Reducer
function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };
    case 'CLEAR_TOASTS':
      return initialState;
    default:
      return state;
  }
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const id = generateId();
    const toastMessage: ToastMessage = {
      id,
      message,
      type,
      duration: type === 'error' ? 6000 : 4000, // Error messages stay longer
    };

    // Add to internal state
    dispatch({ type: 'ADD_TOAST', payload: toastMessage });

    // Show using Sonner
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        toast.success(message, {
          id,
          duration: toastMessage.duration,
        });
        break;
      case TOAST_TYPES.ERROR:
        toast.error(message, {
          id,
          duration: toastMessage.duration,
        });
        break;
      case TOAST_TYPES.WARNING:
        toast.warning(message, {
          id,
          duration: toastMessage.duration,
        });
        break;
      case TOAST_TYPES.INFO:
      default:
        toast.info(message, {
          id,
          duration: toastMessage.duration,
        });
        break;
    }

    // Auto-remove from internal state
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, toastMessage.duration);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, TOAST_TYPES.SUCCESS);
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, TOAST_TYPES.ERROR);
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, TOAST_TYPES.INFO);
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, TOAST_TYPES.WARNING);
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id);
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const contextValue: ToastContextType = React.useMemo(() => ({
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
  }), [showToast, showSuccess, showError, showInfo, showWarning, dismissToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use toast context
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 