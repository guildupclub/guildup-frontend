"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Users, 
  UserPlus, 
  Flame, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { getFriendshipPairs, getPendingInvitations } from "@/lib/api/friendship";
import Link from "next/link";

interface FriendshipPair {
  friendship_id: string;
  friend: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
  current_day: number;
  current_streak: number;
  compatibility_score: number;
  created_at: string;
}

interface PendingInvitation {
  _id: string;
  to_phone: string;
  to_name?: string;
  to_email?: string;
  invite_code: string;
  created_at: string;
  expires_at: string;
}

export default function FriendshipDashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [pairs, setPairs] = useState<FriendshipPair[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = typeof window !== "undefined" ? sessionStorage.getItem("id") : null;
    if (!userId) {
      router.push("/friendship/onboarding");
      return;
    }

    loadData();
    
    // Refresh data every 5 seconds to catch new friendships
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pairsData, invitesData] = await Promise.all([
        getFriendshipPairs(),
        getPendingInvitations(),
      ]);
      setPairs(pairsData.pairs || []);
      setPendingInvites(invitesData.invitations || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityCategory = (score: number) => {
    if (score >= 85) return { label: "PERFECT MATCH", emoji: "💫", color: "bg-purple-500", message: "Incredible connection!" };
    if (score >= 75) return { label: "GREAT CHEMISTRY", emoji: "✨", color: "bg-pink-500", message: "Strong bond!" };
    if (score >= 65) return { label: "GROWING CLOSER", emoji: "🌱", color: "bg-green-500", message: "Building connection" };
    if (score >= 50) return { label: "ON THE RISE", emoji: "📈", color: "bg-blue-500", message: "Getting stronger" };
    if (score >= 35) return { label: "EARLY DAYS", emoji: "🌅", color: "bg-yellow-500", message: "Just getting started" };
    return { label: "BUILDING", emoji: "💙", color: "bg-purple-500", message: "Your journey begins" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-8 w-8 text-purple-500" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Friendships
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Daily conversations deepen your bond. Keep the streak alive and watch your connection grow stronger.
          </p>
        </motion.div>

        {/* Empty State */}
        {pairs.length === 0 && pendingInvites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Users className="h-24 w-24 mx-auto mb-6 text-purple-300" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">Ready to find your friendship match? 🚀</h2>
            <p className="text-gray-600 mb-8">
              Start your journey by inviting your first friend!
            </p>
            <Button
              onClick={() => router.push("/friendship/invite")}
              size="lg"
              className="text-lg px-8 py-6"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Invite Your First Friend
            </Button>
          </motion.div>
        )}

        {/* Active Friendships */}
        {pairs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="whitespace-nowrap">Active Friendships</span>
            </h2>
            <AnimatePresence>
              {pairs.map((pair, idx) => {
                const compat = getCompatibilityCategory(pair.compatibility_score);
                return (
                  <motion.div
                    key={pair.friendship_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/friendship/chat/${pair.friendship_id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={pair.friend.avatar} />
                              <AvatarFallback>
                                {pair.friend.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 break-words">{pair.friend.name}</h3>
                              <div className="flex items-center gap-4 flex-wrap">
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Day {pair.current_day}/30 - {pair.current_streak} day streak
                                </Badge>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${compat.color} text-white whitespace-nowrap`}>
                                    {pair.compatibility_score}% {compat.emoji}
                                  </Badge>
                                  <span className="text-sm text-gray-600 whitespace-nowrap">{compat.message}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="whitespace-nowrap">Pending Invitations</span>
            </h2>
            {pendingInvites.map((invite) => (
              <Card key={invite._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Waiting for {invite.to_name || invite.to_phone || invite.to_email} to join...
                      </p>
                      <p className="text-sm text-gray-600">
                        Invited {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Button */}
        <div className="fixed bottom-6 right-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => router.push("/friendship/invite")}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
            >
              <UserPlus className="h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

