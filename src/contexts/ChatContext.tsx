import React, { createContext, useContext, useEffect, useState } from 'react';
import { chatDatabase } from '../../firebase-chat';
import { ref, push, onValue, update, serverTimestamp, get, remove } from 'firebase/database';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { toast } from 'sonner';
import { removeSpecialCharacters } from '@/components/utils/StringUtils';

interface ChatMessage {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  message: string;
  timestamp: any;
  read: boolean;
  senderName: string;
  senderImage?: string;
  edited?: boolean;
  editedAt?: number;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
}

interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  deletedBy?: string[]; // Track users who have deleted this conversation
  participantDetails: {
    [email: string]: {
      name: string;
      image?: string;
      email: string;
    }
  };
}

interface ChatContextType {
  conversations: ChatConversation[];
  currentChat: string | null;
  messages: ChatMessage[];
  loading: boolean;
  unreadCount: number;
  sendMessage: (receiverEmail: string, message: string | { message: string; attachments?: any[] }, receiverDetails: { name: string; email: string; image?: string }) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  markAsRead: (chatId: string) => void;
  startNewChat: (receiverEmail: string, receiverDetails: { name: string; email: string; image?: string }) => string;
  deleteConversation: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate chat ID for two users using sanitized emails
  const generateChatId = (email1: string, email2: string) => {
    const sanitizedEmail1 = removeSpecialCharacters(email1);
    const sanitizedEmail2 = removeSpecialCharacters(email2);
    return [sanitizedEmail1, sanitizedEmail2].sort().join('_');
  };

  // Start a new chat or get existing one
  const startNewChat = (receiverEmail: string, receiverDetails: { name: string; email: string; image?: string }) => {
    if (!user?.email) return '';
    
    const chatId = generateChatId(user.email, receiverEmail);
    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const sanitizedReceiverEmail = removeSpecialCharacters(receiverEmail);
    
    const cleanUserData = {
      name: user.name || 'Anonymous',
      email: user.email || '',
      image: user.image || ''
    };

    const cleanReceiverData = {
      name: receiverDetails.name,
      email: receiverDetails.email || '',
      image: receiverDetails.image || ''
    };
    
    const conversationRef = ref(chatDatabase, `conversations/${chatId}`);
    update(conversationRef, {
      participants: [sanitizedUserEmail, sanitizedReceiverEmail],
      participantDetails: {
        [sanitizedUserEmail]: cleanUserData,
        [sanitizedReceiverEmail]: cleanReceiverData
      },
      deletedBy: [], // Initialize deletedBy as empty array
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp()
    });

    return chatId;
  };

