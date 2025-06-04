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
import { ref, onValue, push, update, get } from "firebase/database";
import { removeSpecialCharacters } from "../utils/StringUtils";
import { subscribeToPushNotifications } from "@/utils/pushNotifications";

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
  pushEnabled: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, "_id">) => Promise<void>;
  enablePushNotifications: () => Promise<PushSubscription>;
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
  const [pushEnabled, setPushEnabled] = useState(false);

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
      // Add notification to Firebase
      const notificationsRef = ref(
        database,
        `notification/${notification.userId}`
      );
      const newNotificationRef = push(notificationsRef);

      const newNotification = {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
      };

      await update(newNotificationRef, newNotification);

      // Get user's push subscription if it exists
      const userRef = ref(
        database,
        `users/${notification.userId}/pushSubscription`
      );
      const snapshot = await get(userRef);
      const pushSubscription = snapshot.val();

      if (pushSubscription) {
        // Send push notification to your backend
        try {
          await fetch("/api/push-notification", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription: pushSubscription,
              notification: {
                title: "GuildUp",
                message: notification.message,
                data: notification.data,
                url:
                  window.location.origin +
                  (notification.data?.postId
                    ? `/post/${notification.data.postId}`
                    : "/"),
              },
            }),
          });
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const enablePushNotifications = async () => {
    try {
      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications");
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPushNotifications();

      // Save the subscription to your backend
      if (user?.email) {
        const email = removeSpecialCharacters(user.email);
        const userRef = ref(database, `users/${email}/pushSubscription`);
        await update(userRef, {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey("p256dh"),
            auth: subscription.getKey("auth"),
          },
        });
      }

      setPushEnabled(true);
      return subscription;
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      setPushEnabled(false);
      throw error;
    }
  };

  // Check push notification status on mount
  useEffect(() => {
    const checkPushStatus = async () => {
      if ("Notification" in window) {
        const permission = Notification.permission;
        setPushEnabled(permission === "granted");
      }
    };
    checkPushStatus();
  }, []);

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
    pushEnabled,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    enablePushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
