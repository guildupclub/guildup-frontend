// "use client";
// import { setActiveCommunity } from "@/redux/channelSlice";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Plus, Settings } from "lucide-react";
// import React, { useState, useEffect } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import type { RootState } from "@/redux/store";
// import { useDispatch, useSelector } from "react-redux";
// import { FaCompass } from "react-icons/fa";
// import Link from "next/link";
// import CreatorForm from "../form/CreatorForm";
// import { setCommunityData } from "@/redux/communitySlice";
// import { setUserFollowedCommunities } from "@/redux/userSlice";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { StringConstants } from "../common/CommonText";
// import {
//   useLeaveCommunity,
//   useJoinCommunity,
// } from "@/hook/queries/useCommunityMutations";
// import { toast } from "sonner";
// import { useParams, useRouter } from "next/navigation";


// interface Community {
//   _id: string;
//   title: string;
//   name: string;
//   description: string;
//   subscription: boolean;
//   subscription_price: number;
//   image: string;
//   background_image: string;
// }

// export function LeftmostSidebar() {
//   const router = useRouter();
//   const userId = useSelector((state: RootState) => state.user.user?._id);
//   const sessionId = useSelector((state: RootState) => state.user.sessionId);
//   // const [communities, setCommunities] = useState<Community[]>([]);
//   const [newChannelName, setNewChannelName] = useState("");
//   // const [isLoading, setIsLoading] = useState(true);
//   // const [error, setError] = useState<string | null>(null);
//   const [showCreatorForm, setShowCreatorForm] = React.useState(false);
//   const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);

//   const handleOpenForm = () => {
//     setShowCreatorForm((prev) => !prev);
//   };

//   const params = useParams();
//   const dispatch = useDispatch();
 
//   const user = useSelector((state: RootState) => state.user.user);

//   const activeCommunityId = params.id;
//   useEffect(() => {
//     fetchCommunities();
//   }, []);

//   // const fetchCommunities = async () => {
//   //   try {
//   //     const response = await fetch(
//   //       `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         body: JSON.stringify({
//   //           userId: userId,
//   //         }),
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       throw new Error("Failed to fetch communities");
//   //     }

//   //     const result = await response.json();
//   //     console.log("comm", result);
//   //     const validCommunities = result.data.filter(
//   //       (community: Community | null) => community !== null
//   //     );
//   //     setCommunities(validCommunities);

//   //     dispatch(setUserFollowedCommunities(validCommunities));
//   //     // Set the first community as active if none is selected
//   //     if (validCommunities.length > 0 && !activeCommunityId) {
//   //       dispatch(
//   //         setActiveCommunity({
//   //           id: validCommunities[0]._id,
//   //           name: validCommunities[0].name, // Include name
//   //         })
//   //       );
//   //     }
//   //   } catch (err) {
//   //     setError(
//   //       err instanceof Error ? err.message : "Failed to fetch communities"
//   //     );
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };
    
//   const myCommunities = useSelector((state: RootState) => state?.user?.userFollowedCommunities|| []);
//   // Fetch communities function
//   const fetchCommunities = async () => {
//     // const response = await fetch(
//     //   `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
//     //   {
//     //     method: "POST",
//     //     headers: {
//     //       "Content-Type": "application/json",
//     //     },
//     //     body: JSON.stringify({ userId }),
//     //   }
//     // );


//     // if (!response.ok) {
//     //   throw new Error("Failed to fetch communities");
//     // }
//     // const result = await response.json();
//     // console.log("comm", result);
//     // const validCommunities = result?.data?.filter(
//     //   (community: Community | null) => community !== null
//     // );
//     // // setCommunitie(validCommunities);

//     // dispatch(setUserFollowedCommunities(validCommunities));

//     // if (validCommunities.length > 0 && !activeCommunityId) {
//     //   dispatch(
//     //     setActiveCommunity({
//     //       id: validCommunities[0]._id,
//     //       name: validCommunities[0].name,
//     //       image: validCommunities[0].image,
//     //       background_image: validCommunities[0].background_image,
//     //     })
//     //   );
//     // }
//     // const result = await response.json();
//     // return result.data.filter(
//     //   (community: Community | null) => community !== null
//     // );

//     console.log("leftmostsidebar> communities", myCommunities);
    
