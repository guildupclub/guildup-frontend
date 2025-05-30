"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChatInterface } from './ChatInterface';
import { MessageCircle, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

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
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);

  // Don't show the button if:
  // 1. Expert doesn't have bank connected (not verified)
  // 2. User is viewing their own profile
  if (!isBankConnected || user?.email === expertEmail) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 ${className}`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat with Expert</span>
          <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <ChatInterface 
          receiverEmail={expertEmail}
          receiverDetails={expertDetails}
        />
      </DialogContent>
    </Dialog>
  );
}; 