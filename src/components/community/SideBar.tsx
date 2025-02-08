"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Users,
  Calendar,
  MessageSquare,
  Plus,
  Rss,
  Crown,
  Lock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveChannel } from "@/redux/channelSlice";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { PostDialog } from "../community/Event/CreateEventDialouge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GrAnnounce } from "react-icons/gr";
import { FaCalendarAlt, FaUserAlt } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
const initialChannels = [
  {
    id: "general",
    name: "General Chat",
    icon: Hash,
  },
  {
    id: "top50",
    name: "Top 50 Followers Insights",
    icon: Crown,
    locked: true,
  },
  {
    id: "exclusive",
    name: "Exclusive Investment Tips",
    icon: Lock,
    locked: true,
  },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const activeCommunityId = useSelector(
    (state: RootState) => state.channel.activeCommunityId
  );
  const router = useRouter();
  const [channels, setChannels] = useState(initialChannels);
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "discussion",
    is_locked: false,
  });

  useEffect(() => {
    if (activeCommunityId) {
      fetchChannels();
    }
  }, [activeCommunityId]);

  const fetchChannels = async () => {
    if (!activeCommunityId) {
      console.warn("Community ID is null, skipping fetchChannels");
      return;
    }

    const body = {
      userId: "678ce60732c37c1222f913e0",
      session: "wnywp8z6",
      communityId: activeCommunityId,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/getChannels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (data.r !== "s" || !data.data) {
        throw new Error("Failed to fetch channels");
      }

      const formattedChannels = data.data.map((channel: any) => ({
        id: channel._id,
        name: channel.name,
        icon: channel.type === "chat" ? Lock : Hash,
        locked: channel.is_locked,
      }));

      setChannels(formattedChannels);
    } catch (err: any) {
      setError("Error fetching channels: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCreateChannel = async () => {
    if (!formData.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "678ce60732c37c1222f913e0",
            session: "wnywp8z6",
            communityId: activeCommunityId,
            name: formData.name,
            type: formData.type,
            is_locked: formData.is_locked,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create channel");
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        type: "discussion",
        is_locked: false,
      });
      setIsChannelOpen(false);

      // Refresh channels list
      await fetchChannels();
    } catch (err: any) {
      setError("Error creating channel: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed h-screen w-80 bg-background/95 border-r-zinc-700 p-4 py-24">
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 bg-black hover:bg-zinc-800 hover:text-zinc-300"
        >
          <PostDialog />
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          // onClick={() => handleNavigation("/community/members")}
        >
          <FaUserAlt />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/feed")}
        >
          <Rss className="h-4 w-4" />
          Feed
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/members")}
        >
          <FaUserGroup />
          Members
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/event")}
        >
          <FaCalendarAlt />
          Events
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/announcements")}
        >
          <GrAnnounce />
          Announcements
        </Button>

        <Button className="w-full ">Creator Studio</Button>

        <Separator className="my-4 bg-zinc-800" />

        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-zinc-200">Channels</h2>
            <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-200">
                <DialogHeader>
                  <DialogTitle>Create a New Channel</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Channel Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-zinc-800 border-zinc-700 text-zinc-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Channel Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        <SelectValue placeholder="Select your topics" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Want to lock your channel?</Label>
                    <RadioGroup
                      value={formData.is_locked.toString()}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          is_locked: value === "true",
                        })
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="yes" />
                        <Label htmlFor="yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsChannelOpen(false)}
                    className="bg-transparent border-zinc-700  hover:bg-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChannel}
                    disabled={isCreating}
                    className="bg-primary-gradient "
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className={`w-full justify-start gap-2 ${
                  activeChannel.id === channel.id
                    ? "bg-[#334BFF]/20 text-purple-500 hover:bg-[#334BFF]/30 hover:text-zinc-300"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
                onClick={() => {
                  dispatch(
                    setActiveChannel({ id: channel.id, name: channel.name })
                  );
                  handleNavigation(`/community/channel/${channel.name}`);
                }}
              >
                <Hash />
                {channel.name}
                {channel.locked && (
                  <Lock className="h-3 w-3 ml-auto opacity-50" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
