// app/community/layout.tsx

import { Sidebar } from "@/components/community/SideBar"; // Ensure the correct import path
import { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-black text-zinc-200">
      <Sidebar />
      <div className="ml-72 flex-1">{children}</div> {/* This will render the page-specific content */}
    </div>
  );
}
