"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "../../components/community/SideBar";
import { LeftmostSidebar } from "../../components/community/LeftmostSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import MobileSidebar from "../../components/community/MonbileSideBar";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen bg-background ">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 mr-4 bg-white ">
            <MobileSidebar onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-muted">
      <LeftmostSidebar />
      <div className="ml-20">
        <Sidebar />
        <div className="ml-80 flex-1">{children}</div>
      </div>
    </div>
  );
}
