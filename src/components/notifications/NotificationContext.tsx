import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import database from '../../../firebase';
import { ref, onValue, push, update } from 'firebase/database';
import { removeSpecialCharacters } from '../utils/StringUtils';
interface Notification {
  _id: string;
  userId: string;
  type: string; // we can create types for notifications such as system, post, follow etc
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    communityId?: string;
    communityName?: string;
    postId?: string;
    commentId?: string;
    userId?: string;
    userName?: string;
    userImage?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, '_id'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
 
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    setLoading(true);
    const email = removeSpecialCharacters(user?.email);
    console.log('user', user);
    const notificationsRef = ref(database, `notification/${email}`);
    
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('data from firebase', data);
      if (data) {
        // Convert object to array
        const notificationsArray = Object.entries(data).map(([key, value]) => ({
          _id: key,
          ...(value as any)
        }));
        console.log('notifications array', notificationsArray);
        setNotifications(notificationsArray);
      } else {
        setNotifications([]); // Clear notifications if none exist
      }
      setLoading(false);
    });
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?._id) return;
    
    const notificationRef = ref(database, `notification/${user._id}`);
    await update(notificationRef, { read: true });
  };

  const markAllAsRead = async () => {
    if (!user?._id) return;
    
    const notificationsRef = ref(database, `notification/${user._id}`);
    const updates: { [key: string]: boolean } = {};
    
    notifications.forEach(notification => {
      updates[`${notification._id}/read`] = true;
    });
    
    await update(notificationsRef, updates);
  };

  const addNotification = async (notification: Omit<Notification, '_id'>) => {
    if (!notification.userId) return;
    
    const notificationsRef = ref(database, `notification/${notification.userId}`);
    const newNotificationRef = push(notificationsRef);
    
    await update(newNotificationRef, {
      ...notification,
      createdAt: new Date().toISOString(),
      read: false
    });
  };

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?._id]);


  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;