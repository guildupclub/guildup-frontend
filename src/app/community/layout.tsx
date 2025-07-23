"use client";
import { LeftmostSidebar } from "@/components/community/LeftmostSidebar";
import type { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-background text-muted md:pe-[100px] pb-16 overflow-scroll ">
      {/* <LeftmostSidebar /> */}
      <div className="flex flex-col md:ml-20 ">
        <div className="flex w-full">{children}</div>
      </div>
    </div>
  );
}
