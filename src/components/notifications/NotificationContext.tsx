"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import database from "../../../firebase";
import { ref, onValue, push, update } from "firebase/database";
import { removeSpecialCharacters } from "../utils/StringUtils";

interface Notification {
  _id: string;
  userId: string;
  type: string;
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
  addNotification: (notification: Omit<Notification, "_id">) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useSelector((state: RootState) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const email = removeSpecialCharacters(user.email);
      const notificationsRef = ref(database, `notification/${email}`);

      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array
          const notificationsArray = Object.entries(data).map(
            ([key, value]) => ({
              _id: key,
              ...(value as any),
            })
          );

        
          notificationsArray.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          setNotifications(notificationsArray);

          // Calculate unread count
          const unreadNotifications = notificationsArray.filter(
            (notification) => notification.read === false
          );
          setUnreadCount(unreadNotifications.length);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.email) return;

    try {
      const email = removeSpecialCharacters(user.email);
      const notificationRef = ref(
        database,
        `notification/${email}/${notificationId}`
      );
      await update(notificationRef, { read: true });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Recalculate unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;

    try {
      const email = removeSpecialCharacters(user.email);
      const notificationsRef = ref(database, `notification/${email}`);
      const updates: { [key: string]: any } = {};

      notifications.forEach((notification) => {
        if (!notification.read) {
          updates[`${notification._id}/read`] = true;
        }
      });

      await update(notificationsRef, updates);

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const addNotification = async (notification: Omit<Notification, "_id">) => {
    if (!notification.userId) return;

    try {
      const notificationsRef = ref(
        database,
        `notification/${notification.userId}`
      );
      const newNotificationRef = push(notificationsRef);

      await update(newNotificationRef, {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?.email]);

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
