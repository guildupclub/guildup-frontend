"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Clock,
  ArrowLeft,
  CheckCheck,
  Check,
  Reply,
  Smile,
  X,
  Edit3,
  Save
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { removeSpecialCharacters } from '../utils/StringUtils';
import { chatDatabase } from '../../../firebase-chat';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { GoogleMeetButton } from '@/components/google-meet/GoogleMeetButton';

interface ChatInterfaceProps {
  receiverEmail?: string;
  receiverDetails?: {
    name: string;
    email: string;
    image?: string;
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  receiverEmail, 
  receiverDetails 
}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const { 
    conversations, 
    currentChat, 
    messages, 
    loading, 
    sendMessage, 
    setCurrentChat, 
    markAsRead, 
    startNewChat 
  } = useChatContext();
  
  const [newMessage, setNewMessage] = useState('');
  const [showConversations, setShowConversations] = useState(!receiverEmail);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeenUsers, setLastSeenUsers] = useState<{[key: string]: number}>({});
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle mobile keyboard visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        // On mobile, if the visual viewport is smaller than window height, keyboard is open
        const visualViewport = (window as any).visualViewport;
        if (visualViewport) {
          const keyboardOpen = visualViewport.height < window.innerHeight * 0.75;
          setIsKeyboardVisible(keyboardOpen);
          
          // Scroll input into view when keyboard opens
          if (keyboardOpen && inputRef.current) {
            setTimeout(() => {
              inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }
      };

      if ((window as any).visualViewport) {
        (window as any).visualViewport.addEventListener('resize', handleResize);
        return () => (window as any).visualViewport.removeEventListener('resize', handleResize);
      } else {
        // Fallback for browsers without visual viewport
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !(event.target as Element)?.closest('.emoji-picker')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // Auto-start chat if receiverEmail is provided
  useEffect(() => {
    if (receiverEmail && receiverDetails && user?._id) {
      const chatId = startNewChat(receiverEmail, receiverDetails);
      setCurrentChat(chatId);
      setShowConversations(false);
    }
  }, [receiverEmail, receiverDetails, user?._id]);

  // Calculate unread message counts
  useEffect(() => {
    if (!user?.email || conversations.length === 0) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const unreadCountsMap: {[key: string]: number} = {};

    // Calculate unread count for each conversation
    conversations.forEach(conversation => {
      const messagesRef = ref(chatDatabase, `messages/${conversation.id}`);
      
      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        if (messagesData) {
          let unreadCount = 0;
          
          Object.values(messagesData).forEach((message: any) => {
            // Count messages sent by others that are unread
            if (message.receiverEmail === sanitizedUserEmail && 
                message.senderEmail !== sanitizedUserEmail && 
                !message.read) {
              unreadCount++;
            }
          });
          
          unreadCountsMap[conversation.id] = unreadCount;
          setUnreadCounts(prev => ({...prev, [conversation.id]: unreadCount}));
        }
      });
    });

  }, [conversations, user?.email]);

  // Mark messages as read when opening a chat
  useEffect(() => {
    if (currentChat && user?.email) {
      markAsRead(currentChat);
      // Reset unread count for current chat
      setUnreadCounts(prev => ({...prev, [currentChat]: 0}));
    }
  }, [currentChat, user?.email, markAsRead]);

  // Real Firebase presence tracking
  useEffect(() => {
    if (!user?.email) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    
    // Set up presence for current user
    const userPresenceRef = ref(chatDatabase, `presence/${sanitizedUserEmail}`);
    const connectedRef = ref(chatDatabase, '.info/connected');
    
    // Monitor connection status
    const unsubscribeConnection = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // User is online
        set(userPresenceRef, {
          online: true,
          lastSeen: serverTimestamp(),
          email: user.email,
          name: user.name || 'Anonymous'
        });

        // Remove presence on disconnect
        onDisconnect(userPresenceRef).set({
          online: false,
          lastSeen: serverTimestamp(),
          email: user.email,
          name: user.name || 'Anonymous'
        });
      }
    });

    return () => {
      // Clean up: set user offline when component unmounts
      set(userPresenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
        email: user.email,
        name: user.name || 'Anonymous'
      });
      unsubscribeConnection();
    };
  }, [user?.email, user?.name]);

  // Listen to all users' presence
  useEffect(() => {
    const presenceRef = ref(chatDatabase, 'presence');
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      if (presenceData) {
        const online = new Set<string>();
        const lastSeen: {[key: string]: number} = {};
        
        Object.keys(presenceData).forEach(sanitizedEmail => {
          const userData = presenceData[sanitizedEmail];
          const email = userData.email;
          
          if (userData.online) {
            online.add(email);
          } else if (userData.lastSeen) {
            // Convert Firebase timestamp to number if needed
            const timestamp = typeof userData.lastSeen === 'object' && userData.lastSeen !== null
              ? Date.now() // Fallback to current time if server timestamp
              : userData.lastSeen;
            lastSeen[email] = timestamp;
          }
        });
        
        setOnlineUsers(online);
        setLastSeenUsers(lastSeen);
      }
    });

    return () => unsubscribe();
  }, []);

  const isUserOnline = (email: string) => {
    return onlineUsers.has(email);
  };

  const getLastSeenText = (email: string) => {
    const lastSeen = lastSeenUsers[email];
    if (!lastSeen) return 'Last seen recently';
    
    const now = Date.now();
    const diff = now - lastSeen;
    
    if (diff < 60000) return 'Last seen just now';
    if (diff < 3600000) return `Last seen ${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `Last seen ${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `Last seen ${Math.floor(diff / 86400000)}d ago`;
    return 'Last seen long ago';
  };

  const getStatusText = (email: string) => {
    if (isUserOnline(email)) return 'Online';
    return getLastSeenText(email);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const conversation = conversations.find(conv => conv.id === currentChat);
    if (!conversation || !user?.email) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const otherParticipantEmail = conversation.participants.find(p => p !== sanitizedUserEmail);

    if (!otherParticipantEmail) return;

    const receiverInfo = conversation.participantDetails[otherParticipantEmail];

    if (!receiverInfo) return;

    // Include reply information if replying to a message
    const messageToSend = replyingTo 
      ? `@${replyingTo.senderName}: ${replyingTo.message}\n\n${newMessage}`
      : newMessage;

    await sendMessage(receiverInfo.email, messageToSend, receiverInfo);
    setNewMessage('');
    setReplyingTo(null);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleReplyToMessage = (message: any) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const canEditMessage = (message: any, userEmail: string) => {
    if (!userEmail || !message.timestamp) return false;
    
    const sanitizedUserEmail = removeSpecialCharacters(userEmail);
    const isOwnMessage = message.senderEmail === sanitizedUserEmail;
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - messageTime.getTime();
    const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return isOwnMessage && timeDiff <= fiveMinutesInMs;
  };

  const handleEditMessage = (message: any) => {
    setEditingMessage(message);
    // Extract the actual message text (handle replies)
    const isReply = message.message.includes('@') && message.message.includes('\n\n');
    const messageText = isReply ? message.message.split('\n\n')[1] : message.message;
    setEditText(messageText);
  };

  const saveEditedMessage = async () => {
    if (!editingMessage || !editText.trim() || !currentChat) return;

    try {
      // Update the message in Firebase
      const messageRef = ref(chatDatabase, `messages/${currentChat}/${editingMessage.id}`);
      const updatedMessage = {
        ...editingMessage,
        message: editText.trim(),
        edited: true,
        editedAt: Date.now()
      };
      
      await set(messageRef, updatedMessage);
      
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Link detection utility
  const detectAndRenderLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:no-underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter will naturally create a new line in textarea
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  const getOtherParticipant = (conversation: any) => {
    if (!user?.email) return null;
    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const otherParticipantEmail = conversation.participants.find((p: string) => p !== sanitizedUserEmail);
    return conversation.participantDetails[otherParticipantEmail];
  };

  if (!user?._id) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Please sign in to access chat support</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex w-full h-full md:border md:border-gray-200 md:rounded-lg overflow-hidden bg-white" style={{
      // Only apply visual viewport height on mobile when keyboard is visible
      height: typeof window !== 'undefined' && (window as any).visualViewport && window.innerWidth < 768 && isKeyboardVisible
        ? `${(window as any).visualViewport.height}px` 
        : undefined
    }}>
      
      {/* Conversations List - Hidden on mobile unless showConversations is true */}
      <div className={`${showConversations ? 'flex' : 'hidden'} md:flex md:w-72 flex-col border-r border-gray-200 bg-gray-50 ${showConversations ? 'w-full' : ''}`}>
        <div className="p-3 border-b border-gray-200 bg-white">
          <h2 className="text-base font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-500">Connect with Experts</p>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No conversations</p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                if (!otherParticipant) return null;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setCurrentChat(conversation.id);
                      setShowConversations(false);
                    }}
                    className={`w-full p-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                      currentChat === conversation.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative">
                        <Avatar className="h-8 w-8 mt-0.5">
                          <AvatarImage src={otherParticipant.image} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {otherParticipant.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isUserOnline(otherParticipant.email) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {otherParticipant.name}
                          </p>
                          <div className="flex items-center gap-1">
                            {conversation.lastMessageTime && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatMessageTime(conversation.lastMessageTime)}
                              </span>
                            )}
                            {unreadCounts[conversation.id] > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                {unreadCounts[conversation.id] > 9 ? '9+' : unreadCounts[conversation.id]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          <span className={`text-xs ml-2 flex-shrink-0 ${
                            isUserOnline(otherParticipant.email) ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {isUserOnline(otherParticipant.email) ? 'Online' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - Full screen on mobile */}
      <div className={`${showConversations ? 'hidden' : 'flex'} md:flex flex-col flex-1 min-w-0`}>
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-700 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-3 border-b border-gray-200 bg-white flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-1"
                onClick={() => setShowConversations(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {(() => {
                const conversation = conversations.find(conv => conv.id === currentChat);
                const otherParticipant = conversation ? getOtherParticipant(conversation) : null;
                
                return otherParticipant ? (
                  <>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={otherParticipant.image} />
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                          {otherParticipant.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline(otherParticipant.email) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{otherParticipant.name}</p>
                      <div className="flex items-center gap-1">
                        <p className={`text-xs ${
                          isUserOnline(otherParticipant.email) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {getStatusText(otherParticipant.email)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Google Meet Button */}
                    <GoogleMeetButton
                      receiverEmail={otherParticipant.email}
                      receiverName={otherParticipant.name}
                      size="sm"
                      variant="ghost"
                    />
                  </>
                ) : null;
              })()}
            </div>

            {/* Messages */}
            <div 
              className={`flex-1 overflow-y-auto min-h-0 relative`}
            >
              <div className="p-3 pb-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-3">
                    {messages.map((message) => {
                      const sanitizedUserEmail = user?.email ? removeSpecialCharacters(user.email) : '';
                      const isOwnMessage = message.senderEmail === sanitizedUserEmail;
                      
                      // Check if message is a reply
                      const isReply = message.message.includes('@') && message.message.includes('\n\n');
                      const replyData = isReply ? {
                        original: message.message.split('\n\n')[0].substring(1), // Remove @
                        reply: message.message.split('\n\n')[1]
                      } : null;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 py-2 rounded-lg relative ${
                              isOwnMessage
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {/* Reply indicator */}
                            {replyData && (
                              <div className={`text-xs p-2 rounded mb-2 border-l-2 ${
                                isOwnMessage 
                                  ? 'bg-blue-600/20 border-blue-200 text-blue-100' 
                                  : 'bg-gray-200 border-gray-400 text-gray-600'
                              }`}>
                                <p className="truncate">{replyData.original}</p>
                              </div>
                            )}
                            
                            {/* Message content - Edit mode or display mode */}
                            {editingMessage?.id === message.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      saveEditedMessage();
                                    } else if (e.key === 'Escape') {
                                      cancelEdit();
                                    }
                                  }}
                                  className="w-full bg-transparent border-none outline-none text-sm text-current placeholder-current/70"
                                  placeholder="Edit message..."
                                  autoFocus
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={cancelEdit}
                                    className={`p-1 rounded text-xs ${
                                      isOwnMessage 
                                        ? 'hover:bg-blue-600/20 text-blue-100' 
                                        : 'hover:bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={saveEditedMessage}
                                    disabled={!editText.trim()}
                                    className={`p-1 rounded text-xs disabled:opacity-50 ${
                                      isOwnMessage 
                                        ? 'hover:bg-blue-600/20 text-blue-100' 
                                        : 'hover:bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Message text with link detection */}
                                <div className="text-sm whitespace-pre-wrap">
                                  {detectAndRenderLinks(replyData ? replyData.reply : message.message)}
                                </div>
                                
                                {message.edited && (
                                  <p className={`text-xs mt-1 ${
                                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    (edited)
                                  </p>
                                )}
                              </>
                            )}
                            
                            <div className={`flex items-center justify-between gap-2 mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {/* Edit button - visible on hover for own messages within 5 minutes */}
                                {canEditMessage(message, user?.email || '') && editingMessage?.id !== message.id && (
                                  <button
                                    onClick={() => handleEditMessage(message)}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                      isOwnMessage 
                                        ? 'hover:bg-blue-600/20' 
                                        : 'hover:bg-gray-200'
                                    }`}
                                    title="Edit message"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                )}
                                
                                {/* Reply button - visible on hover */}
                                {editingMessage?.id !== message.id && (
                                  <button
                                    onClick={() => handleReplyToMessage(message)}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                      isOwnMessage 
                                        ? 'hover:bg-blue-600/20' 
                                        : 'hover:bg-gray-200'
                                    }`}
                                    title="Reply to message"
                                  >
                                    <Reply className="h-3 w-3" />
                                  </button>
                                )}
                                
                                {isOwnMessage && (
                                  message.read ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom with keyboard handling */}
            <div className={`p-2 md:p-3 border-t border-gray-200 bg-white flex-shrink-0 ${
              isKeyboardVisible ? 'pb-safe-area-inset-bottom' : ''
            }`}>
              {/* Reply preview */}
              {replyingTo && (
                <div className="mb-2 md:mb-3 p-2 bg-gray-50 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      Replying to {replyingTo.senderName}
                    </span>
                    <button
                      onClick={cancelReply}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{replyingTo.message}</p>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="emoji-picker absolute bottom-14 md:bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                  <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤐', '🤑', '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💥', '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💨', '☀️', '🌙', '⭐', '🌈', '☘️', '🍀', '🌸', '🌺', '🌻', '🌷'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="text-lg hover:bg-gray-100 p-1 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-1.5 md:gap-2 items-center relative">
                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    // Ensure input stays visible on focus
                    setTimeout(() => {
                      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  placeholder={replyingTo ? "Type your reply... (Shift+Enter for new line)" : "Type a message... (Shift+Enter for new line)"}
                  className="flex-1 text-sm rounded-lg pr-12 resize-none min-h-[36px] md:min-h-[40px] max-h-[120px]"
                  rows={1}
                />
                
                {/* Emoji button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-10 md:right-12 top-2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <Smile className="h-4 w-4" />
                </button>
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="rounded-full h-7 w-7 md:h-8 md:w-8 p-0"
                >
                  <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 