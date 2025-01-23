'use client'
import React, { useEffect, useState } from 'react';
import CommunityScreen from '@/components/community/CommunitysScreen';
import SideBarCommunity from '@/components/community/SideBarCommunity';
import axios from 'axios';
import CommunitySideBar from '@/components/community/CommunitySideBar';

function Page() {
  const [communities, setCommunities] = useState<any>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string|null>(null);

  useEffect(() => {
    // Fetch community data from the API
    const fetchCommunities = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,{
            userId:"6704eaa88019d1fa807773ea"
        }) // Replace with your API endpoint
        const data = response.data
        console.log("@communityData",data)
        setCommunities(data.data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      }
    };

    fetchCommunities();
  }, []);
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="bg-black min-h-screen text-white pt-16  flex flex-row">
        <div className=" bg-gray-800 flex flex-row mt-6  border-none rounded-r-lg">
      <SideBarCommunity 
        communities={communities} 
        onSelectCommunity={setSelectedCommunity} 
        />
      <CommunitySideBar 
      communityId={selectedCommunity}
          onTabChange={setActiveTab}
          activeTab={activeTab}/>
        </div>
      <CommunityScreen communityId={selectedCommunity} activeTab={activeTab}  />
    </div>
  );
}

export default Page;