  // Send a message
  const sendMessage = async (receiverEmail: string, message: string | { message: string; attachments?: any[] }, receiverDetails: { name: string; email: string; image?: string }) => {
    // Extract message text and attachments from the parameter
    const messageText = typeof message === 'string' ? message : message.message;
    const attachments = typeof message === 'object' ? message.attachments : undefined;
    
    if (!user?.email || !messageText.trim()) return;

    const chatId = generateChatId(user.email, receiverEmail);
    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const sanitizedReceiverEmail = removeSpecialCharacters(receiverEmail);
    
    console.log('Sending message to chatId:', chatId);
    
    try {
      startNewChat(receiverEmail, receiverDetails);

      const messagesRef = ref(chatDatabase, `messages/${chatId}`);
      const newMessageRef = push(messagesRef);
      
      const messageData = {
        senderEmail: sanitizedUserEmail,
        receiverEmail: sanitizedReceiverEmail,
        message: messageText.trim(),
        timestamp: Date.now(), // Use simple timestamp for reliability
        read: false,
        senderName: user.name || 'Anonymous',
        senderImage: user.image || '',
        ...(attachments && attachments.length > 0 && { attachments })
      };

      console.log('Sending message data:', messageData);
      await update(newMessageRef, messageData);

      const conversationRef = ref(chatDatabase, `conversations/${chatId}`);
      await update(conversationRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: Date.now()
      });

      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = (chatId: string) => {
    if (!user?.email) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    console.log('Marking messages as read for chatId:', chatId);
    const messagesRef = ref(chatDatabase, `messages/${chatId}`);
    
    onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const updates: { [key: string]: any } = {};
        
        Object.keys(messagesData).forEach(messageId => {
          const message = messagesData[messageId];
          if (message.receiverEmail === sanitizedUserEmail && !message.read) {
            updates[`messages/${chatId}/${messageId}/read`] = true;
          }
        });

        if (Object.keys(updates).length > 0) {
          console.log('Marking', Object.keys(updates).length, 'messages as read');
          update(ref(chatDatabase), updates);
        }
      }
    }, { onlyOnce: true });
  };

  // Delete conversation (user-specific - only hide from current user's view)
  const deleteConversation = async (chatId: string) => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    try {
      const sanitizedUserEmail = removeSpecialCharacters(user.email);
      const conversationRef = ref(chatDatabase, `conversations/${chatId}`);
      
      // Get current conversation data
      const conversationSnapshot = await get(conversationRef);
      const conversationData = conversationSnapshot.val();

      if (!conversationData) {
        throw new Error('Conversation not found');
      }

      // Add current user to deletedBy array
      const updatedDeletedBy = conversationData.deletedBy || [];
      if (!updatedDeletedBy.includes(sanitizedUserEmail)) {
        updatedDeletedBy.push(sanitizedUserEmail);
      }

      await update(conversationRef, {
        deletedBy: updatedDeletedBy
      });

      // Update local state to remove conversation immediately
      setConversations(prev => prev.filter(conv => conv.id !== chatId));
      
      // If this was the current chat, clear it
      if (currentChat === chatId) {
        setCurrentChat(null);
        setMessages([]);
      }

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
      throw error;
    }
  };

  // Load conversations and calculate total unread count
  useEffect(() => {
    if (!user?.email) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    console.log('Setting up conversations listener for user email:', sanitizedUserEmail);
    const conversationsRef = ref(chatDatabase, 'conversations');
    
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Conversations data received:', data);
      
      if (data) {
        const userConversations = Object.keys(data)
          .filter(chatId => {
            const conversation = data[chatId];
            return conversation.participants?.includes(sanitizedUserEmail) &&
                   !conversation.deletedBy?.includes(sanitizedUserEmail);
          })
          .map(chatId => ({
            id: chatId,
            ...data[chatId],
            unreadCount: 0
          }));
        
        console.log('User conversations:', userConversations.length);
        setConversations(userConversations);
        
      } else {
        setConversations([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [user?.email]);

  // Calculate total unread count across all conversations
  useEffect(() => {
    if (!user?.email || conversations.length === 0) {
      setUnreadCount(0);
      return;
    }

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const unsubscribers: Array<() => void> = [];
    const conversationUnreadCounts: {[key: string]: number} = {};

    const updateTotalUnread = () => {
      const total = Object.values(conversationUnreadCounts).reduce((sum, count) => sum + count, 0);
      setUnreadCount(total);
    };

    conversations.forEach(conversation => {
      const messagesRef = ref(chatDatabase, `messages/${conversation.id}`);
      
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        if (messagesData) {
          const unreadMessages = Object.values(messagesData).filter((message: any) => 
            message.receiverEmail === sanitizedUserEmail && 
            message.senderEmail !== sanitizedUserEmail && 
            !message.read
          );
          
          conversationUnreadCounts[conversation.id] = unreadMessages.length;
          updateTotalUnread();
        } else {
          conversationUnreadCounts[conversation.id] = 0;
          updateTotalUnread();
        }
      });
      
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [conversations, user?.email]);

  // Load messages for current chat
  useEffect(() => {
    if (!currentChat) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    if (!user?.email) return;

    setLoading(true);
    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    console.log('Setting up message listener for chat:', currentChat);
    
    const messagesRef = ref(chatDatabase, `messages/${currentChat}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Messages data received for chat', currentChat, ':', data);
      
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
        
        console.log('Processed messages:', messagesList.length);
        setMessages(messagesList);
        
      } else {
        console.log('No messages found for chat:', currentChat);
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up message listener for chat:', currentChat);
      unsubscribe();
    };
  }, [currentChat, user?.email]);

  const value: ChatContextType = {
    conversations,
    currentChat,
    messages,
    loading,
    unreadCount,
    sendMessage,
    setCurrentChat,
    markAsRead,
    startNewChat,
    deleteConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 