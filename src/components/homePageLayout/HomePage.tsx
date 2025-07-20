import React from "react";
import { LeftSidebar } from "../layout/sidebars/LeftSideBar";
import { RightSidebar } from "../layout/sidebars/RightSideBar";
import { Feed } from "./Feed";

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-white"> {/* Add h-screen and flex-col */}
      <div className="flex-grow flex"> {/* Add flex-grow to the main content */}
        {/* Left sidebar hidden on small screens  */}
        <div className="hidden md:block ps-20">
          <LeftSidebar />
        </div>
        
        {/* Feed takes available space */}
        <div className="flex-1">
          <Feed />
        </div>  
        
        {/* Right sidebar hidden on small screens */}
        <div className="hidden md:block pe-20">
          <RightSidebar />
        </div>   
      </div>
    </div>
  );
}