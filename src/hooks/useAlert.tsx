import { useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertOptions {
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'info' | 'success' | 'error' | 'warning';
}

interface AlertState {
  isOpen: boolean;
  message: string;
  title: string;
  variant: 'info' | 'success' | 'error' | 'warning';
  isConfirm: boolean;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    title: '',
    variant: 'info',
    isConfirm: false,
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
  });

  const showAlert = useCallback((message: string, options?: Omit<AlertOptions, 'onConfirm' | 'onCancel'>) => {
    setAlertState({
      isOpen: true,
      message,
      title: options?.title || 'Alert',
      variant: options?.variant || 'info',
      isConfirm: false,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, { title: title || 'Success', variant: 'success' });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, { title: title || 'Error', variant: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, { title: title || 'Warning', variant: 'warning' });
  }, [showAlert]);

  const showConfirm = useCallback((message: string, options?: AlertOptions) => {
    setAlertState({
      isOpen: true,
      message,
      title: options?.title || 'Confirm',
      variant: options?.variant || 'warning',
      isConfirm: true,
      confirmButtonText: options?.confirmButtonText || 'Confirm',
      cancelButtonText: options?.cancelButtonText || 'Cancel',
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    alertState.onConfirm?.();
    closeAlert();
  }, [alertState.onConfirm, closeAlert]);

  const handleCancel = useCallback(() => {
    alertState.onCancel?.();
    closeAlert();
  }, [alertState.onCancel, closeAlert]);

  const getIcon = () => {
    switch (alertState.variant) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getButtonStyles = (isPrimary: boolean) => {
    if (isPrimary) {
      switch (alertState.variant) {
        case 'success':
          return 'bg-emerald-500 hover:bg-emerald-600 text-white';
        case 'error':
          return 'bg-red-500 hover:bg-red-600 text-white';
        case 'warning':
          return 'bg-amber-500 hover:bg-amber-600 text-white';
        default:
          return 'bg-blue-500 hover:bg-blue-600 text-white';
      }
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  };

  const AlertModal = () => {
    if (!alertState.isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full transform transition-all">
          <div className="flex items-start space-x-4">
            {getIcon()}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {alertState.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {alertState.message}
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            {alertState.isConfirm && (
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonStyles(false)}`}
              >
                {alertState.cancelButtonText}
              </button>
            )}
            <button
              onClick={alertState.isConfirm ? handleConfirm : closeAlert}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonStyles(true)}`}
            >
              {alertState.confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    AlertModal,
  };
}