import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  entityType: string;
  createdDate: string;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  fetchAllNotifications: () => void;
  isViewAll: boolean;
  loadingAll: boolean;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => undefined,
  markAllAsRead: () => undefined,
  fetchAllNotifications: () => undefined,
  isViewAll: true,
  loadingAll: false,
});

export const NotificationsProvider = ({
  children,
}: {
  children?: ReactNode;
}): JSX.Element => {
  const markAsRead = useCallback((_id: string | number) => undefined, []);
  const markAllAsRead = useCallback(() => undefined, []);
  const fetchAllNotifications = useCallback(() => undefined, []);

  const value = useMemo(
    () => ({
      notifications: [] as NotificationItem[],
      unreadCount: 0,
      markAsRead,
      markAllAsRead,
      fetchAllNotifications,
      isViewAll: true,
      loadingAll: false,
    }),
    [markAsRead, markAllAsRead, fetchAllNotifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => useContext(NotificationsContext);

export default NotificationsContext;
