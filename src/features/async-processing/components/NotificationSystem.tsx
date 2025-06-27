import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Clock
} from 'lucide-react';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Document Processing Complete',
    message: 'Credit Policy v3.2.pdf has been processed successfully. 47 terms extracted.',
    timestamp: '2024-01-16T11:45:00Z',
    read: false,
    actionUrl: '/results/1',
    actionLabel: 'View Results',
  },
  {
    id: '2',
    type: 'error',
    title: 'Processing Failed',
    message: 'Compliance Framework.pdf failed to process due to unsupported format.',
    timestamp: '2024-01-16T10:30:00Z',
    read: false,
    actionUrl: '/dashboard',
    actionLabel: 'Retry',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Low Confidence Terms',
    message: 'Business Requirements v1.5.docx contains 5 terms with confidence below 70%.',
    timestamp: '2024-01-16T09:15:00Z',
    read: true,
    actionUrl: '/results/2',
    actionLabel: 'Review',
  },
  {
    id: '4',
    type: 'info',
    title: 'Processing Started',
    message: 'Risk Assessment Model.pdf has been queued for processing.',
    timestamp: '2024-01-16T08:45:00Z',
    read: true,
  },
];

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 10 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'success' : 'info',
          title: Math.random() > 0.5 ? 'Document Processing Complete' : 'Processing Started',
          message: `Document ${Math.floor(Math.random() * 1000)}.pdf has been processed.`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        showToast(newNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (notification: Notification) => {
    const toast: Toast = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      duration: 5000,
    };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, toast.duration);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          icon={Bell}
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          {unreadCount > 0 && (
            <Badge 
              variant="error" 
              size="sm" 
              className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={X}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(notification.timestamp)}</span>
                            </span>
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm transform transition-all duration-300 ease-in-out"
          >
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {toast.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}