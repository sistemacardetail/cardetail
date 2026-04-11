import React from 'react';
import { Alert, Badge, Snackbar } from '@mui/material';
import NotificationsContext, { NotificationOptions } from './useNotifications';

interface NotificationItem extends NotificationOptions {
  key: string;
}

export interface NotificationsProviderProps {
  children?: React.ReactNode;
}

export default function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const keyCounter = React.useRef(0);

  const show = React.useCallback((options: NotificationOptions) => {
    const key = options.key || `notification-${keyCounter.current++}`;

    setNotifications((prev) => {
      const exists = prev.find((n) => n.key === key);
      if (exists) {
        return prev;
      }
      return [...prev, { ...options, key }];
    });
  }, []);

  const close = React.useCallback((key: string) => {
    setNotifications((prev) => prev.filter((n) => n.key !== key));
  }, []);

  const contextValue = React.useMemo(
    () => ({ show, close }),
    [show, close]
  );

  const currentNotification = notifications[0];

  const handleClose = () => {
    if (currentNotification) {
      close(currentNotification.key);
    }
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
      {currentNotification && (
        <Badge
          badgeContent={notifications.length > 1 ? notifications.length : 0}
          color="primary"
          sx={{ width: '100%' }}
        >
          <Snackbar
            open={true}
            autoHideDuration={currentNotification.autoHideDuration ?? 6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleClose}
              severity={currentNotification.severity || 'info'}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {currentNotification.message}
            </Alert>
          </Snackbar>
        </Badge>
      )}
    </NotificationsContext.Provider>
  );
}
