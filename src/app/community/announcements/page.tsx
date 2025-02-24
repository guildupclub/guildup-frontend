import { Sidebar } from "@/components/community/SideBar";
import { AnnouncementsFeed } from "@/components/community/Event/AnnouncementFeed";

export default function AnnouncementsPage() {
  return (
    <div className="flex h-screen w-full pt-20 bg-background">
      <AnnouncementsFeed />
    </div>
  );
}