//     return myCommunities.filter(
//       (community: any) => community !== null
//     );
//   };

//   // Leave community mutation
//   const leaveCommunityMutation = useLeaveCommunity();

//   // Use React Query for fetching communities
//   const {
//     data: communities = [],
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["userCommunities", userId],
//     queryFn: fetchCommunities,
//     enabled: !!userId,
//     // Add this to ensure the component re-renders when the data changes
//     staleTime: 0,
//   });

//   // Add this near the top of your component function
//   const queryClient = useQueryClient();

//   // Join community mutation
//   const joinCommunityMutation = useJoinCommunity();

//   const handleJoinCommunity = async (communityId: string) => {
//     try {
//       await joinCommunityMutation.mutateAsync({
//         userId: userId!,
//         communityId,
//       });

//       toast.success("Successfully joined the community");

//       // The cache invalidation is handled in the mutation's onSuccess callback
//     } catch (error) {
//       toast.error("Failed to join community");
//       console.error("Error joining community:", error);
//     }
//   };

//   const handleCreateChannel = () => {
//     if (newChannelName.trim()) {
//       // API call to create a new community can be placed here
//       setNewChannelName("");
//     }
//   };

//   // Function to get initials from page name
//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((word) => word[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   // const handleLeaveCommunity = async (communityId: string) => {
//   //   try {
//   //     await leaveCommunityMutation.mutateAsync({
//   //       userId: userId!,
//   //       communityId,
//   //     });

//   //     toast.success("Successfully left the community");

//   //     // If the active community is the one being left, clear it
//   //     if (activeCommunityId === communityId) {
//   //       dispatch(setActiveCommunity(null));
//   //     }

//   //     // The cache invalidation is handled in the mutation's onSuccess callback
//   //   } catch (error) {
//   //     toast.error("Failed to leave community");
//   //     console.error("Error leaving community:", error);
//   //   }
//   // };

//   // const handleNavigation = (path: string) => {
//   //   router.push(path);
//   // };
//   const handleNavigation = (path: string,communityId:string) => {
//     const currentPath = window.location.pathname;
//     const pathSegments = currentPath.split('/');
//     const currentPage = pathSegments[3] || 'profile'; // Default to profile if no page specified
//     console.log("@currentPage", path,communityId,currentPage);

//     // If we're switching communities, maintain the same page
//     if (currentPage =='channel') {
//       // For channels, always navigate to profile
//       router.push(`/community/${communityId}/profile`);
//     }else if (path.includes('community')) {
//       // const communityId = path.split('/community/')[1];
//       console.log("@communityId", `/community/${communityId}/${currentPage}`,communityId);
//       router.push(`/community/${communityId}/${currentPage}`);
//     } 
//   };

//   if (error) {
//     return (
//       <div className="fixed left-0 h-screen w-20 bg-background flex items-center justify-center text-red-500">
//         {StringConstants.ERROR_LOADING_PAGES}
//       </div>
//     );
//   }

//   return (

//     <div className="hidden md:flex fixed left-0 h-screen w-20 bg-card flex-col items-center border-r border-background py-20 gap-3">
//       <div className="flex-1 w-full overflow-auto scrollbar-none cursor-pointer">
//         <div className="flex flex-col items-center space-y-4 px-2 py-5">
//           {isLoading ? (
//             // Loading skeleton
//             <div className="space-y-4">
//               {[1, 2, 3].map((n) => (
//                 <div
//                   key={n}
//                   className="w-12 h-12 rounded-lg bg-background animate-pulse"
//                 />
//               ))}
//             </div>
//           ) : (
//             communities.map((community: any) => (
//               <Button
//                 key={community._id}
//                 variant="ghost"
//                 size="icon"
//                 className={`relative rounded-lg  ${activeCommunityId === community._id
//                   ? "bg-blue-500/20 ring-2 ring-purple-500"
//                   : "hover:bg-zinc-800"
//                   }`}
//                 onClick={() => {
//                   dispatch(
//                     setActiveCommunity({
//                       id: community._id,
//                       name: community.name,
//                       image: community.image,
//                       background_image: community.background_image,
//                     })
//                   );
//                   dispatch(
//                     setCommunityData({
//                       communityId: community._id,
//                       userId: user._id,
//                     })
//                   );
//                   handleNavigation(
//                     `/community/${community._id}/profile`,community._id
//                   );
//                 }}
//               >
//                 <Avatar className="w-full h-full !rounded-lg">

