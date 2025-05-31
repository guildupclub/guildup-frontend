"use client";

import React from 'react';
import { useVoiceCall } from '@/contexts/VoiceCallContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Phone, PhoneOff, Loader2 } from 'lucide-react';
import { CallParticipant } from '@/services/webrtcService';
import { toast } from 'sonner';

interface VoiceCallButtonProps {
  callee: CallParticipant;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
}

export const VoiceCallButton: React.FC<VoiceCallButtonProps> = ({
  callee,
  variant = 'ghost',
  size = 'icon',
  disabled = false,
  className = ''
}) => {
  const {
    isConnected,
    callStatus,
    currentCall,
    initiateCall,
    endCall
  } = useVoiceCall();

  // Check if currently in call with this person
  const isInCallWithUser = currentCall && 
    (currentCall.caller.id === callee.id || currentCall.callee.id === callee.id);

  // Determine button state
  const isInAnyCall = callStatus !== 'idle';
  const isCallButtonDisabled = disabled || !isConnected || (isInAnyCall && !isInCallWithUser);

  const handleCallAction = async () => {
    try {
      if (isInCallWithUser) {
        // End current call
        endCall();
      } else if (callStatus === 'idle') {
        // Start new call
        await initiateCall(callee);
      } else {
        // Already in call with someone else
        toast.warning('You are already in a call');
      }
    } catch (error) {
      console.error('Error with call action:', error);
      toast.error('Call action failed');
    }
  };

  const getButtonContent = () => {
    if (callStatus === 'connecting' && isInCallWithUser) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    if (isInCallWithUser && callStatus !== 'idle') {
      return <PhoneOff className="w-4 h-4" />;
    }
    
    return <Phone className="w-4 h-4" />;
  };

  const getTooltipText = () => {
    if (!isConnected) {
      return 'Voice call service not connected';
    }
    
    if (isCallButtonDisabled && isInAnyCall && !isInCallWithUser) {
      return 'Already in a call';
    }
    
    if (isInCallWithUser) {
      return 'End call';
    }
    
    return `Call ${callee.name}`;
  };

  const getButtonVariant = () => {
    if (isInCallWithUser && callStatus !== 'idle') {
      return 'destructive';
    }
    return variant;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={getButtonVariant() as any}
            size={size}
            onClick={handleCallAction}
            disabled={isCallButtonDisabled}
            className={`${className} ${
              isInCallWithUser && callStatus === 'active' 
                ? 'bg-red-600 hover:bg-red-700' 
                : ''
            }`}
            aria-label={getTooltipText()}
          >
            {getButtonContent()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 