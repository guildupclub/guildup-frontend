"use client";
import { Sidebar } from "@/components/community/SideBar";
import { LeftmostSidebar } from "@/components/community/LeftmostSidebar";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname?.includes("/profile");

  return (
    <div className="min-h-screen bg-background text-muted md:pe-[100px] pb-16 overflow-auto">
      {!isProfilePage && <LeftmostSidebar />}
      <div className={`flex flex-col ${!isProfilePage ? "md:ml-20" : ""}`}>
        {!isProfilePage && <Sidebar />}
        <div className={`flex ${isProfilePage ? "w-full" : "md:ml-80 lg:w-[79%]"}`}>{children}</div>
      </div>
    </div>
  );
}
