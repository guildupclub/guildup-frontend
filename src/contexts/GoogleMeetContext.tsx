import React, { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { chatDatabase } from '../../firebase-chat';
import { ref, update, push } from 'firebase/database';
import { removeSpecialCharacters } from '@/components/utils/StringUtils';
import { toast } from 'sonner';

declare global {
  interface Window {
    guildupMeetCapture?: {
      onUrlCaptured: (url: string) => void;
    };
  }
}

interface GoogleMeetContextType {
  createMeeting: (receiverEmail: string, receiverName: string) => Promise<string>;
  scheduleMeeting: (receiverEmail: string, receiverName: string, scheduledTime: Date, title?: string) => Promise<string>;
  joinMeeting: (meetingUrl: string) => void;
  isCreatingMeeting: boolean;
  isSchedulingMeeting: boolean;
}

const GoogleMeetContext = createContext<GoogleMeetContextType | undefined>(undefined);

export const useGoogleMeet = () => {
  const context = useContext(GoogleMeetContext);
  if (!context) {
    throw new Error('useGoogleMeet must be used within a GoogleMeetProvider');
  }
  return context;
};

export const GoogleMeetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);

  const sendMeetingLinkToChat = async (receiverEmail: string, meetingUrlOrMessage: string, receiverName: string) => {
    if (!user?.email) return;

    try {
      const sanitizedUserEmail = removeSpecialCharacters(user.email);
      const sanitizedReceiverEmail = removeSpecialCharacters(receiverEmail);
      const chatId = [sanitizedUserEmail, sanitizedReceiverEmail].sort().join('_');

      const isScheduledMeeting = meetingUrlOrMessage.includes('**Meeting Scheduled**');
      
      const messagesRef = ref(chatDatabase, `messages/${chatId}`);
      const messageData = {
        message: isScheduledMeeting 
          ? meetingUrlOrMessage
          : `🎥 Google Meet: ${meetingUrlOrMessage}\n\nClick the link above to join our video call!`,
        senderEmail: sanitizedUserEmail,
        senderName: user.name || 'User',
        receiverEmail: sanitizedReceiverEmail,
        timestamp: Date.now(),
        read: false,
        type: isScheduledMeeting ? 'scheduled-meeting' : 'google-meet' 
      };

      await push(messagesRef, messageData);

      const conversationRef = ref(chatDatabase, `conversations/${chatId}`);
      const lastMessage = isScheduledMeeting 
        ? ' Scheduled a meeting'
        : 'Shared Google Meet link';
        
      await update(conversationRef, {
        lastMessage,
        lastMessageTime: Date.now(),
        participants: [sanitizedUserEmail, sanitizedReceiverEmail],
        participantDetails: {
          [sanitizedUserEmail]: {
            email: user.email,
            name: user.name,
            image: user.image
          },
          [sanitizedReceiverEmail]: {
            email: receiverEmail,
            name: receiverName,
            image: '' // We don't have receiver image here
          }
        }
      });

      
    } catch (error) {
      console.error('Error sending meeting message to chat:', error);
      throw error;
    }
  };

  const captureUrlWithExtension = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (window.guildupMeetCapture) {
        window.guildupMeetCapture.onUrlCaptured = (url: string) => {
          resolve(url);
        };
        setTimeout(() => reject(new Error('Extension timeout')), 30000);
      } else {
        reject(new Error('Browser extension not available'));
      }
    });
  };

  const captureUrlWithPostMessage = async (meetingWindow: Window): Promise<string> => {
    return new Promise((resolve, reject) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://meet.google.com') return;
        
        if (event.data.type === 'GOOGLE_MEET_URL' && event.data.url) {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.url);
        }
      };

      window.addEventListener('message', handleMessage);
      
      
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        reject(new Error('PostMessage timeout'));
      }, 30000);
    });
  };

  const createMeeting = async (receiverEmail: string, receiverName: string): Promise<string> => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    setIsCreatingMeeting(true);

    try {
      console.log('Creating Google Meet for:', receiverName);

      const meetingWindow = window.open(
        'https://meet.google.com/new');
      
      if (!meetingWindow) {
        toast.error('Failed to open Google Meet. Please allow pop-ups and try again.');
        return 'https://meet.google.com/new';
      }

      const waitForMeetingUrl = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 60; // 60 seconds max wait
          let lastKnownUrl = '';
          
          const checkForMeetingUrl = () => {
            attempts++;
            
            try {
              if (meetingWindow.closed) {
                reject(new Error('Meeting window was closed'));
                return;
              }
              
              let currentUrl = '';
              try {
                currentUrl = meetingWindow.location.href;
                
                if (currentUrl !== lastKnownUrl) {
                  lastKnownUrl = currentUrl;
                }
                
                if (currentUrl && 
                    currentUrl.includes('meet.google.com/') && 
                    currentUrl !== 'https://meet.google.com/new' &&
                    !currentUrl.includes('landing') &&
                    !currentUrl.includes('error') &&
                    currentUrl.match(/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/)) {
                  
                  resolve(currentUrl);
                  return;
                }
                
              } catch (corsError) {
                if (attempts > 20) {
                  
                  try {
                    const windowName = meetingWindow.name;
                    if (windowName && windowName.includes('meet')) {
                      reject(new Error('CORS_FALLBACK'));
                      return;
                    }
                  } catch (e) {
                    console.error('Error checking for meeting URL:', e);
                  }
                }
              }
              
              if (attempts < maxAttempts) {
                setTimeout(checkForMeetingUrl, 1000);
              } else {
                reject(new Error('Timeout waiting for meeting URL'));
              }
              
            } catch (error) {
              if (attempts < maxAttempts) {
                setTimeout(checkForMeetingUrl, 1000);
              } else {
                reject(new Error('Error monitoring meeting creation'));
              }
            }
          };
          
          setTimeout(checkForMeetingUrl, 3000);
        });
      };
      
      try {
        const meetingUrl = await waitForMeetingUrl();
        
        await sendMeetingLinkToChat(receiverEmail, meetingUrl, receiverName);
        
        toast.success(`Meeting link sent to ${receiverName}!`, {
          description: 'Meeting room is ready'
        });
        
        setTimeout(() => {
          window.open(meetingUrl, '_blank', 'noopener,noreferrer');
          meetingWindow.close(); // Close the original window
        }, 1000);
        
        return meetingUrl;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('⚠️ Could not auto-detect meeting URL:', errorMessage);
        
        if (errorMessage === 'CORS_FALLBACK') {
          toast.info(`Meeting is ready! Please copy the URL from the Google Meet tab and share it in chat with ${receiverName}`, {
            duration: 10000,
            action: {
              label: 'How to copy?',
              onClick: () => {
                toast.info('1. Switch to the Google Meet tab\n2. Copy the URL from the address bar\n3. Paste it in the chat', {
                  duration: 15000
                });
              }
            }
          });
        } else {
          // Other error (timeout, window closed, etc.)
          meetingWindow.close();
        }
        
        return 'https://meet.google.com/new';
      }
    } catch (error) {
      toast.error('Failed to create meeting. Please try again.');
      return 'https://meet.google.com/new';
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const scheduleMeeting = async (receiverEmail: string, receiverName: string, scheduledTime: Date, title?: string): Promise<string> => {
    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    setIsSchedulingMeeting(true);

    try {

      const startTime = scheduledTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; // 1 hour duration
      
      const meetingTitle = title || `Meeting with ${receiverName}`;
      
      const calendarParams = new URLSearchParams({
        action: 'TEMPLATE',
        text: meetingTitle,
        dates: `${startTime}/${endTime}`,
        details: `Video meeting scheduled with ${receiverName}\n\nThis meeting will include a Google Meet link automatically.\n\nOrganized via GuildUp\n\nFor any questions or support, contact: support@guildup.club`,
        add: `${receiverEmail},support@guildup.club`,
        sf: 'true',
        output: 'xml'
      });

      const calendarUrl = `https://calendar.google.com/calendar/render?${calendarParams}`;
      
      
      const calendarWindow = window.open(calendarUrl, '_blank', 'width=1000,height=700');
      
      if (!calendarWindow) {
        toast.error('Failed to open Google Calendar. Please allow pop-ups and try again.');
        return '';
      }

      const scheduledMessage = `📅 **Meeting Scheduled**\n\n` +
        `${meetingTitle}\n` +
        `${scheduledTime.toLocaleString()}\n` +
        `${receiverName}\n\n` +
        `A Google Calendar invite with Google Meet link has been created. Please save the event to confirm the meeting.`;

      await sendMeetingLinkToChat(receiverEmail, scheduledMessage, receiverName);

      toast.success(`Meeting scheduled with ${receiverName}!`, {
        description: 'Calendar event opened - please save to confirm'
      });

      return calendarUrl;
      
    } catch (error) {
      toast.error('Failed to schedule meeting. Please try again.');
      return '';
    } finally {
      setIsSchedulingMeeting(false);
    }
  };

  const joinMeeting = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  };

  const value: GoogleMeetContextType = {
    createMeeting,
    scheduleMeeting,
    joinMeeting,
    isCreatingMeeting,
    isSchedulingMeeting,
  };

  return (
    <GoogleMeetContext.Provider value={value}>
      {children}
    </GoogleMeetContext.Provider>
  );
}; 