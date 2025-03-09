import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/constants";
import { useDispatch } from "react-redux";
import { setUserFollowedCommunities } from "@/redux/userSlice";

interface LeaveCommunityParams {
  userId: string;
  communityId: string;
}

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ userId, communityId }: LeaveCommunityParams) => {
      const response = await fetch(
        `${API_BASE_URL}/v1/community/leave`,
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
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      
      // Update the user's followed communities in Redux
      const currentCommunities = queryClient.getQueryData<any[]>(["userCommunities"]) || [];
      const updatedCommunities = currentCommunities.filter(
        (community) => community._id !== variables.communityId
      );
      dispatch(setUserFollowedCommunities(updatedCommunities));
    },
  });
}; 