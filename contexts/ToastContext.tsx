import React, { createContext, useContext, useCallback } from 'react';
import Toast from 'react-native-root-toast';
import { Platform } from 'react-native';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const config = {
      success: {
        bg: '#10B981',
        icon: '✓',
      },
      error: {
        bg: '#DC2626',
        icon: '✕',
      },
      warning: {
        bg: '#F59E0B',
        icon: '⚠',
      },
      info: {
        bg: '#3B82F6',
        icon: 'ℹ',
      },
    };

    const style = config[type];

    Toast.show(`${style.icon}  ${message}`, {
      duration: duration ?? Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
      shadow: false,
      animation: true,
      hideOnPress: true,
      backgroundColor: style.bg,
      textColor: '#FFFFFF',
      containerStyle: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: Platform.OS === 'ios' ? 50 : 40,
        minWidth: 280,
        maxWidth: '90%',
      },
      textStyle: {
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        textAlign: 'left',
        lineHeight: 20,
      },
    });
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};