import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { chatDatabase } from '../../firebase-chat';
import { ref, push, onValue, set } from 'firebase/database';

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
  };

  return (
    <FriendshipChatContext.Provider value={value}>
      {children}
    </FriendshipChatContext.Provider>
  );
};

