"use client";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import Link from "next/link";

// Type for community data
interface Community {
  _id: string;
  title: string;
  name: string;
  description: string;
  subscription: boolean;
  subscription_price: number;
  num_member: number;
}

export function LeftmostSidebar() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const activeCommunityId = useSelector(
    (state: RootState) => state.channel.activeCommunityId
  );

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "678ce60732c37c1222f913e0",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch communities");
      }

      const result = await response.json();
      const validCommunities = result.data.filter(
        (community: Community | null) => community !== null
      );
      setCommunities(validCommunities);

      // Set the first community as active if none is selected
      if (validCommunities.length > 0 && !activeCommunityId) {
        dispatch(setActiveCommunity(validCommunities[0]._id));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch communities"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      // API call to create a new community can be placed here
      setNewChannelName("");
    }
  };

  // Function to get initials from community name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error) {
    return (
      <div className="fixed left-0 h-screen w-20 bg-zinc-900 flex items-center justify-center text-red-500">
        Error loading communities
      </div>
    );
  }

  return (
    <div className="fixed left-0 h-screen w-20 bg-zinc-900 flex flex-col items-center border-r border-zinc-800 py-20">
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center space-y-4 px-2 py-5">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : (
            communities.map((community) => (
              <Button
                key={community._id}
                variant="ghost"
                size="icon"
                className={`relative w-12 h-12 rounded-full text-zinc-500 ${
                  activeCommunityId === community._id
                    ? "bg-purple-500/20 ring-2 ring-purple-500"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() => {
                  dispatch(setActiveCommunity(community._id));
                }}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={`/placeholder.svg?text=${getInitials(community.name)}`}
                    alt={community.name}
                  />
                  <AvatarFallback>{getInitials(community.name)}</AvatarFallback>
                </Avatar>
                {community.subscription && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    ⭐
                  </span>
                )}
              </Button>
            ))
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-zinc-500 hover:bg-zinc-700 text-zinc-300"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-zinc-500 hover:bg-zinc-700 text-zinc-300"
              >
                <FaCompass />
              </Button>
            </Link>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-200">
              <DialogHeader>
                <DialogTitle>Join New Channel</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Enter the channel name you want to join.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="col-span-4 bg-zinc-800 border-zinc-700 text-zinc-200"
                    placeholder="Channel name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateChannel}>Join Channel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollArea>
    </div>
  );
}