//                   <AvatarImage
//                     src={
//                       community.image && community.image !== ""
//                         ? community.image
//                         : ""
//                     }
//                     alt={community.name}
//                     className="!rounded-lg"
//                   />
//                   <AvatarFallback className="!rounded-lg">{getInitials(community.name)}</AvatarFallback>
//                 </Avatar>
//                 {community.subscription && (
//                   <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
//                     ⭐
//                   </span>
//                 )}
//               </Button>
//             ))
//           )}

//           <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
//             <DialogTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
//               >
//                 <Plus className="h-6 w-6 text-muted" />
//               </Button>
//             </DialogTrigger>
//             <CreatorForm
//               onClose={() => setIsCreatorFormOpen(false)}
//               onSuccess={() => {
//                 // Invalidate the cache when a new community is created
//                 queryClient.invalidateQueries({
//                   queryKey: ["userCommunities"],
//                 });
//               }}
//             />
//           </Dialog>

//           <Link href="/explore">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
//             >
//               <FaCompass className="text-muted" />
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import Link from "next/link";
import CreatorForm from "../form/CreatorForm";
import { setCommunityData } from "@/redux/communitySlice";
import { setUserFollowedCommunities } from "@/redux/userSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StringConstants } from "../common/CommonText";
import {
  useLeaveCommunity,
  useJoinCommunity,
} from "@/hook/queries/useCommunityMutations";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";


interface Community {
  _id: string;
  title: string;
  name: string;
  description: string;
  subscription: boolean;
  subscription_price: number;
  image: string;
  background_image: string;
}

