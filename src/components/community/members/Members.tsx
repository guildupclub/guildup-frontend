"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";

interface User {
  _id: string;
  user_name?: string;
  email: string;
  avatar: string | null;
}

interface Member {
  _id: string;
  user_id: User;
  is_moderator: boolean;
  is_owner: boolean;
  is_banned: boolean;
  createdAt: string;
}

interface MembersResponse {
  r: string;
  data: Member[];
}

interface MembersProps {
  communityId: string;
}

export default function Members({communityId}: MembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const baseUrlBackend = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const { user } = useSelector((state: RootState) => state.user);
  const removerUserId = user?._id;


  const activeCommunityId = communityId

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/members`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ communityId: activeCommunityId }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch members");

        const data: MembersResponse = await response.json();
        setMembers(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeCommunityId) fetchMembers();
  }, [communityId]);

  const handleRemoveClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true);
  };

  const confirmRemoveUser = async () => {
    if (!selectedUserId || !removerUserId || !communityId) return;

    try {
      const response = await fetch(
        `${baseUrlBackend}/v1/community/removeUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUserId,
            communityId,
            removerUserId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to remove user");

      setMembers(
        members.filter((member) => member.user_id._id !== selectedUserId)
      );
    } catch (error) {
      console.error(error);
    } finally {
      setShowConfirmModal(false);
      setSelectedUserId(null);
    }
  };

  if (error) {
    return (
      <Card className="bg-card border-zinc-700">
        <CardContent className="pt-6">
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-background text-muted-foreground m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted">
          <UserCircle className="h-5 w-5 text-accent" />
          {StringConstants.FOLLOWER}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-card" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-card" />
                    <Skeleton className="h-4 w-[150px] bg-card" />
                  </div>
                </div>
              ))
            : members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user_id.avatar || undefined} />
                      <AvatarFallback className="bg-card text-muted-foreground">
                        {member.user_id.user_name?.[0]?.toUpperCase() ||
                          member.user_id.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate text-muted-foreground">
                          {member.user_id.user_name || member.user_id.email}
                        </p>
                        <div className="flex gap-1">
                          {member.is_owner && (
                            <Badge className="bg-primary-gradient text-card">
                              {StringConstants.OWNER}
                            </Badge>
                          )}
                          {member.is_moderator && (
                            <Badge className="bg-green-500 text-muted-foreground">
                              {StringConstants.MODERATOR}
                            </Badge>
                          )}
                          {member.is_banned && (
                            <Badge className="bg-red-500 text-muted-foreground">
                              {StringConstants.BANNED}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-start text-muted-foreground">
                        {StringConstants.JOINED} {formatDistanceToNow(new Date(member.createdAt))}{" "}
                        {StringConstants.AGO}
                      </p>
                    </div>
                  </div>
                  {!member.is_owner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button
                          aria-label="Options"
                          className="text-muted-foreground"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border-zinc-700 hover:bg-background cursor-pointer">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleRemoveClick(member.user_id._id)}
                        >
                          {StringConstants.REMOVE_USER}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
        </div>
      </CardContent>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <h2 className="text-lg font-semibold">{StringConstants.CONFIRM_REMOVAL}</h2>
          </DialogHeader>
          <p>{StringConstants.REMOVAL_CONFIRMATION}</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              {StringConstants.CANCEL}
            </Button>
            <Button variant="destructive" onClick={confirmRemoveUser}>
              {StringConstants.REMOVE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
