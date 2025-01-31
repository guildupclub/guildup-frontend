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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  const router = useRouter();
  const [channels, setChannels] = useState(initialChannels);
  const [newChannelName, setNewChannelName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      const newChannel = {
        id: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        name: newChannelName,
        icon: Hash,
      };
      setChannels([...channels, newChannel]);
      setNewChannelName("");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed h-screen w-72 bg-background/95  border-r-zinc-700 p-4 py-24 ">
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 bg-black hover:bg-zinc-800 hover:text-zinc-300 border-b border-zinc-700"
          onClick={() => handleNavigation("/create")}
        >
          <Plus className="h-4 w-4" />
          Create
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
          <Users className="h-4 w-4" />
          Members
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/event")}
        >
          <Calendar className="h-4 w-4" />
          Events
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-300"
          onClick={() => handleNavigation("/community/announcements")}
        >
          <MessageSquare className="h-4 w-4" />
          Announcements
        </Button>

        <Separator className="my-4 bg-zinc-800" />

        <div className="px-2 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-zinc-200">Channels</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  <DialogTitle>Create Channel</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Create a new channel for your community.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="col-span-3 bg-zinc-800 border-zinc-700 text-zinc-200"
                      placeholder="new-channel"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateChannel}
                    className="bg-[#334BFF] hover:bg-[#334BFF]/90 text-white"
                  >
                    Create Channel
                  </Button>
                </DialogFooter>
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
                }}
              >
                <channel.icon className="h-4 w-4" />
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
