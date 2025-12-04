"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { 
  UserPlus, 
  Copy, 
  Check, 
  ArrowLeft,
  Phone,
  Sparkles,
  AlertCircle,
  LayoutGrid
} from "lucide-react";
import { sendInvite, getPendingInvitations } from "@/lib/api/friendship";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PendingInvitation {
  _id: string;
  to_phone: string;
  to_name?: string;
  invite_code: string;
  created_at: string;
  expires_at: string;
}

export default function InviteFriendPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPendingInvites();
  }, []);

  const loadPendingInvites = async () => {
    try {
      const data = await getPendingInvitations();
      setPendingInvites(data.invitations || []);
    } catch (error: any) {
      console.error("Failed to load pending invitations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (!name.trim()) {
      setError("Friend's name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendInvite(phone.replace("+", ""), name.trim());
      toast.success("Invitation sent successfully via WhatsApp! 🎉");
      setInviteLink(result.invite_link || "");
      setPhone("");
      setName("");
      await loadPendingInvites();
    } catch (error: any) {
      setError(error.message || "Failed to send invitation");
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/friendship/dashboard")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 whitespace-nowrap">Invite a Friend</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/friendship/dashboard")}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="whitespace-nowrap">View Dashboard</span>
          </Button>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserPlus className="h-5 w-5" />
              Send an Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2 text-gray-900">
                  <UserPlus className="h-4 w-4" />
                  Friend&apos;s Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your friend&apos;s name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2 text-gray-900">
                  <Phone className="h-4 w-4" />
                  Friend&apos;s Phone Number *
                </Label>
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  className="border rounded-md p-2 [&_input]:text-gray-900 [&_input]:placeholder:text-gray-500"
                />
                <p className="text-sm text-gray-600 mt-2">
                  They&apos;ll receive an invite link via WhatsApp
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !phone || !name.trim()}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Sending..." : "Send Invitation"}
                {!isSubmitting && <UserPlus className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            {inviteLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <p className="text-sm font-medium text-purple-800 mb-2">
                  Invite link generated! Share it with your friend:
                </p>
                <div className="flex items-center gap-2">
                  <Input value={inviteLink} readOnly className="flex-1 text-xs sm:text-sm truncate text-gray-900" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(inviteLink)}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{invite.to_name || invite.to_phone}</p>
                      <p className="text-sm text-gray-600">
                        Invited {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Max invitations warning */}
        {pendingInvites.length >= 10 && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              You&apos;ve reached the maximum of 10 active invitations. Please wait for some to be accepted or expire.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

