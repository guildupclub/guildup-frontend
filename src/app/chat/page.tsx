"use client";

import React, { useEffect, useState } from 'react';
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

export default function ChatPage() {
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

  if (!user?._id) {
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
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="h-screen bg-background flex flex-col mobile-chat-container overflow-hidden" style={{
        paddingTop: typeof window !== 'undefined' && window.innerWidth < 768 ? '56px' : '0',
        paddingBottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '56px' : '0'
      }}>
        {/* Header - Hidden on mobile to save space for chat content */}
        <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">
                    {expertDetails ? `Chat with ${expertDetails.name}` : 'Expert Support Chat'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {expertDetails ? 'Start a conversation with this verified expert' : 'Manage your expert conversations'}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Verified Expert
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat Interface - Full height on mobile, optimized container on desktop */}
        <div className="flex-1 min-h-0 w-full md:container md:mx-auto p-0 md:p-4">
          <div className="h-full w-full bg-background md:rounded-lg md:border md:shadow-sm">
            <ChatInterface 
              receiverEmail={expertDetails?.email}
              receiverDetails={expertDetails ? {
                name: expertDetails.name,
                email: expertDetails.email,
                image: expertDetails.image,
              } : undefined}
            />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
} 