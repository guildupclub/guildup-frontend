"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { sidebarData } from "./Data";

type SelectedItem = {
  section: string;
  id: number | string;
};

export function LeftSidebar() {
  const [openSections, setOpenSections] = React.useState({
    customFeed: true,
    followedTopics: true,
    recentFeed: true,
    communities: true,
  });

  // Initialize with null selected item
  const [selectedItem, setSelectedItem] = React.useState<SelectedItem | null>(
    null
  );

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Updated handler for item selection
  const handleItemClick = (section: string, id: number | string) => {
    setSelectedItem({ section, id });
  };

  // Helper function to check if an item is selected
  const isItemSelected = (section: string, id: number | string) => {
    return selectedItem?.section === section && selectedItem?.id === id;
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-black pt-20 pb-3 px-4 space-y-3">
      <div className="bg-zinc-900 rounded-xl p-3 space-y-1">
        <div>
          <button
            onClick={() => handleItemClick("home", "feed")}
            className={`w-full flex items-center text-sm font-medium border-b border-zinc-800 py-2 ${
              isItemSelected("home", "feed")
                ? "text-purple-500"
                : "text-zinc-200 hover:text-white"
            }`}
          >
            Home Feed
          </button>
        </div>

        <Collapsible
          open={openSections.customFeed}
          onOpenChange={() => toggleSection("customFeed")}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-zinc-200">
            Custom Feed
            {openSections.customFeed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {sidebarData.customFeed.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick("customFeed", item.id)}
                className={`w-full flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-zinc-800 ${
                  isItemSelected("customFeed", item.id)
                    ? "bg-[#334BFF]/20 text-purple-500"
                    : item.isSpecial
                    ? "text-purple-500"
                    : "text-zinc-300"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <span>{item.name}</span>
                {item.isPinned && (
                  <Pin className="h-4 w-4 ml-auto text-zinc-500" />
                )}
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.followedTopics}
          onOpenChange={() => toggleSection("followedTopics")}
          className="space-y-2 border-t border-zinc-800 py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-zinc-200">
            My Followed Topics
            {openSections.followedTopics ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {sidebarData.followedTopics.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick("followedTopics", item.id)}
                className={`w-full flex items-center gap-2 rounded-lg p-2 text-sm ${
                  isItemSelected("followedTopics", item.id) || item.isActive
                    ? "bg-[#334BFF]/20 text-purple-500"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <span>{item.name}</span>
                {item.isPinned && (
                  <Pin className="h-4 w-4 ml-auto text-zinc-500" />
                )}
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 space-y-2">
        <Collapsible
          open={openSections.recentFeed}
          onOpenChange={() => toggleSection("recentFeed")}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-zinc-200">
            Recent Feed
            {openSections.recentFeed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {sidebarData.recentFeed.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick("recentFeed", item.id)}
                className={`w-full flex items-center gap-2 rounded-lg p-2 text-sm ${
                  isItemSelected("recentFeed", item.id)
                    ? "bg-[#334BFF]/20 text-purple-500"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <span>{item.name}</span>
                {item.isPinned ? (
                  <Pin className="h-4 w-4 ml-auto text-zinc-500" />
                ) : (
                  item.isNew && (
                    <span className="ml-auto text-xs text-purple-500">New</span>
                  )
                )}
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.communities}
          onOpenChange={() => toggleSection("communities")}
          className="space-y-2 border-t border-zinc-800 py-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-zinc-200">
            My Communities
            {openSections.communities ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            {sidebarData.communities.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick("communities", item.id)}
                className={`w-full flex items-center gap-2 rounded-lg p-2 text-sm ${
                  isItemSelected("communities", item.id)
                    ? "bg-[#334BFF]/20 text-purple-500"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.name[0]}</AvatarFallback>
                </Avatar>
                <span>{item.name}</span>
                {item.isPinned ? (
                  <Pin className="h-4 w-4 ml-auto text-zinc-500" />
                ) : (
                  item.isNew && (
                    <span className="ml-auto text-xs text-purple-500">New</span>
                  )
                )}
              </button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
