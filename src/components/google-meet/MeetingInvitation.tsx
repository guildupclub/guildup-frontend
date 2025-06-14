import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { chatDatabase } from '../../../firebase-chat';
import { ref, onValue, off, remove } from 'firebase/database';
import { removeSpecialCharacters } from '@/components/utils/StringUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VideoIcon, X, Calendar } from 'lucide-react';
import { useGoogleMeet } from '@/contexts/GoogleMeetContext';
import { toast } from 'sonner';

interface MeetingInvite {
  id: string;
  meetingId: string;
  meetingUrl: string;
  inviterEmail: string;
  inviterName: string;
  inviterImage?: string;
  message: string;
  timestamp: number;
  status?: 'creating' | 'ready' | 'failed';
}

export const MeetingInvitations: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [invitations, setInvitations] = useState<MeetingInvite[]>([]);
  const { joinMeeting } = useGoogleMeet();

  useEffect(() => {
    if (!user?.email) return;

    const sanitizedEmail = removeSpecialCharacters(user.email);
    const invitationsRef = ref(chatDatabase, `meetingInvitations/${sanitizedEmail}`);

    const handleInvitations = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const invitesList = Object.entries(data).map(([id, invite]: [string, any]) => ({
          id,
          ...invite,
        }));
        setInvitations(invitesList);
      } else {
        setInvitations([]);
      }
    };

    onValue(invitationsRef, handleInvitations);

    return () => {
      off(invitationsRef, 'value', handleInvitations);
    };
  }, [user?.email]);

  const handleJoinMeeting = (invite: MeetingInvite) => {
    
    joinMeeting(invite.meetingUrl);
    dismissInvitation(invite.id);
    toast.success(`Joining Google Meet with ${invite.inviterName}!`);
  };

  const dismissInvitation = async (inviteId: string) => {
    if (!user?.email) return;

    try {
      const sanitizedEmail = removeSpecialCharacters(user.email);
      const inviteRef = ref(chatDatabase, `meetingInvitations/${sanitizedEmail}/${inviteId}`);
      await remove(inviteRef);
    } catch (error) {
      console.error('Error dismissing invitation:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {invitations.map((invite) => {
        const isCreating = invite.status === 'creating';
        const isReady = invite.status === 'ready' || (!invite.status && invite.meetingUrl !== 'https://meet.google.com/new');
        const isFailed = invite.status === 'failed';
        
        return (
          <Card key={invite.id} className={`shadow-lg border-blue-200 ${
            isCreating ? 'bg-yellow-50' : isReady ? 'bg-green-50' : isFailed ? 'bg-red-50' : 'bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={invite.inviterImage} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {invite.inviterName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">
                      {invite.inviterName}
                    </h4>
                    <p className="text-xs text-gray-600">{invite.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(invite.timestamp)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={() => dismissInvitation(invite.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Status-based content */}
              {isCreating && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                  <span className="text-sm text-yellow-700">Creating meeting room...</span>
                </div>
              )}

              {isReady && (
                <div className="flex space-x-2 mb-2">
                  <Button
                    onClick={() => handleJoinMeeting(invite)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm h-8"
                  >
                    <VideoIcon className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-sm border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      navigator.clipboard.writeText(invite.meetingUrl);
                      toast.success('Meeting link copied to clipboard!');
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              )}

              {isFailed && (
                <div className="p-2 bg-red-100 rounded text-xs text-red-700 mb-2">
                   Meeting creation failed. Please try again.
                </div>
              )}

              {isCreating && (
                <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-700">
                   <strong>Please wait:</strong> {invite.inviterName} is setting up the meeting room. You&apos;ll be able to join once it&apos;s ready.
                </div>
              )}

              {isReady && (
                <div className="mt-2 p-2 bg-green-100 rounded text-xs text-green-700">
                  <strong>Ready to join:</strong> Meeting room is created! Click &quot;Join Meeting&quot; to enter the same room as {invite.inviterName}.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}; 