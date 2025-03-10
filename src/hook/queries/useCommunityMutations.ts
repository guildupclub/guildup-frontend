import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/constants";
import { useDispatch } from "react-redux";
import { setUserFollowedCommunities } from "@/redux/userSlice";

interface LeaveCommunityParams {
  userId: string;
  communityId: string;
}

interface JoinCommunityParams {
  userId: string;
  communityId: string;
}

// export const useLeaveCommunity = () => {
//   const queryClient = useQueryClient();
//   const dispatch = useDispatch();

//   return useMutation({
//     mutationFn: async ({ userId, communityId }: LeaveCommunityParams) => {
//       const response = await fetch(
//         `${API_BASE_URL}/v1/community/leave`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userId, communityId }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to leave community");
//       }

//       return response.json();
//     },
//     onSuccess: (data, variables) => {
//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      
//       // Update the user's followed communities in Redux
//       const currentCommunities = queryClient.getQueryData<any[]>(["userCommunities"]) || [];
//       const updatedCommunities = currentCommunities.filter(
//         (community) => community._id !== variables.communityId
//       );
//       dispatch(setUserFollowedCommunities(updatedCommunities));
//     },
//   });
// };



export function useLeaveCommunity() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ userId, communityId }: { userId: string; communityId: string }) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/leave`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, communityId }),
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to leave community");
        }
        
        return response.json();
      },
      onSuccess: () => {
        // Invalidate the userCommunities query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      },
    });
  }

// export const useJoinCommunity = () => {
//   const queryClient = useQueryClient();
//   const dispatch = useDispatch();

//   return useMutation({
//     mutationFn: async ({ userId, communityId }: JoinCommunityParams) => {
//       const response = await fetch(
//         `${API_BASE_URL}/v1/community/join`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userId, communityId }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to join community");
//       }

//       return response.json();
//     },
//     onSuccess: async (data, variables) => {
//       // Invalidate the userCommunities query to trigger a refetch
//       queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      
//       // Get the current communities data
//       const currentCommunities = queryClient.getQueryData<any[]>(["userCommunities"]) || [];
      
//       // Fetch the newly joined community details
//       try {
//         const response = await fetch(
//           `${API_BASE_URL}/v1/community/about`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ communityId: variables.communityId }),
//           }
//         );
        
//         if (response.ok) {
//           const communityData = await response.json();
//           if (communityData.r === "s" && communityData.data) {
//             // Create a new community object with the required structure
//             const newCommunity = {
//               _id: variables.communityId,
//               name: communityData.data.community.name,
//               description: communityData.data.community.description,
//               // Add other fields as needed
//             };
            
//             // Add the new community to the list if it doesn't exist
//             const communityExists = currentCommunities.some(
//               (community) => community._id === variables.communityId
//             );
            
//             if (!communityExists) {
//               const updatedCommunities = [...currentCommunities, newCommunity];
              
//               // Update the query cache
//               queryClient.setQueryData(["userCommunities"], updatedCommunities);
              
//               // Update Redux state
//               dispatch(setUserFollowedCommunities(updatedCommunities));
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching joined community details:", error);
//       }
//     },
//   });
// }; 


// // src/hook/queries/useCommunityMutations.ts (add to existing file)

export function useJoinCommunity() {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ userId, communityId }: { userId: string; communityId: string }) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, communityId }),
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to join community");
        }
        
        return response.json();
      },
      onSuccess: () => {
        // Invalidate the userCommunities query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      },
    });
  }