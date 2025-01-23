import React from "react";
import { LeftSidebar } from "../layout/sidebars/LeftSideBar";
import { RightSidebar } from "../layout/sidebars/RightSideBar";
import { Feed } from "./Feed";

export default function HomePage() {
  return (
    <div>
      <LeftSidebar />
      <Feed />
      <RightSidebar />
    </div>
  );
}
