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
  Save,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Trash2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { removeSpecialCharacters } from '../utils/StringUtils';
import { chatDatabase } from '../../../firebase-chat';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { GoogleMeetButton } from '@/components/google-meet/GoogleMeetButton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  localUrl?: string;
  uploadProgress?: number;
}

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
  const router = useRouter();
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
  
  // File attachment states
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Image preview states
  const [previewImage, setPreviewImage] = useState<{url: string, name: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle mobile keyboard visibility with improved detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        const visualViewport = (window as any).visualViewport;
        if (visualViewport) {
          // More reliable keyboard detection
          const keyboardOpen = visualViewport.height < window.innerHeight * 0.8;
          setIsKeyboardVisible(keyboardOpen);
        }
      };

      const handleFocus = () => {
        // When input is focused, assume keyboard might be visible
        if (window.innerWidth <= 768) {
          setIsKeyboardVisible(true);
        }
      };

      const handleBlur = () => {
        // When input loses focus, keyboard is likely hidden
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            setIsKeyboardVisible(false);
          }, 100);
        }
      };

      // Use visual viewport API for better keyboard detection
      if ((window as any).visualViewport) {
        (window as any).visualViewport.addEventListener('resize', handleResize);
        (window as any).visualViewport.addEventListener('scroll', handleResize);
      } else {
        // Fallback for browsers without visual viewport
        window.addEventListener('resize', handleResize);
      }

      // Add focus/blur listeners for better mobile detection
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('focusout', handleBlur);

      return () => {
        if ((window as any).visualViewport) {
          (window as any).visualViewport.removeEventListener('resize', handleResize);
          (window as any).visualViewport.removeEventListener('scroll', handleResize);
        } else {
          window.removeEventListener('resize', handleResize);
        }
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('focusout', handleBlur);
      };
    }
  }, []);

  // Auto-scroll input into view when keyboard appears
  useEffect(() => {
    if (isKeyboardVisible && inputRef.current) {
      // Small delay to ensure keyboard is fully visible
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          // On mobile, scroll to bottom to show the fixed input
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          inputRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 200);
    }
  }, [isKeyboardVisible]);

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

  // Handle image preview keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewImage) {
        setPreviewImage(null);
      }
    };

    if (previewImage) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [previewImage]);

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

  // File handling utilities
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const SUPPORTED_FILE_TYPES = {
    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
    // PDF
    'application/pdf': ['.pdf']
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File "${file.name}" is too large. Maximum size is 20MB.`);
      return false;
    }

    // Check file type
    const isValidType = Object.keys(SUPPORTED_FILE_TYPES).includes(file.type) ||
      Object.values(SUPPORTED_FILE_TYPES).flat().some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );

    if (!isValidType) {
      toast.error(`File type "${file.type}" is not supported. Supported: Images (JPG, PNG, GIF, WebP, HEIC) and PDF.`);
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  // Convert blob URL to data URL for persistent storage
  const blobToDataURL = async (blobUrl: string): Promise<string> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to data URL:', error);
      throw error;
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FileAttachment[] = [];

    for (const file of fileArray) {
      if (validateFile(file)) {
        const attachment: FileAttachment = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          localUrl: URL.createObjectURL(file),
          uploadProgress: 0
        };
        validFiles.push(attachment);
      }
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      // Don't revoke blob URLs immediately as they might be used in sent messages
      // In a production app, you'd have a cleanup mechanism that runs after messages are sent
      // if (attachment?.localUrl && attachment.localUrl.startsWith('blob:')) {
      //   URL.revokeObjectURL(attachment.localUrl);
      // }
      return prev.filter(a => a.id !== id);
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!currentChat) return;

    const conversation = conversations.find(conv => conv.id === currentChat);
    if (!conversation || !user?.email) return;

    const sanitizedUserEmail = removeSpecialCharacters(user.email);
    const otherParticipantEmail = conversation.participants.find(p => p !== sanitizedUserEmail);

    if (!otherParticipantEmail) return;

    const receiverInfo = conversation.participantDetails[otherParticipantEmail];

    if (!receiverInfo) return;

    // Handle file uploads first if there are attachments
    let uploadedAttachments: any[] = [];
    if (attachments.length > 0) {
      setIsUploading(true);
      try {
        // Convert blob URLs to data URLs for persistent storage
        uploadedAttachments = await Promise.all(
          attachments.map(async (attachment) => {
            let persistentUrl = attachment.localUrl;
            
            // Convert blob URL to data URL for persistence
            if (attachment.localUrl && attachment.localUrl.startsWith('blob:')) {
              try {
                persistentUrl = await blobToDataURL(attachment.localUrl);
                console.log('Converted blob to data URL for:', attachment.name);
              } catch (error) {
                console.error('Failed to convert blob URL for:', attachment.name, error);
                // Keep the original blob URL as fallback
                persistentUrl = attachment.localUrl;
              }
            }
            
            return {
              id: attachment.id,
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
              url: persistentUrl, // Use persistent data URL instead of blob URL
            };
          })
        );
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Failed to upload files. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    // Include reply information if replying to a message
    const messageToSend = replyingTo 
      ? `@${replyingTo.senderName}: ${replyingTo.message}\n\n${newMessage}`
      : newMessage;

    // Create message with attachments
    const messageWithAttachments = {
      message: messageToSend || (attachments.length > 0 ? `📎 ${attachments.length} file(s) attached` : ''),
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
    };

    await sendMessage(receiverInfo.email, messageWithAttachments, receiverInfo);
    
    // Clear input and attachments
    setNewMessage('');
    setAttachments([]);
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
    <div className="flex w-full h-full overflow-hidden bg-white md:border md:border-gray-200 md:rounded-lg">
      
      {/* Conversations List - Hidden on mobile unless showConversations is true */}
      <div className={`${showConversations ? 'flex w-full h-full absolute inset-0 z-50 bg-white' : 'hidden'} md:flex md:w-72 md:relative md:inset-auto md:z-auto md:bg-gray-50 flex-col border-r border-gray-200`}>
        <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Messages</h2>
              <p className="text-xs text-gray-500">Connect with Experts</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => router.push('/')}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white scrollbar-hide mobile-chat-messages">
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
                    className={`w-full p-3 md:p-3 px-4 md:px-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors touch-manipulation mobile-touch-target ${
                      currentChat === conversation.id ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 md:gap-2">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10 md:h-8 md:w-8 mt-0.5">
                          <AvatarImage src={otherParticipant.image} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-sm md:text-xs">
                            {otherParticipant.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {isUserOnline(otherParticipant.email) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 md:mb-0.5">
                          <p className="font-medium text-sm md:text-sm text-gray-900 truncate">
                            {otherParticipant.name}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {conversation.lastMessageTime && (
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(conversation.lastMessageTime)}
                              </span>
                            )}
                            {unreadCounts[conversation.id] > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 md:h-4 md:w-4 flex items-center justify-center font-medium">
                                {unreadCounts[conversation.id] > 9 ? '9+' : unreadCounts[conversation.id]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 truncate pr-2">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                          <span className={`text-xs flex-shrink-0 ${
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
      <div className={`${showConversations ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0 relative h-full ${
        isKeyboardVisible ? 'pb-0' : ''
      }`}>
        {/* Drag and Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-300 z-50 flex items-center justify-center p-4">
            <div className="text-center">
              <Paperclip className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-base md:text-lg font-semibold text-blue-700 mb-2">Drop files to attach</p>
              <p className="text-sm text-blue-600">Support: Images (JPG, PNG, GIF, WebP, HEIC) and PDF up to 20MB</p>
            </div>
          </div>
        )}
        
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-700 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <div 
            ref={dropZoneRef}
            className="flex flex-col flex-1 min-h-0"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-3 md:p-3 px-4 md:px-3 border-b border-gray-200 bg-white flex-shrink-0 mobile-chat-header-sticky">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 mobile-touch-target touch-manipulation"
                onClick={() => setShowConversations(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {(() => {
                const conversation = conversations.find(conv => conv.id === currentChat);
                const otherParticipant = conversation ? getOtherParticipant(conversation) : null;
                
                return otherParticipant ? (
                  <>
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-9 w-9 md:h-8 md:w-8">
                        <AvatarImage src={otherParticipant.image} />
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-sm md:text-xs">
                          {otherParticipant.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isUserOnline(otherParticipant.email) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base md:text-sm text-gray-900 truncate">{otherParticipant.name}</p>
                      <div className="flex items-center gap-1">
                        <p className={`text-sm md:text-xs truncate ${
                          isUserOnline(otherParticipant.email) ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {getStatusText(otherParticipant.email)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Google Meet Button */}
                    <div className="flex-shrink-0">
                      <GoogleMeetButton
                        receiverEmail={otherParticipant.email}
                        receiverName={otherParticipant.name}
                        size="sm"
                        variant="ghost"
                        // className="mobile-touch-target touch-manipulation"
                      />
                    </div>
                  </>
                ) : null;
              })()}
            </div>

            {/* Messages */}
            <div 
              className={`flex-1 overflow-y-auto min-h-0 relative scroll-smooth ${
                isKeyboardVisible ? 'pb-20' : ''
              }`}
              style={{ 
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                paddingBottom: isKeyboardVisible && window.innerWidth <= 768 ? '80px' : '0px'
              }}
            >
              <div className="p-3 md:p-3 px-4 md:px-3 pb-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-5 w-5 border-primary"></div>
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
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group px-2 md:px-0`}
                        >
                          <div
                            className={`mobile-message-bubble max-w-[85%] sm:max-w-xs lg:max-w-sm px-3 md:px-3 py-2.5 md:py-2 rounded-lg relative ${
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
                                <div className="text-sm md:text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {detectAndRenderLinks(replyData ? replyData.reply : message.message)}
                                </div>
                                
                                {/* Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map((attachment: any) => (
                                      <div key={attachment.id} className={`flex items-center gap-2 p-2 rounded-lg border ${
                                        isOwnMessage 
                                          ? 'bg-blue-600/20 border-blue-200' 
                                          : 'bg-gray-200 border-gray-300'
                                      }`}>
                                        <div className="flex-shrink-0">
                                          {attachment.type.startsWith('image/') ? (
                                            <div className="relative cursor-pointer group"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const imageUrl = attachment.url || attachment.localUrl;
                                                console.log('Image preview click:', {
                                                  attachmentId: attachment.id,
                                                  url: attachment.url,
                                                  localUrl: attachment.localUrl,
                                                  finalUrl: imageUrl,
                                                  name: attachment.name,
                                                  type: attachment.type,
                                                  urlType: imageUrl?.startsWith('data:') ? 'data-url' : 
                                                           imageUrl?.startsWith('blob:') ? 'blob-url' : 'other'
                                                });
                                                if (imageUrl) {
                                                  setPreviewImage({url: imageUrl, name: attachment.name});
                                                } else {
                                                  console.error('No URL available for attachment:', attachment);
                                                  toast.error('Image not available for preview.');
                                                }
                                              }}
                                            >
                                              <img
                                                src={attachment.url || attachment.localUrl}
                                                alt={attachment.name}
                                                className="w-12 h-12 object-cover rounded"
                                                onError={(e) => {
                                                  console.log('Sent image failed to load:', attachment.url || attachment.localUrl);
                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                              />
                                              <div className="hidden w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                                                {getFileIcon(attachment.type)}
                                              </div>
                                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-white" />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                              {getFileIcon(attachment.type)}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-xs font-medium truncate ${
                                            isOwnMessage ? 'text-blue-100' : 'text-gray-900'
                                          }`}>
                                            {attachment.name}
                                          </p>
                                          <p className={`text-xs ${
                                            isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                                          }`}>
                                            {formatFileSize(attachment.size)}
                                          </p>
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const fileUrl = attachment.url || attachment.localUrl;
                                            if (fileUrl) {
                                              try {
                                                // For blob URLs, we need to handle them differently
                                                if (fileUrl.startsWith('blob:')) {
                                                  // Create a temporary link for blob download
                                                  const link = document.createElement('a');
                                                  link.href = fileUrl;
                                                  link.download = attachment.name;
                                                  document.body.appendChild(link);
                                                  link.click();
                                                  document.body.removeChild(link);
                                                } else {
                                                  // Regular file download
                                                  const link = document.createElement('a');
                                                  link.href = fileUrl;
                                                  link.download = attachment.name;
                                                  link.target = '_blank';
                                                  link.click();
                                                }
                                              } catch (error) {
                                                console.error('Download failed:', error);
                                                toast.error('Download failed. Please try again.');
                                              }
                                            } else {
                                              console.error('No URL available for download:', attachment);
                                              toast.error('File not available for download.');
                                            }
                                          }}
                                          className={`flex-shrink-0 p-1 rounded transition-colors ${
                                            isOwnMessage 
                                              ? 'hover:bg-blue-600/30 text-blue-100' 
                                              : 'hover:bg-gray-300 text-gray-600'
                                          }`}
                                          title="Download"
                                        >
                                          <Download className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
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

            {/* Message Input - Fixed at bottom with proper mobile positioning */}
            <div className={`border-t border-gray-200 bg-white flex-shrink-0 p-3 ${
              isKeyboardVisible && window.innerWidth <= 768
                ? 'mobile-chat-input-fixed' 
                : ''
            }`}
              style={{
                paddingBottom: isKeyboardVisible && window.innerWidth <= 768
                  ? `max(12px, env(safe-area-inset-bottom))` 
                  : '12px'
              }}
            >
              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {attachments.length} file(s) attached
                    </span>
                    <button
                      onClick={() => setAttachments([])}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <div className="flex-shrink-0">
                          {attachment.type.startsWith('image/') ? (
                            <div className="relative cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                const imageUrl = attachment.url || attachment.localUrl;
                                console.log('Image preview click:', {
                                  attachmentId: attachment.id,
                                  url: attachment.url,
                                  localUrl: attachment.localUrl,
                                  finalUrl: imageUrl,
                                  name: attachment.name,
                                  type: attachment.type,
                                  urlType: imageUrl?.startsWith('data:') ? 'data-url' : 
                                           imageUrl?.startsWith('blob:') ? 'blob-url' : 'other'
                                });
                                if (imageUrl) {
                                  setPreviewImage({url: imageUrl, name: attachment.name});
                                } else {
                                  console.error('No URL available for attachment:', attachment);
                                  toast.error('Image not available for preview.');
                                }
                              }}
                            >
                              <img
                                src={attachment.url || attachment.localUrl}
                                alt={attachment.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  console.log('Sent image failed to load:', attachment.url || attachment.localUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                                {getFileIcon(attachment.type)}
                              </div>
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              {getFileIcon(attachment.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                          {attachment.uploadProgress !== undefined && attachment.uploadProgress < 100 && (
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${attachment.uploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply preview */}
              {replyingTo && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border-l-4 border-primary">
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

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className={`emoji-picker absolute ${
                  isKeyboardVisible ? 'bottom-16' : 'bottom-20'
                } right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 max-w-xs`}>
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

              <div className="flex gap-2 items-center relative">
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Attach files"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </button>

                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                  className="flex-1 text-sm md:text-base rounded-xl pr-16 md:pr-20 resize-none min-h-[40px] max-h-[120px] mobile-chat-input focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  disabled={isUploading}
                  style={{
                    fontSize: window.innerWidth <= 768 ? '16px' : '14px', // Prevent zoom on iOS
                    lineHeight: '1.4',
                    padding: '12px 16px'
                  }}
                />
                
                {/* Emoji button */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-12 md:right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 touch-manipulation transition-colors"
                  disabled={isUploading}
                  style={{ zIndex: 10 }}
                  title="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                
                <Button 
                  onClick={handleSendMessage} 
                  disabled={(!newMessage.trim() && attachments.length === 0) || isUploading}
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 flex-shrink-0 touch-manipulation min-w-[32px] min-h-[32px]"
                  title="Send message"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            {/* Close Button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white text-2xl z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Image */}
            <div className="relative">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.error('Error loading preview image:', previewImage?.url);
                  console.error('URL type:', previewImage?.url?.startsWith('data:') ? 'data-url' : 
                                           previewImage?.url?.startsWith('blob:') ? 'blob-url' : 'other');
                  toast.error('Failed to load image preview. The image may have expired.');
                  setPreviewImage(null);
                }}
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                <p className="text-white/90 text-sm font-medium truncate">
                  {previewImage.name}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewImage) {
                        try {
                          // Use the same download logic as the attachment button
                          if (previewImage.url.startsWith('blob:')) {
                            // Create a temporary link for blob download
                            const link = document.createElement('a');
                            link.href = previewImage.url;
                            link.download = previewImage.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            // Regular file download
                            const link = document.createElement('a');
                            link.href = previewImage.url;
                            link.download = previewImage.name;
                            link.target = '_blank';
                            link.click();
                          }
                        } catch (error) {
                          console.error('Download failed:', error);
                          toast.error('Download failed. Please try again.');
                        }
                      }
                    }}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (previewImage) {
                        window.open(previewImage.url, '_blank');
                      }
                    }}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 