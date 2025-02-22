"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  content: string;
  author: {
    name: string;
    image?: string;
  };
  timestamp: string;
  date: string;
}

const messages: Message[] = [
  {
    id: "1",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "17 Jan, 10:00 am",
  },
  {
    id: "2",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "17 Jan, 10:00 am",
  },
  {
    id: "3",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "19 Jan, 11:00 pm",
  },
  {
    id: "4",
    content:
      "I agree with Neha. I've also been looking into gold and real estate as inflation hedges. Have any of you had experience investing in REITs?",
    author: {
      name: "RaviVerma",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "20 Jan, 10:00 am",
  },
  {
    id: "5",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "21 Jan, 10:00 am",
  },
  {
    id: "6",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "17 Jan, 10:00 am",
  },
  {
    id: "7",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "17 Jan, 10:00 am",
  },
  {
    id: "8",
    content:
      "Good question, Amit! I believe FMCG and pharma stocks are safer bets during inflationary periods. They have consistent demand even when prices rise.",
    author: {
      name: "NehaSharna",
      image: "/placeholder.svg?height=32&width=32",
    },
    timestamp: "11:55 pm",
    date: "19 Jan, 11:00 pm",
  },
];

export function AnnouncementsFeed() {
  return (
    <div className="flex flex-col h-full w-full border border-background rounded-lg bg-card mx-6 lg:mx-10">
      <div className="flex items-center justify-between p-4 border-b border-background">
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-muted-foreground"
          >
            <path
              d="M18 2v2H6V2h12zm-6 3a6 6 0 0 1 6 6v3.586l2.707 2.707a1 1 0 0 1-1.414 1.414L18 17.414V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2.586l-1.293 1.293a1 1 0 0 1-1.414-1.414L6 14.586V11a6 6 0 0 1 6-6zm0 2a4 4 0 0 0-4 4v4.414l-2 2V20h12v-1.586l-2-2V11a4 4 0 0 0-4-4z"
              fill="currentColor"
            />
          </svg>
          <h1 className="text-lg font-semibold text-muted-foreground">
            Announcements
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted hover:text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-none cursor-pointer">
        <div className="flex flex-col ">
          {messages.map((message, index) => (
            <div key={message.id} className="border-b border-background">
              {(index === 0 || messages[index - 1].date !== message.date) && (
                <div className="py-2 px-4 text-center">
                  <span className="text-xs text-muted">{message.date}</span>
                </div>
              )}
              <div className="flex gap-3 p-4 hover:bg-background">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.author.image} />
                  <AvatarFallback>{message.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {message.author.name}
                    </span>
                    <span className="text-xs text-muted">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-1">{message.content}</p>
                </div>
              </div>
              {index !== messages.length - 1 && (
                <Separator className="bg-card" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
