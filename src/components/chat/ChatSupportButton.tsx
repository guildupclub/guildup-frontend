"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';

interface ChatSupportButtonProps {
  expertEmail: string;
  expertDetails: {
    name: string;
    email: string;
    image?: string;
  };
  isBankConnected: boolean;
  className?: string;
}

export const ChatSupportButton: React.FC<ChatSupportButtonProps> = ({
  expertEmail,
  expertDetails,
  isBankConnected,
  className = ""
}) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  // Don't show the button if:
  // 1. Expert doesn't have bank connected (not verified)
  // 2. User is viewing their own profile
  if (!isBankConnected || user?.email === expertEmail) {
    return null;
  }

  const handleChatClick = () => {
    // Navigate to chat page with expert details as URL parameters
    const searchParams = new URLSearchParams({
      expertEmail: expertDetails.email,
      expertName: expertDetails.name,
      expertImage: expertDetails.image || ''
    });
    
    router.push(`/chat?${searchParams.toString()}`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleChatClick}
      className={`flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      <span>Chat with Expert</span>
      <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 text-xs">
        <Shield className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    </Button>
  );
}; 