// components/community/SideBarCommunity.tsx
'use client'
import React from 'react';

interface Community {
  _id: string;
  name: string;
}

interface SideBarCommunityProps {
  communities: Community[];
  onSelectCommunity: (communityId: string) => void;
}

const SideBarCommunity: React.FC<SideBarCommunityProps> = ({ communities, onSelectCommunity }) => {
  return (
    <div className="sidebar bg-gray-800 flex flex-row ">
      <div className="flex flex-col  p-2 border-r-[1px]  border-gray-500 h-[90vh] overflow-scroll">
        {communities.map((community) => (
          <button
            key={community?._id}
            className="text-xl p-2 bg-orange-600 text-center w-10 h-10 hover:bg-gray-700 mb-2 rounded-xl"
            onClick={() => onSelectCommunity(community?._id)}
          >
            {community?.name[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideBarCommunity;