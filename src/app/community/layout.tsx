"use client";
import type { ReactNode } from "react";

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-muted overflow-x-hidden overflow-y-auto">
      <div className="w-full">{children}</div>
    </div>
  );
}
