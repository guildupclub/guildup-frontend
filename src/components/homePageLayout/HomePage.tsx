import React from "react";
import { LeftSidebar } from "../layout/sidebars/LeftSideBar";
import { RightSidebar } from "../layout/sidebars/RightSideBar";
import { Feed } from "./Feed";

export default function HomePage() {
  return (
    <div className="flex">
      {/* Left sidebar hidden on small screens */}
      <div className="hidden md:block">
        <LeftSidebar />
      </div>
      
      {/* Feed takes available space */}
      <div className="flex-1">
        <Feed />
      </div>
      
      {/* Right sidebar hidden on small screens */}
      <div className="hidden md:block">
        <RightSidebar />
      </div>
    </div>
  );
}
