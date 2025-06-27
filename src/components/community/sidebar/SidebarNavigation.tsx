import React from 'react';
import { Button } from '@/components/ui/button';
import { FaUser, FaUserAlt } from 'react-icons/fa';
import { Rss } from 'lucide-react';
import { StringConstants } from '@/components/common/CommonText';
import { PostDialog } from '@/components/community/Event/CreateEventDialouge';

interface SidebarNavigationProps {
  isAdmin: boolean;
  navigationPaths: {
    COMMUNITY_PROFILE: string;
    COMMUNITY_MEMBERS: string;
    COMMUNITY_FEED: string;
  };
  isPathActive: (path: string) => boolean;
  handleNavigation: (route: string) => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isAdmin,
  navigationPaths,
  isPathActive,
  handleNavigation,
}) => {
  return (
    <div className="space-y-2">
      <div className="border-b border-background py-2">
        {isAdmin && (
          <div className="w-full justify-start gap-2 p-1 rounded-lg bg-background hover:bg-zinc-400 text-muted">
            <PostDialog />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          isPathActive(navigationPaths.COMMUNITY_PROFILE)
            ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
            : "hover:bg-background text-muted-foreground"
        }`}
        onClick={() => handleNavigation(navigationPaths.COMMUNITY_PROFILE)}
      >
        <FaUserAlt />
        {StringConstants.PROFILE}
      </Button>

      <Button
        variant="ghost"
        className={`w-full justify-start gap-2 ${
          isPathActive(navigationPaths.COMMUNITY_FEED)
            ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
            : "hover:bg-background text-muted-foreground"
        }`}
        onClick={() => handleNavigation(navigationPaths.COMMUNITY_FEED)}
      >
        <Rss className="h-4 w-4" />
        {StringConstants.FEED}
      </Button>

      {isAdmin && (
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${
            isPathActive(navigationPaths.COMMUNITY_MEMBERS)
              ? "bg-[#334BFF]/20 text-primary hover:bg-[#334BFF]/30"
              : "hover:bg-background text-muted-foreground"
          }`}
          onClick={() => handleNavigation(navigationPaths.COMMUNITY_MEMBERS)}
        >
          <FaUser />
          {StringConstants.MEMBER}
        </Button>
      )}-

      {isAdmin && (
        <Button
          className="w-full text-white"
          onClick={() => handleNavigation("/creator-studio")}
        >
          {StringConstants.CREATOR_STUDIO}
        </Button>
      )}
    </div>
  );
}; 