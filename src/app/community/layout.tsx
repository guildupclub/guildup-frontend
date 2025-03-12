import { Sidebar } from "@/components/community/SideBar";
import { LeftmostSidebar } from "@/components/community/LeftmostSidebar";
import type { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-background text-muted md:pe-[100px]">
      <LeftmostSidebar />
      <div className="flex flex-col md:ml-20">
        <Sidebar />
        <div className="flex md:ml-80">{children}</div>
      </div>
    </div>
  );
}
