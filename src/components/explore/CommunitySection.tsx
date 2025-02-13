// "use client";
// import axios from "axios";
// import Image from "next/image";
// import React, { useCallback, useEffect, useState } from "react";
// import { Card } from "../ui/card";
// import { Button } from "../ui/button";

// interface CommunitySectionProps {
//   activeCategory: any; // Replace 'any' with the appropriate type if known
// }

// function CommunitySection({ activeCategory }: CommunitySectionProps) {
//   console.log("@this is community section", activeCategory);
//   const [communitys, setCommunitys] = useState([]);
//   const [openCommunityModal, setOpenCommuniyModal] = useState(false);
//   const [clickedCommunity, setClickedCommunity] = useState("");
//   useEffect(() => {
//     const fetchTopCommunity = async () => {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/search`,
//         {
//           categoryId: activeCategory,
//         }
//       );
//       console.log("@responseCategoryDAta", response);
//       setCommunitys(response.data.data);
//     };
//     if (activeCategory != "") {
//       fetchTopCommunity();
//     }
//   }, [activeCategory]);

//   const handleClickCommunity = useCallback((communityId: string) => {
//     setOpenCommuniyModal(true);
//     const selectedCommunity = communitys.find(
//       (comm: any) => comm._id === communityId
//     );
//     // setClickedCommunity(selectedCommunity);
//     console.log("@selectedCommunity", selectedCommunity);
//   }, [communitys]);

//   return (
//     <div className="bg-black min-h-screen text-white   columns-1 sm:columns-2 md:columns-2 lg:columns-3 gap-4">
//       {communitys.length > 0 ? (
//         communitys?.map((community: any) => {
//           return (
//             <Card
//               key={community._id}
//               onClick={()=>handleClickCommunity(community._id)}
//               className="mb-4 break-inside-avoid border-none rounded-lg bg-[#19191A] w-[292px] overflow-hidden shadow-md"
//             >
//               <div className="p-3  pb-0 flex justify-center align-center">
//                 <div className="relative aspect-video h-[100px] w-[100%] rounded-lg overflow-hidden ">
//                   <Image
//                     src={community.image || "/defaultCommunityIcon.png"}
//                     alt={community.name}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//               </div>
//               <div className="p-4">
//                 <div className="flex items-center space-x-2 mb-2">
//                   <Image
//                     src={community.icon || "/defaultCommunityIcon.png"}
//                     alt={community.name}
//                     width={24}
//                     height={24}
//                     className="rounded-full"
//                   />
//                   <h3 className="font-semibold text-white text-[18px]">
//                     {community.name}
//                   </h3>
//                 </div>
//                 <p className="text-sm text-gray-400 mb-4 lg:h-[10vh] md:h-[5vh] sm:h-[5vh] overflow-hidden text-ellipsis line-clamp-3">
//                   {community.description}
//                 </p>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-500">
//                     {community.num_member} members
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           );
//         })
//       ) : (
//         <div>No community found</div>
//       )}
//       {openCommunityModal && <div className="absolute">CommunityModal</div>}
//     </div>
//   );
// }

// export default React.memo(CommunitySection);

"use client";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Card } from "../ui/card";
import MemoizedCommunityCard from "./MemoizedCommunityCard";
import { useRouter } from "next/router";
import { Button } from "../ui/button";

interface CommunitySectionProps {
  activeCategory: string;
}

function CommunitySection({ activeCategory }: CommunitySectionProps) {
  const [communities, setCommunities] = useState([]);
  const [openCommunityModal, setOpenCommunityModal] = useState(false);
  const [clickedCommunity, setClickedCommunity] = useState<any>(null);

  useEffect(() => {
    const fetchTopCommunity = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/look`,
          { categoryId: activeCategory }
        );
        setCommunities(response.data.data);
      } catch (error) {
        console.error("Error fetching communities", error);
      }
    };
    if (activeCategory) {
      fetchTopCommunity();
    }
  }, [activeCategory]);

  const handleClickCommunity = useCallback(
    (communityId: string) => {
      const selectedCommunity = communities.find(
        (comm: any) => comm._id === communityId
      );
      setClickedCommunity(selectedCommunity || null);
      setOpenCommunityModal(true);
    },
    [communities]
  );

  return (
    <div className="bg-black min-h-screen text-white p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {communities.length > 0 ? (
          communities.map((community: any) => (
            <MemoizedCommunityCard
              key={community._id}
              community={community}
              onClick={handleClickCommunity}
            />
          ))
        ) : (
          <div>No community found</div>
        )}
      </div>

      {openCommunityModal && clickedCommunity && (
        <CommunityModal
          community={clickedCommunity}
          onClose={() => setOpenCommunityModal(false)}
        />
      )}
    </div>
  );
}

export default React.memo(CommunitySection);

const CommunityModal = ({
  community,
  onClose,
}: {
  community: any;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60  p-6 rounded-lg w-[400px] max-w-full">
        <h2 className="text-xl font-semibold mb-4 text-zinc-100">
          {community.name}
        </h2>
        <p className="text-zinc-200 mb-4">{community.description}</p>
        <div className="flex justify-between items-center">
          <Button
            onClick={onClose}
            className="px-4 py-2 "
            variant="destructive"
          >
            Close
          </Button>
          <Button
            onClick={() => alert("Join community functionality here")}
            className="px-4 py-2 "
          >
            Join Community
          </Button>
        </div>
      </div>
    </div>
  );
};
