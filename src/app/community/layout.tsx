import { Sidebar } from "@/components/community/SideBar";
import { LeftmostSidebar } from "@/components/community/LeftmostSidebar";
import type { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-background text-muted">
      <LeftmostSidebar />
      <div className="ml-20">
        <Sidebar />
        <div className="md:ml-80 md:flex-1">{children}</div>
      </div>
    </div>
  );
}
