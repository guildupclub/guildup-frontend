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
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import Link from "next/link";
import CreatorForm from "../form/CreatorForm";

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
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatorForm, setShowCreatorForm] = React.useState(false);

  const handleOpenForm = () => {
    setShowCreatorForm((prev) => !prev);
  };

  const dispatch = useDispatch();
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );

  const activeCommunityId = activeCommunity?.id;

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
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch communities");
      }

      const result = await response.json();
      console.log(result);
      const validCommunities = result.data.filter(
        (community: Community | null) => community !== null
      );
      setCommunities(validCommunities);

      // Set the first community as active if none is selected
      if (validCommunities.length > 0 && !activeCommunityId) {
        dispatch(
          setActiveCommunity({
            id: validCommunities[0]._id,
            name: validCommunities[0].name, // Include name
          })
        );
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
      <div className="fixed left-0 h-screen w-20 bg-background flex items-center justify-center text-red-500">
        Error loading communities
      </div>
    );
  }

  return (
    <div className="fixed left-0 h-screen w-20 bg-card flex flex-col items-center border-r border-background py-20">
      <div className="flex-1 w-full overflow-auto scrollbar-none cursor-pointer">
        <div className="flex flex-col items-center space-y-4 px-2 py-5">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-12 h-12 rounded-full bg-background animate-pulse"
                />
              ))}
            </div>
          ) : (
            communities.map((community) => (
              <Button
                key={community._id}
                variant="ghost"
                size="icon"
                className={`relative w-12 h-12 rounded-full  ${
                  activeCommunityId === community._id
                    ? "bg-blue-500/20 ring-2 ring-purple-500"
                    : "hover:bg-zinc-800"
                }`}
                onClick={() =>
                  dispatch(
                    setActiveCommunity({
                      id: community._id,
                      name: community.name,
                    })
                  )
                }
              >
                <Avatar className="w-full h-full ">
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
            <CreatorForm />
            <Link href="/explore">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
              >
                <FaCompass />
              </Button>
            </Link>
            {showCreatorForm && <CreatorForm />}
          </Dialog>
        </div>
      </div>
    </div>
  );
}
