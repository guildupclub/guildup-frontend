"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

function ChatContent() {
  const user = useSelector((state: RootState) => state.user.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expertDetails, setExpertDetails] = useState<{
    email: string;
    name: string;
    image?: string;
  } | null>(null);

  // Check for expert details in URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const expertEmail = searchParams.get('expertEmail');
    const expertName = searchParams.get('expertName');
    const expertImage = searchParams.get('expertImage');

    if (expertEmail && expertName) {
      setExpertDetails({
        email: expertEmail,
        name: expertName,
        image: expertImage || undefined
      });
      
      // Clean up URL after processing parameters
      router.replace('/chat', { scroll: false });
    }
  }, [searchParams, router]);

  if (!user?.email) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center p-4 fixed inset-0 overflow-hidden">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Expert Chat Support</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please sign in to access your expert support chat
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChatProvider>
      {/* Full viewport container - mobile-first approach */}
      <div className="h-screen w-screen bg-white fixed inset-0 overflow-hidden md:relative md:h-[calc(100vh-80px)] md:w-full">
        {/* Chat Interface - Takes full available space */}
        <div className="h-full w-full md:container md:mx-auto md:p-4 md:h-full">
          <div className="h-full w-full bg-white md:rounded-lg md:border md:shadow-sm md:max-h-[calc(100vh-160px)]">
            <ChatInterface 
              receiverEmail={expertDetails?.email}
              receiverDetails={expertDetails ? {
                name: expertDetails.name,
                email: expertDetails.email,
                image: expertDetails.image
              } : undefined}
            />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-background flex items-center justify-center fixed inset-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
} 