"use client";

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
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample data for subscribed channels
const subscribedChannels = [
  {
    id: "1",
    name: "GuildUp",
    avatar: "/placeholder.svg",
    unreadCount: 3,
  },
  {
    id: "2",
    name: "Trading Hub",
    avatar: "/placeholder.svg",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Crypto Club",
    avatar: "/placeholder.svg",
    unreadCount: 5,
  },
];

export function LeftmostSidebar() {
  const [channels, setChannels] = useState(subscribedChannels);
  const [newChannelName, setNewChannelName] = useState("");
  const [activeChannel, setActiveChannel] = useState(channels[0]?.id);

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      const newChannel = {
        id: Date.now().toString(),
        name: newChannelName,
        avatar: "/placeholder.svg",
        unreadCount: 0,
      };
      setChannels([...channels, newChannel]);
      setNewChannelName("");
    }
  };

  return (
    <div className="fixed left-0 h-screen w-20 bg-zinc-900 flex flex-col items-center  border-r border-zinc-800 py-20">
      {" "}
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center space-y-4 px-2 py-5">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              size="icon"
              className={`relative w-12 h-12 rounded-full text-zinc-500 ${
                activeChannel === channel.id
                  ? "bg-purple-500/20 ring-2 ring-purple-500"
                  : "hover:bg-zinc-800"
              }`}
              onClick={() => setActiveChannel(channel.id)}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={channel.avatar} alt={channel.name} />
                <AvatarFallback>
                  {channel.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {channel.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {channel.unreadCount}
                </span>
              )}
            </Button>
          ))}
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
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 rounded-lg   hover:bg-zinc-700 text-zinc-300 mt-4"
      >
        <Settings className="w-8 h-8" />
      </Button>
    </div>
  );
}
