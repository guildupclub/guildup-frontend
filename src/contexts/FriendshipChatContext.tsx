import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { chatDatabase } from '../../firebase-chat';
import { ref, push, onValue, set, onDisconnect, serverTimestamp, get } from 'firebase/database';
import axios from 'axios';

interface FriendshipMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  read: boolean;
  senderName?: string;
  senderImage?: string;
}

interface FriendshipChatContextType {
  messages: FriendshipMessage[];
  loading: boolean;
  sendMessage: (friendshipId: string, message: string, receiverId: string, senderName?: string, senderImage?: string) => Promise<void>;
  loadMessages: (friendshipId: string) => void;
  currentFriendshipId: string | null;
  setCurrentFriendshipId: (friendshipId: string | null) => void;
  checkUserOnline: (friendshipId: string, userId: string) => Promise<boolean>;
}

const FriendshipChatContext = createContext<FriendshipChatContextType | undefined>(undefined);

export const useFriendshipChatContext = () => {
  const context = useContext(FriendshipChatContext);
  if (!context) {
    throw new Error('useFriendshipChatContext must be used within a FriendshipChatProvider');
  }
  return context;
};

export const FriendshipChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<FriendshipMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFriendshipId, setCurrentFriendshipId] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Load messages for a friendship
  const loadMessages = (friendshipId: string) => {
    if (!friendshipId) {
      setMessages([]);
      return;
    }

    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    const messagesRef = ref(chatDatabase, `friendshipChats/${friendshipId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const messagesList = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .sort((a, b) => {
            const timeA = typeof a.timestamp === 'number' ? a.timestamp : 0;
            const timeB = typeof b.timestamp === 'number' ? b.timestamp : 0;
            return timeA - timeB;
          });
        
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;
    return unsubscribe;
  };

  // Send a message
  const sendMessage = async (
    friendshipId: string,
    message: string,
    receiverId: string,
    senderName?: string,
    senderImage?: string
  ) => {
    if (!friendshipId || !message.trim()) {
      throw new Error('Friendship ID and message are required');
    }

    const senderId = typeof window !== 'undefined' ? sessionStorage.getItem('id') : null;
    if (!senderId) {
      throw new Error('User not authenticated');
    }

    try {
      const path = `friendshipChats/${friendshipId}/messages`;
      console.log('Attempting to send message to path:', path);
      console.log('Chat database instance:', chatDatabase);
      
      const messagesRef = ref(chatDatabase, path);
      const newMessageRef = push(messagesRef);
      
      const messageData = {
        senderId,
        receiverId,
        message: message.trim(),
        timestamp: Date.now(),
        read: false,
        senderName: senderName || 'You',
        senderImage: senderImage || '',
      };

      console.log('Message data to send:', messageData);
      console.log('New message ref path:', newMessageRef.toString());
      
      // Use set instead of update to create new message
      await set(newMessageRef, messageData);
      console.log('✅ Message sent successfully:', messageData);
      
      // Send WhatsApp notification via backend (only if receiver is offline)
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
        if (token && receiverId) {
          // Check if receiver is online first
          const isOnline = await checkUserOnline(friendshipId, receiverId);
          
          if (!isOnline) {
            // Only send notification if receiver is offline
            const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://guildup-be-569548341732.asia-south1.run.app";
            await axios.post(
              `${API_BASE_URL}/v1/friendship/${friendshipId}/chat/send-notification`,
              { message: message.trim(), receiverId },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            console.log('✅ WhatsApp notification sent to offline user');
          } else {
            console.log('ℹ️ User is online, skipping WhatsApp notification');
          }
        }
      } catch (error) {
        console.error("Failed to send WhatsApp notification:", error);
        // Don't fail message sending if notification fails
      }
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      
      // Provide more specific error message
      if (error.code === 'PERMISSION_DENIED') {
        throw new Error(`Permission denied. Please check Firebase rules for path: friendshipChats/${friendshipId}/messages`);
      }
      throw error;
    }
  };

  // Set up presence tracking when friendship chat is active
  useEffect(() => {
    const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
    if (!userId || !currentFriendshipId) return;

    const userPresenceRef = ref(chatDatabase, `friendshipPresence/${currentFriendshipId}/${userId}`);
    const connectedRef = ref(chatDatabase, '.info/connected');
    
    const unsubscribeConnection = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userPresenceRef, {
          online: true,
          lastSeen: serverTimestamp(),
          userId: userId
        });

        onDisconnect(userPresenceRef).set({
          online: false,
          lastSeen: serverTimestamp(),
          userId: userId
        });
      }
    });

    return () => {
      set(userPresenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
        userId: userId
      });
      unsubscribeConnection();
    };
  }, [currentFriendshipId]);

  // Listen to all users' presence in current friendship
  useEffect(() => {
    if (!currentFriendshipId) return;
    
    const presenceRef = ref(chatDatabase, `friendshipPresence/${currentFriendshipId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      if (presenceData) {
        const online = new Set<string>();
        Object.keys(presenceData).forEach(userId => {
          const userData = presenceData[userId];
          if (userData.online === true) {
            online.add(userId);
          }
        });
        setOnlineUsers(online);
      }
    });

    return () => unsubscribe();
  }, [currentFriendshipId]);

  // Helper function to check if user is online
  const checkUserOnline = async (friendshipId: string, userId: string): Promise<boolean> => {
    try {
      const presenceRef = ref(chatDatabase, `friendshipPresence/${friendshipId}/${userId}`);
      const snapshot = await get(presenceRef);
      const presence = snapshot.val();
      
      if (!presence || !presence.online) return false;
      
      // Check if last seen is recent (within 2 minutes)
      const lastSeen = presence.lastSeen;
      if (lastSeen) {
        const lastSeenTime = typeof lastSeen === 'number' ? lastSeen : Date.now();
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
        return lastSeenTime > twoMinutesAgo;
      }
      
      return presence.online === true;
    } catch (error) {
      console.error('Error checking user online status:', error);
      return false;
    }
  };

  // Load messages when friendshipId changes
  useEffect(() => {
    if (currentFriendshipId) {
      loadMessages(currentFriendshipId);
    } else {
      setMessages([]);
    }

    // Cleanup on unmount or when friendshipId changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentFriendshipId]);

  const value: FriendshipChatContextType = {
    messages,
    loading,
    sendMessage,
    loadMessages,
    currentFriendshipId,
    setCurrentFriendshipId,
    checkUserOnline,
  };

  return (
    <FriendshipChatContext.Provider value={value}>
      {children}
    </FriendshipChatContext.Provider>
  );
};

