import React from 'react';
import { StringConstants } from '@/components/common/CommonText';

interface Channel {
  id: string;
  name: string;
  locked: boolean;
  type: string;
}

interface MobileSidebarProps {
  navigationPaths: {
    COMMUNITY_PROFILE: string;
    COMMUNITY_MEMBERS: string;
    COMMUNITY_FEED: string;
    COMMUNITY_CHANNEL: string;
  };
  channels: Channel[];
  isPathActive: (path: string) => boolean;
  handleNavigation: (route: string) => void;
  handleChannelNavigation: (channel: Channel) => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  navigationPaths,
  channels,
  isPathActive,
  handleNavigation,
  handleChannelNavigation,
}) => {
  return (
    <div className="flex md:hidden overflow-x-auto hide-scrollbar border-b p-2 mt-16 gap-2">
      <button
        className={`bg-card py-1 px-2.5 rounded-lg text-md cursor-pointer font-semibold flex-shrink-0 ${
          isPathActive(navigationPaths.COMMUNITY_PROFILE)
            ? "text-gradient underline underline-offset-4 decoration-blue-500"
            : "hover:text-gradient"
        }`}
        onClick={() => handleNavigation(navigationPaths.COMMUNITY_PROFILE)}
      >
        {StringConstants.PROFILE}
      </button>

      <button
        className={`bg-card py-1 px-2.5 rounded-lg text-md cursor-pointer font-semibold flex-shrink-0 ${
          isPathActive(navigationPaths.COMMUNITY_FEED)
            ? "text-gradient underline underline-offset-4 decoration-blue-500"
            : "hover:text-gradient"
        }`}
        onClick={() => handleNavigation(navigationPaths.COMMUNITY_FEED)}
      >
        {StringConstants.FEED}
      </button>

      <button
        className={`bg-card py-1 px-2.5 rounded-lg text-md cursor-pointer font-semibold flex-shrink-0 ${
          isPathActive(navigationPaths.COMMUNITY_MEMBERS)
            ? "text-gradient underline underline-offset-4 decoration-blue-500"
            : "hover:text-gradient"
        }`}
        onClick={() => handleNavigation(navigationPaths.COMMUNITY_MEMBERS)}
      >
        {StringConstants.MEMBER}
      </button>

      {/* Scrollable Channels */}
      {channels.map((channel) => (
        <button
          key={channel.id}
          className={`bg-card py-1 px-2.5 rounded-lg text-md cursor-pointer font-semibold flex-shrink-0 ${
            isPathActive(`${navigationPaths.COMMUNITY_CHANNEL}/${channel.name}`)
              ? "text-gradient underline underline-offset-4 decoration-blue-500"
              : "hover:text-gradient"
          }`}
          onClick={() => handleChannelNavigation(channel)}
        >
          {channel.name}
        </button>
      ))}
    </div>
  );
}; 