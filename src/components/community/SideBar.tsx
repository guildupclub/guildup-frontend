"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Hash, Plus, Rss, Crown, Lock, Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { setActiveChannel } from "@/redux/channelSlice";
import { usePathname, useRouter } from "next/navigation";
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
import { setMemberDetails } from "@/redux/memberSlice";

export function Sidebar() {
  const dispatch = useDispatch();
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const isAdmin = memberDetails?.is_owner || memberDetails?.is_moderator;
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const activeCommunity = useSelector(
    (state: RootState) => state.channel.activeCommunity
  );

  const activeCommunityId = activeCommunity?.id;
  console.log("@activeCommunityId", activeCommunityId);
  const activeCommunityName = activeCommunity?.name;
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
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

  const getMemberDetails = async () => {
    console.log("@log", userId, activeCommunityId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/getMemberDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            communityId: activeCommunityId,
          }),
        }
      );

      const data = await response.json();
      console.log("@data", data);
      if (data.r === "s" && data.data) {
        dispatch(setMemberDetails(data.data));
      } else {
        console.log("@data", data);
      }
    } catch (err: any) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (activeCommunityId) {
      console.log("@here in useEffect");
      getMemberDetails();
    }
  }, [activeCommunityId]);

  const fetchChannels = async () => {
    if (!activeCommunityId) {
      console.warn("Community ID is null, skipping fetchChannels");
      setChannels([]);
      return;
    }

    const body = {
      userId: userId,
      session: sessionId,
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
      if (data.r !== "s" || !data.data || data.data.length === 0) {
        console.warn("No channels found for the selected community");
        setChannels([]);
        return;
      }

      const formattedChannels = data.data.map((channel: any) => ({
        id: channel._id,
        name: channel.name,
        icon: channel.type === "chat" ? Lock : Hash,
        locked: channel.is_locked,
        type: channel.type,
      }));

      setChannels(formattedChannels);
    } catch (err: any) {
      setError("Error fetching channels: " + err.message);
      setChannels([]);
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
            userId: userId,
            session: sessionId,
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
    <div className="fixed h-screen w-80 bg-card p-4 py-24">
      <div>
        <h2 className="px-2 text-lg text-muted">{activeCommunityName}</h2>
      </div>
      <div className="space-y-2">
        <div className="border-b border-background p-2">
          <div className="w-full justify-start gap-2 p-1 rounded-lg bg-background hover:bg-zinc-400 text-muted ">
            <PostDialog />
          </div>
        </div>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${
            pathname === "/community/profile"
              ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
              : "hover:bg-background text-muted-foreground"
          }`}
          onClick={() => handleNavigation("/community/profile")}
        >
          <FaUserAlt />
          Profile
        </Button>

        {/* Feed */}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${
            pathname === `/community/${activeCommunityId}/feed`
              ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
              : "hover:bg-background text-muted-foreground"
          }`}
          onClick={() =>
            handleNavigation(`/community/${activeCommunityId}/feed`)
          }
        >
          <Rss className="h-4 w-4" />
          Feed
        </Button>

        {/* Members */}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${
            pathname === "/community/members"
              ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
              : "hover:bg-background text-muted-foreground"
          }`}
          onClick={() => handleNavigation("/community/members")}
        >
          <FaUserGroup />
          Members
        </Button>

        {/* Announcements */}
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${
            pathname === "/community/announcements"
              ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
              : "hover:bg-background text-muted-foreground"
          }`}
          onClick={() => handleNavigation("/community/announcements")}
        >
          <GrAnnounce />
          Announcements
        </Button>
        {/* <Button
          variant="ghost"
          className="w-full justify-start gap-2  text-muted-foreground hover:bg-background  "
          onClick={() => handleNavigation("/community/event")}
        >
          <FaCalendarAlt />
          Events
        </Button> */}
        {/* <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:bg-background  "
          onClick={() => handleNavigation("/community/announcements")}
        >
          <GrAnnounce />
          Announcements
        </Button> */}

        {/* {isAdmin && ( */}
        <Button
          className={`w-full text-white ${
            isAdmin ? "" : "bg-blue-300 cursor-not-allowed hover:bg-blue-300"
          }`}
        >
          Creator Studio
        </Button>

        {/* )} */}

        <div className="px-2 py-2 border-t border-background p-2">
          <div className="flex items-center justify-between mb-2 ">
            <h2 className="text-lg font-semibold text-muted ">Channels</h2>
            <Dialog open={isChannelOpen} onOpenChange={setIsChannelOpen}>
              {/* {
                isAdmin && ( */}

              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 hover:bg-background ${
                    isAdmin ? "" : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!isAdmin}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-background  border-none">
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
                      className="bg-card border-background "
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
                      <SelectTrigger className="bg-card border-background text-muted">
                        <SelectValue placeholder="Select your topics" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-background text-muted">
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      Want to lock your channel?
                      <div className="relative group">
                        <Info className="w-4 h-4 text-muted cursor-pointer" />
                        <span className="absolute left-6 w-40 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform origin-left bg-zinc-800 text-zinc-200 text-xs rounded-md px-2 py-1 shadow-lg">
                          Do you want to make this channel private?
                        </span>
                      </div>
                    </Label>
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
                    className="bg-transparent border-background hover:bg-background text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChannel}
                    disabled={isCreating}
                    className="bg-primary-gradient text-white"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {channels &&
              channels.map((channel: any) => (
                <Button
                  key={channel?.id}
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    activeChannel.id === channel.id
                      ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30 "
                      : " hover:bg-background text-muted-foreground"
                  }`}
                  onClick={() => {
                    dispatch(
                      setActiveChannel({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                      })
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
