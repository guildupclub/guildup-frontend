import React from "react";
import { LeftSidebar } from "../layout/sidebars/LeftSideBar";
import { RightSidebar } from "../layout/sidebars/RightSideBar";
import { Feed } from "./Feed";

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow flex">
        {/* Left sidebar - fixed width with proper spacing */}
        <div className="hidden lg:block w-80 flex-shrink-0 border-gray-200">
          <LeftSidebar />
        </div>
        
        {/* Feed - takes remaining space with proper margins */}
        <div className="flex-1 min-w-0 px-2 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Feed />
          </div>
        </div>  
        
        {/* Right sidebar - fixed width with proper spacing */}
        <div className="hidden xl:block w-80 flex-shrink-0 border-gray-200">
          <RightSidebar />
        </div>   
      </div>
    </div>
  );
}