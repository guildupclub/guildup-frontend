"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { 
  UserPlus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  PartyPopper
} from "lucide-react";
import { getInviteDetails, acceptInvite, verifyToken } from "@/lib/api/friendship";
import Link from "next/link";

export default function InviteAcceptancePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.inviteCode as string;

  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
      
      if (!token || !userId) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
        loadInviteDetails();
        return;
      }

      try {
        // Verify token is valid
        await verifyToken();
        setIsLoggedIn(true);
      } catch (error) {
        // Token invalid, clear session
        sessionStorage.clear();
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
        loadInviteDetails();
      }
    };

    checkAuth();
  }, []);

  const loadInviteDetails = async () => {
    try {
      setLoading(true);
      const data = await getInviteDetails(inviteCode);
      setInviteDetails(data.invitation);
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isLoggedIn) {
      // Redirect to onboarding with invite code
      router.push(`/friendship/onboarding?inviteCode=${inviteCode}`);
      return;
    }

    setAccepting(true);
    try {
      const result = await acceptInvite(inviteCode);
      toast.success("Invitation accepted! 🎉");
      setAccepted(true);
      
      // Redirect to chat after 2 seconds
      setTimeout(() => {
        router.push(`/friendship/chat/${result.friendship_id}`);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!inviteDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-gray-900">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-900">
            <p className="text-gray-600 mb-4">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => router.push("/friendship/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <PartyPopper className="h-24 w-24 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-4">Friendship Created! 🎉</h1>
          <p className="text-2xl mb-8">Redirecting to your chat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-gray-900">You&apos;ve Been Invited!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src={inviteDetails.from_user?.avatar} />
              <AvatarFallback>
                {inviteDetails.from_user?.name?.charAt(0).toUpperCase() || "F"}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-semibold mb-2 text-gray-900">
              {inviteDetails.from_user?.name} invited you to GuildUp!
            </p>
            <p className="text-sm text-gray-700">
              Join them on a 30-day friendship journey to discover your compatibility
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              <strong className="font-semibold text-gray-900">What&apos;s GuildUp?</strong> A platform where you and your friend answer daily
              questions, build conversation streaks, and discover how compatible you are as friends!
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-gray-700">
                Sign up or log in to accept this invitation
              </p>
              <Button
                onClick={handleAccept}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                size="lg"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium text-gray-700">
                Ready to start your friendship journey?
              </p>
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                size="lg"
              >
                {accepting ? "Accepting..." : "Accept Invitation"}
                {!accepting && <CheckCircle2 className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-gray-600 pt-2 border-t">
            <p>Invitation expires: {new Date(inviteDetails.expires_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

