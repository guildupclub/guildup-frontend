import { Sidebar } from "@/components/community/SideBar";
import { LeftmostSidebar } from "@/components/community/LeftmostSidebar";
import type { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-black text-zinc-200">
      <LeftmostSidebar />
      <div className="ml-20">
        <Sidebar />
        <div className="ml-80 flex-1">{children}</div>
      </div>
    </div>
  );
}
