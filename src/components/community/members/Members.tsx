"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { UserCircle } from "lucide-react";

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

export default function Members({ communityId }: { communityId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/members`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ communityId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }

        const data: MembersResponse = await response.json();
        setMembers(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load members");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [communityId]);

  if (error) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="pt-6">
          <p className="text-red-500 text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <UserCircle className="h-5 w-5 text-zinc-400" />
          Community Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-zinc-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px] bg-zinc-700" />
                    <Skeleton className="h-4 w-[150px] bg-zinc-700" />
                  </div>
                </div>
              ))
            : members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <Avatar>
                    <AvatarImage src={member.user_id.avatar || undefined} />
                    <AvatarFallback className="bg-zinc-700 text-zinc-100">
                      {member.user_id.user_name?.[0]?.toUpperCase() ||
                        member.user_id.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-white">
                        {member.user_id.user_name || member.user_id.email}
                      </p>
                      <div className="flex gap-1">
                        {member.is_owner && (
                          <Badge className="bg-primary-gradient text-white">
                            Owner
                          </Badge>
                        )}
                        {member.is_moderator && (
                          <Badge className="bg-green-500 text-white">
                            Moderator
                          </Badge>
                        )}
                        {member.is_banned && (
                          <Badge className="bg-red-500 text-white">
                            Banned
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Joined {formatDistanceToNow(new Date(member.createdAt))}{" "}
                      ago
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
