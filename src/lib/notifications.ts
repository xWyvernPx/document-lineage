interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationService {
  private notifications: ToastNotification[] = [];
  private listeners: Array<(notifications: ToastNotification[]) => void> = [];

  subscribe(listener: (notifications: ToastNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  show(notification: Omit<ToastNotification, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    this.notifications.push(toast);
    this.notify();

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration);
    }

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  // Convenience methods
  success(title: string, message: string, options?: Partial<ToastNotification>) {
    return this.show({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  error(title: string, message: string, options?: Partial<ToastNotification>) {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 0, // Errors don't auto-dismiss
      ...options,
    });
  }

  warning(title: string, message: string, options?: Partial<ToastNotification>) {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  info(title: string, message: string, options?: Partial<ToastNotification>) {
    return this.show({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  // API-specific error handling
  handleApiError(error: any) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          this.error(
            'Invalid Request',
            data?.message || 'The request contains invalid data. Please check your input and try again.'
          );
          break;
        case 401:
          this.error(
            'Authentication Required',
            'Your session has expired. Please log in again.',
            {
              action: {
                label: 'Log In',
                onClick: () => {
                  // Handle redirect to login
                  window.location.href = '/login';
                },
              },
            }
          );
          break;
        case 403:
          this.error(
            'Access Denied',
            'You don\'t have permission to perform this action.'
          );
          break;
        case 404:
          this.error(
            'Not Found',
            data?.message || 'The requested resource could not be found.'
          );
          break;
        case 409:
          this.error(
            'Conflict',
            data?.message || 'This action conflicts with the current state. Please refresh and try again.'
          );
          break;
        case 422:
          this.error(
            'Validation Error',
            data?.message || 'The provided data failed validation. Please check the required fields.'
          );
          break;
        case 429:
          this.warning(
            'Rate Limited',
            'You\'re making requests too quickly. Please wait a moment before trying again.'
          );
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          this.error(
            'Server Error',
            'Our servers are experiencing issues. Please try again in a few minutes.',
            {
              action: {
                label: 'Retry',
                onClick: () => {
                  // Could implement retry logic here
                  window.location.reload();
                },
              },
            }
          );
          break;
        default:
          this.error(
            'Unexpected Error',
            data?.message || `An unexpected error occurred (${status}). Please try again.`
          );
      }
    } else if (error.request) {
      this.error(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        {
          action: {
            label: 'Retry',
            onClick: () => {
              window.location.reload();
            },
          },
        }
      );
    } else {
      this.error(
        'Request Error',
        error.message || 'An unexpected error occurred while preparing your request.'
      );
    }
  }

  // Success notifications for common API operations
  documentUploaded(fileName: string) {
    this.success(
      'Document Uploaded',
      `${fileName} has been uploaded and is being processed.`
    );
  }

  termUpdated() {
    this.success(
      'Term Updated',
      'The term has been updated successfully.'
    );
  }

  termApproved() {
    this.success(
      'Term Approved',
      'The term has been approved and added to the glossary.'
    );
  }

  classificationUpdated() {
    this.success(
      'Classification Updated',
      'The document classification has been updated successfully.'
    );
  }

  settingsSaved() {
    this.success(
      'Settings Saved',
      'Your settings have been saved successfully.'
    );
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// Export types
export type { ToastNotification };
