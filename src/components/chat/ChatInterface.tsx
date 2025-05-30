"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Check
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { removeSpecialCharacters } from '../utils/StringUtils';
import { chatDatabase } from '../../../firebase-chat';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    await sendMessage(receiverInfo.email, newMessage, receiverInfo);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                  </>
                ) : null;
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0">
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
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatMessageTime(message.timestamp)}
                              </span>
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
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom with keyboard handling */}
            <div className={`p-3 border-t border-gray-200 bg-white flex-shrink-0 ${
              isKeyboardVisible ? 'pb-safe-area-inset-bottom' : ''
            }`}>
              <div className="flex gap-2 items-center">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    // Ensure input stays visible on focus
                    setTimeout(() => {
                      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                  placeholder="Type a message..."
                  className="flex-1 text-sm rounded-full"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="rounded-full h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 