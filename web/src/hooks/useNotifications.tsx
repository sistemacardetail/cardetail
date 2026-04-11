import React from 'react';

export interface NotificationOptions {
  key?: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  autoHideDuration?: number | null;
  message: string;
}

interface NotificationsContextValue {
  show: (options: NotificationOptions) => void;
  close: (key: string) => void;
}

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}

export default NotificationsContext;
