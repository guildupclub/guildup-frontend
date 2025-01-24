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

const channels = [
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
  {
    id: "sip",
    name: "SIP & Mutual Fund Strategies",
    icon: Hash,
  },
];

export function Sidebar() {
  const dispatch = useDispatch();
  const activeChannel = useSelector(
    (state: RootState) => state.channel.activeChannel
  );
  const router = useRouter(); 
  const handleEventsClick = () => {
    router.push("/community/event"); 
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-72 bg-background/95  border-r p-4">
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800"
        >
          <Rss className="h-4 w-4" />
          Feed
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800"
        >
          <Users className="h-4 w-4" />
          Members
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800"
          onClick={handleEventsClick} 
        >
          <Calendar className="h-4 w-4" />
          Events
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-200 hover:bg-zinc-800"
        >
          <MessageSquare className="h-4 w-4" />
          Announcements
        </Button>

        <Separator className="my-4 bg-zinc-800" />

        <div className="px-2 py-2">
          <h2 className="mb-2 text-lg font-semibold text-zinc-200">Channels</h2>
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
                onClick={() =>
                  dispatch(
                    setActiveChannel({ id: channel.id, name: channel.name })
                  )
                }
              >
                <channel.icon className="h-4 w-4" />
                {channel.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
