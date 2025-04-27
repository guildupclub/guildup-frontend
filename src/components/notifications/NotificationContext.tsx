import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import database from '../../../firebase';
import { ref, onValue } from 'firebase/database';

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
  addNotification: (notification: Notification) => void;
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
    console.log('notification db')
    const notificationsRef = ref(database, '1');
    onValue(notificationsRef, (snapshot) => {
      console.log(snapshot.val());
    });
  };

  const markAsRead = async (notificationId: string) => {
    //to do
  };

  const markAllAsRead = async () => {
    //to do
   
  };

  const addNotification = (notification: Notification) => {
    //to do
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