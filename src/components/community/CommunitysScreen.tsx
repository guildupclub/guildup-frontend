import React from 'react';
import Feed from './tabs/Feed';
import Members from './tabs/Members';
import Events from './tabs/Events';
import Announcements from './tabs/Announcements';

interface CommunityScreenProps {
  activeTab: string;
  community?: any;
}

const COMPONENTS = {
  feed: Feed,
  members: Members,
  events: Events,
  announcements: Announcements,
}

export default function CommunityScreen({ activeTab, community }: CommunityScreenProps) {
  const Component = COMPONENTS[activeTab] || Feed;


  

  return (
    <div className="flex-1 h-screen overflow-y-auto">
      <Component community={community} />
    </div>
  );
}