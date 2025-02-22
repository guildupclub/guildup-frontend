// "use client";

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { setActiveCommunity, setActiveChannel } from "@/redux/channelSlice";
// import type { RootState } from "@/redux/store";
// import { Hash, Plus, Rss, Lock } from "lucide-react";
// import { FaCompass } from "react-icons/fa";
// import { cn } from "@/lib/utils";

// interface Community {
//   _id: string;
//   name: string;
//   subscription?: boolean;
// }

// interface Channel {
//   id: string;
//   name: string;
//   is_locked?: boolean;
//   type: string;
// }

// export function MobileSidebar({ onNavigate }: { onNavigate?: () => void }) {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const userId = useSelector((state: RootState) => state.user.user?._id);
//   const sessionId = useSelector((state: RootState) => state.user.sessionId);
//   const activeCommunity = useSelector(
//     (state: RootState) => state.channel.activeCommunity
//   );
//   const activeChannel = useSelector(
//     (state: RootState) => state.channel.activeChannel
//   );

//   const [communities, setCommunities] = useState<Community[]>([]);
//   const [channels, setChannels] = useState<Channel[]>([]);

//   useEffect(() => {
//     fetchCommunities();
//   }, []);

//   useEffect(() => {
//     if (activeCommunity?.id) {
//       fetchChannels();
//     }
//   }, [activeCommunity?.id]);

//   const fetchCommunities = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userId }),
//         }
//       );
//       const result = await response.json();
//       setCommunities(result.data.filter((c: Community | null) => c !== null));
//     } catch (error) {
//       console.error("Failed to fetch communities:", error);
//     }
//   };

//   const fetchChannels = async () => {
//     if (!activeCommunity?.id) return;
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/channel/getChannels`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             userId,
//             session: sessionId,
//             communityId: activeCommunity.id,
//           }),
//         }
//       );
//       const data = await response.json();
//       if (data.r === "s" && data.data) {
//         setChannels(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch channels:", error);
//     }
//   };

//   const handleNavigation = (route: string) => {
//     router.push(route);
//     onNavigate?.();
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   return (
//     <ScrollArea className="h-full">
//       {/* Communities Row */}
//       <div className="flex gap-2 p-4 overflow-x-auto scrollbar-none">
//         {communities.map((community) => (
//           <Button
//             key={community._id}
//             variant="ghost"
//             size="icon"
//             className={cn(
//               "relative shrink-0 w-12 h-12 rounded-full",
//               activeCommunity?.id === community._id
//                 ? "bg-blue-500/20 ring-2 ring-purple-500"
//                 : "hover:bg-zinc-100"
//             )}
//             onClick={() => {
//               dispatch(
//                 setActiveCommunity({
//                   id: community._id,
//                   name: community.name,
//                 })
//               );
//             }}
//           >
//             <Avatar className="w-full h-full">
//               <AvatarImage
//                 src={`/placeholder.svg?text=${getInitials(community.name)}`}
//                 alt={community.name}
//               />
//               <AvatarFallback>{getInitials(community.name)}</AvatarFallback>
//             </Avatar>
//             {community.subscription && (
//               <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
//                 ⭐
//               </span>
//             )}
//           </Button>
//         ))}
//         <Button
//           variant="ghost"
//           size="icon"
//           className="shrink-0 w-12 h-12 rounded-full bg-zinc-100 hover:bg-zinc-200"
//         >
//           <Plus className="h-6 w-6 text-zinc-600" />
//         </Button>
//       </div>

//       {/* Navigation Menu */}
//       <div className="px-2 space-y-1">
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-3 h-12"
//           onClick={() => handleNavigation("/community/create")}
//         >
//           <div className="bg-zinc-100 p-2 rounded">
//             <Plus className="h-4 w-4" />
//           </div>
//           Create
//         </Button>
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-3 h-12"
//           onClick={() => handleNavigation("/community/feed")}
//         >
//           <div className="bg-zinc-100 p-2 rounded">
//             <Rss className="h-4 w-4" />
//           </div>
//           Feed
//         </Button>
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-3 h-12"
//           onClick={() => handleNavigation("/explore")}
//         >
//           <div className="bg-zinc-100 p-2 rounded">
//             <FaCompass className="h-4 w-4" />
//           </div>
//           Explore
//         </Button>
//       </div>

//       {/* Channels Section */}
//       <div className="mt-4 px-2">
//         <div className="flex items-center justify-between px-4 py-2">
//           <h3 className="text-sm font-semibold">Channels</h3>
//         </div>
//         <div className="space-y-[2px]">
//           {channels.map((channel) => (
//             <Button
//               key={channel.id}
//               variant="ghost"
//               className={cn(
//                 "w-full justify-start gap-2 rounded-none px-4",
//                 activeChannel?.id === channel.id &&
//                   "bg-[#334BFF]/10 text-purple-500"
//               )}
//               onClick={() => {
//                 dispatch(
//                   setActiveChannel({
//                     id: channel.id,
//                     name: channel.name,
//                     type: channel.type,
//                   })
//                 );
//                 handleNavigation(`/community/channel/${channel.name}`);
//               }}
//             >
//               <Hash className="h-4 w-4" />
//               {channel.name}
//               {channel.is_locked && (
//                 <Lock className="h-3 w-3 ml-auto opacity-50" />
//               )}
//             </Button>
//           ))}
//         </div>
//       </div>
//     </ScrollArea>
//   );
// }

import React from "react";
import { LeftmostSidebar } from "./LeftmostSidebar";
import { Sidebar } from "./SideBar";

export default function MobileSidebar() {
  return (
    <div className="flex flex-col  w-[60%] ">
      <div className="">
        <LeftmostSidebar />
      </div>
      <div className="pl-20">
        <Sidebar />
      </div>
    </div>
  );
}