export function LeftmostSidebar() {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const sessionId = useSelector((state: RootState) => state.user.sessionId);
  // const [communities, setCommunities] = useState<Community[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [showCreatorForm, setShowCreatorForm] = React.useState(false);
  const [isCreatorFormOpen, setIsCreatorFormOpen] = useState(false);

  const handleOpenForm = () => {
    setShowCreatorForm((prev) => !prev);
  };

  const params = useParams();
  const dispatch = useDispatch();
 
  const user = useSelector((state: RootState) => state.user.user);

  const activeCommunityId = params.id;
  useEffect(() => {
    fetchCommunities();
  }, []);

  // const fetchCommunities = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           userId: userId,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to fetch communities");
  //     }

  //     const result = await response.json();
  //     console.log("comm", result);
  //     const validCommunities = result.data.filter(
  //       (community: Community | null) => community !== null
  //     );
  //     setCommunities(validCommunities);

  //     dispatch(setUserFollowedCommunities(validCommunities));
  //     // Set the first community as active if none is selected
  //     if (validCommunities.length > 0 && !activeCommunityId) {
  //       dispatch(
  //         setActiveCommunity({
  //           id: validCommunities[0]._id,
  //           name: validCommunities[0].name, // Include name
  //         })
  //       );
  //     }
  //   } catch (err) {
  //     setError(
  //       err instanceof Error ? err.message : "Failed to fetch communities"
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Fetch communities function
  const fetchCommunities = async (): Promise<Community[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/user/follow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      }
    );


    if (!response.ok) {
      throw new Error("Failed to fetch communities");
    }
    const result = await response.json();
    console.log("comm", result);
    const validCommunities = result?.data?.filter(
      (community: Community | null) => community !== null
    );
    // setCommunitie(validCommunities);

    dispatch(setUserFollowedCommunities(validCommunities));

    if (validCommunities.length > 0 && !activeCommunityId) {
      dispatch(
        setActiveCommunity({
          id: validCommunities[0]._id,
          name: validCommunities[0].name,
          image: validCommunities[0].image,
          background_image: validCommunities[0].background_image,
        })
      );
    }
    // const result = await response.json();
    return result.data.filter(
      (community: Community | null) => community !== null
    );
  };

  // Leave community mutation
  const leaveCommunityMutation = useLeaveCommunity();

  // Use React Query for fetching communities
  const {
    data: communities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userCommunities", userId],
    queryFn: fetchCommunities,
    enabled: !!userId,
    // Add this to ensure the component re-renders when the data changes
    staleTime: 0,
  });

  // Add this near the top of your component function
  const queryClient = useQueryClient();

  // Join community mutation
  const joinCommunityMutation = useJoinCommunity();

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await joinCommunityMutation.mutateAsync({
        userId: userId!,
        communityId,
      });

      toast.success("Successfully joined the community");

      // The cache invalidation is handled in the mutation's onSuccess callback
    } catch (error) {
      toast.error("Failed to join community");
      console.error("Error joining community:", error);
    }
  };

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      // API call to create a new community can be placed here
      setNewChannelName("");
    }
  };

  // Function to get initials from page name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // const handleLeaveCommunity = async (communityId: string) => {
  //   try {
  //     await leaveCommunityMutation.mutateAsync({
  //       userId: userId!,
  //       communityId,
  //     });

  //     toast.success("Successfully left the community");

  //     // If the active community is the one being left, clear it
  //     if (activeCommunityId === communityId) {
  //       dispatch(setActiveCommunity(null));
  //     }

  //     // The cache invalidation is handled in the mutation's onSuccess callback
  //   } catch (error) {
  //     toast.error("Failed to leave community");
  //     console.error("Error leaving community:", error);
  //   }
  // };

  // const handleNavigation = (path: string) => {
  //   router.push(path);
  // };
  const handleNavigation = (path: string,communityId:string) => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    const currentPage = pathSegments[3] || 'profile'; // Default to profile if no page specified
    console.log("@currentPage", path,communityId,currentPage);

    // If we're switching communities, maintain the same page
    if (currentPage =='channel') {
      // For channels, always navigate to profile
      router.push(`/community/${communityId}/profile`);
    }else if (path.includes('community')) {
      // const communityId = path.split('/community/')[1];
      console.log("@communityId", `/community/${communityId}/${currentPage}`,communityId);
      router.push(`/community/${communityId}/${currentPage}`);
    } 
  };

  if (error) {
    return (
      <div className="fixed left-0 h-screen w-20 bg-background flex items-center justify-center text-red-500">
        {StringConstants.ERROR_LOADING_PAGES}
      </div>
    );
  }

  return (

    <div className="hidden md:flex fixed left-0 h-screen w-20 bg-card flex-col items-center border-r border-background py-20 gap-3">
      <div className="flex-1 w-full overflow-auto scrollbar-none cursor-pointer">
        <div className="flex flex-col items-center space-y-4 px-2 py-5">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-12 h-12 rounded-lg bg-background animate-pulse"
                />
              ))}
            </div>
          ) : (
            communities.map((community: any) => (
              <Button
                key={community._id}
                variant="ghost"
                size="icon"
                className={`relative rounded-lg  ${activeCommunityId === community._id
                  ? "bg-blue-500/20 ring-2 ring-purple-500"
                  : "hover:bg-zinc-800"
                  }`}
                onClick={() => {
                  dispatch(
                    setActiveCommunity({
                      id: community._id,
                      name: community.name,
                      image: community.image,
                      background_image: community.background_image,
                    })
                  );
                  dispatch(
                    setCommunityData({
                      communityId: community._id,
                      userId: user._id,
                    })
                  );
                  handleNavigation(
                    `/community/${community._id}/profile`,community._id
                  );
                }}
              >
                <Avatar className="w-full h-full !rounded-lg">

                  <AvatarImage
                    src={
                      community.image && community.image !== ""
                        ? community.image
                        : ""
                    }
                    alt={community.name}
                    className="!rounded-lg"
                  />
                  <AvatarFallback className="!rounded-lg">{getInitials(community.name)}</AvatarFallback>
                </Avatar>
                {community.subscription && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    ⭐
                  </span>
                )}
              </Button>
            ))
          )}

          <Dialog open={isCreatorFormOpen} onOpenChange={setIsCreatorFormOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
              >
                <Plus className="h-6 w-6 text-muted" />
              </Button>
            </DialogTrigger>
            <CreatorForm
              onClose={() => setIsCreatorFormOpen(false)}
              onSuccess={() => {
                // Invalidate the cache when a new community is created
                queryClient.invalidateQueries({
                  queryKey: ["userCommunities"],
                });
              }}
            />
          </Dialog>

          <Link href="/explore">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg bg-background hover:bg-zinc-300 text-zinc-300"
            >
              <FaCompass className="text-muted" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}