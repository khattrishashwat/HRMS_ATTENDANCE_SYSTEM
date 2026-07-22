import { createContext, useMemo } from 'react';

interface NotificationContextValue {
  notifications: string[];
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationContextProvider = ({ children }: { children?: unknown }): JSX.Element => {
  const value = useMemo<NotificationContextValue>(() => ({ notifications: [] }), []);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;
