import { useInfiniteQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/constants";

interface Post {
  _id: string;
  title: string;
  body: string;
  created_At: string;
  up_votes: number;
  reply_count: number;
  post_type: string;
  slug: string;
  community_id: string;
  upvote_userId: any;
  media?: {
    publicUrl: string;
    fileType: string;
  };
}

interface FetchPostsParams {
  userId?: string;
  page: number;
}

interface ApiResponse {
  r: string;
  data: Post[];
}

const fetchPosts = async ({ userId, page }: FetchPostsParams): Promise<Post[]> => {
  const response = await fetch(API_ENDPOINTS.getPosts, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, page }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const data: ApiResponse = await response.json();
  return data.data || [];
};

export const useInfinitePosts = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["posts", userId],
    queryFn: ({ pageParam = 0 }) => fetchPosts({ userId, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has posts, return the next page number
      return lastPage.length > 0 ? allPages.length : undefined;
    },
    select: (data) => {
      // Flatten the pages and remove duplicates
      const allPosts = data.pages.flat();
      const uniquePosts = allPosts.filter(
        (post, index, self) =>
          index === self.findIndex((p) => p._id === post._id)
      );
      return {
        pages: data.pages,
        pageParams: data.pageParams,
        flattenedPosts: uniquePosts,
      };
    },
  });
};
