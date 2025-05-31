"use client";

import React, { useEffect, useState } from 'react';
import { useVoiceCall } from '@/contexts/VoiceCallContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistance } from 'date-fns';

interface VoiceCallInterfaceProps {
  className?: string;
}

export const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({ 
  className = '' 
}) => {
  const {
    currentCall,
    callStatus,
    isIncomingCall,
    isMuted,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    isConnected
  } = useVoiceCall();

  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good');

  // Update call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callStatus === 'active' && currentCall?.startTime) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - new Date(currentCall.startTime!).getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus, currentCall?.startTime]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status badge variant
  const getStatusVariant = () => {
    switch (callStatus) {
      case 'ringing': return 'secondary';
      case 'connecting': return 'secondary';
      case 'active': return 'default';
      case 'ended': return 'destructive';
      default: return 'outline';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing': return isIncomingCall ? 'Incoming call...' : 'Calling...';
      case 'connecting': return 'Connecting... (This may take up to 45 seconds)';
      case 'active': return formatDuration(callDuration);
      case 'ended': return 'Call ended';
      default: return '';
    }
  };

  // Get signal icon based on connection quality
  const getSignalIcon = () => {
    switch (connectionQuality) {
      case 'good': return <SignalHigh className="w-4 h-4" />;
      case 'medium': return <SignalMedium className="w-4 h-4" />;
      case 'poor': return <SignalLow className="w-4 h-4" />;
      default: return <Signal className="w-4 h-4" />;
    }
  };

  const handleEndCall = () => {
    if (callStatus === 'connecting') {
      // Show confirmation for ending during connection
      if (confirm('Are you sure you want to cancel the connection attempt?')) {
        endCall();
      }
    } else {
      endCall();
    }
  };

  if (!currentCall || callStatus === 'idle') {
    return null;
  }

  const otherParticipant = isIncomingCall ? currentCall.caller : currentCall.callee;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Card className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant={getStatusVariant()} className="text-xs">
                {getStatusText()}
              </Badge>
              {isConnected && (
                <div className="flex items-center gap-1 text-slate-400">
                  {getSignalIcon()}
                  <span className="text-xs">
                    {connectionQuality === 'good' ? 'Excellent' : 
                     connectionQuality === 'medium' ? 'Good' : 'Poor'}
                  </span>
                </div>
              )}
            </div>

            {/* Participant Info */}
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={otherParticipant?.profileImage || '/placeholder-avatar.png'} 
                    alt={otherParticipant?.name || 'User'} 
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {(otherParticipant?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Connection indicator */}
                {callStatus === 'connecting' && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white rounded-full p-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Name and status */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">
                  {otherParticipant?.name || 'Unknown'}
                </h2>
                <div className="space-y-1">
                  <p className={getStatusVariant() === 'destructive' ? 'text-red-400' : 'text-slate-400'}>{getStatusText()}</p>
                  {callStatus === 'connecting' && (
                    <p className="text-sm text-muted-foreground">
                      Please wait while we establish the connection...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Call controls */}
            <div className="flex items-center justify-center space-x-4">
              {/* Mute button - only show during active call */}
              {callStatus === 'active' && (
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </Button>
              )}
              
              {/* End call button */}
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={handleEndCall}
              >
                <PhoneOff size={24} />
              </Button>
              
              {/* Answer button - only for incoming calls */}
              {isIncomingCall && callStatus === 'ringing' && (
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700"
                  onClick={acceptCall}
                >
                  <Phone size={24} />
                </Button>
              )}
            </div>

            {/* Additional info for active calls */}
            {callStatus === 'active' && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Voice</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isMuted && <MicOff className="w-3 h-3" />}
                    <span>{isMuted ? 'Muted' : 'Unmuted'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}; 