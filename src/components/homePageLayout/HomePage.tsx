import React from "react";
import { LeftSidebar } from "../layout/sidebars/LeftSideBar";
import { RightSidebar } from "../layout/sidebars/RightSideBar";
import { Feed } from "./Feed";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-gradient-to-b from-gray-50/90 via-white/95 to-gray-50/90 relative">
      <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.02] pointer-events-none" />
      
      <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      
      <div className="absolute inset-0 grid-overlay opacity-[0.015] pointer-events-none" />
      
      <div className="flex-grow flex container mx-auto relative">
        <div className="hidden md:block w-64 flex-shrink-0 sticky top-10 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
          <div className="pr-4">
            <div className="backdrop-blur-sm rounded-2xl drop-shadow-md bg-white/[0.02] border border-white/10
              shadow-[inset_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]
              transition-all duration-500">
              <LeftSidebar />
            </div>
          </div>
        </div>
        
        <div className="flex-auto px-4 md:px-2 top=10">
          <div className="max-w-3xl drop-shadow-md">
            <div className="backdrop-blur-sm rounded-2xl bg-white/[0.02] border border-white/10
              shadow-[inset_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]
              transition-all duration-500">
              <Feed />
            </div>
          </div>
        </div>
        
        <div className="flex-auto hidden md:block w-64 sticky top-10 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-none">
          <div className="pl-2 drop-shadow-md">
            <div className="backdrop-blur-sm rounded-2xl bg-white/[0.02] border border-white/10
              shadow-[inset_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]
              transition-all duration-500">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}