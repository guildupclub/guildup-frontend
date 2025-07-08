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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        {/* Header - Now always visible, sticky on mobile - positioned right under navbar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 sticky top-0 z-40">
          <div className="px-4 py-3 md:py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="p-1">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <h1 className="text-base md:text-lg font-semibold">
                    {expertDetails ? `Chat with ${expertDetails.name}` : 'Expert Support Chat'}
                  </h1>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {expertDetails ? 'Start a conversation with this verified expert' : 'Manage your expert conversations'}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Verified Expert</span>
                <span className="sm:hidden">Expert</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Interface - Full height minus header and bottom navbar on mobile */}
        <div className="flex-1 min-h-0 w-full md:container md:mx-auto p-0 md:p-4 pb-16 md:pb-0">
          <div className="h-full w-full bg-background md:rounded-lg md:border md:shadow-sm">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
} 