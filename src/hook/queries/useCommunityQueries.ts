import { useQuery } from "@tanstack/react-query";

interface Post {
  _id: string;
  title: string;
  body: string;
  user_id: string;
  up_votes: number;
  down_votes: number;
  reply_count: number;
  created_At: string;
  is_locked: boolean;
  post_type: string;
  media?: {
    publicUrl: string;
    fileType: string;
  };
}

export const useCommunityPosts = (communityId: string | undefined) => {
  return useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/community/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId,
            is_locked: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const result = await response.json();
      return result.data as Post[];
    },
    enabled: !!communityId,
  });
}; 