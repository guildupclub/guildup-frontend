import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/constants";

interface ChannelPost {
  _id: string;
  body: string;
  created_At: string;
  up_votes: number;
  reply_count: number;
  user_id: {
    _id: string;
    name: string;
    image: string;
  };
}

interface FetchChannelParams {
  userId: string;
  sessionId: string;
  channelId: string;
}

interface PostToChannelParams {
  userId: string;
  sessionId: string;
  channelId: string;
  body: string;
}

// Transform API data to our Post interface format
const transformChannelPosts = (data: ChannelPost[]) => {
  return data.map((item:any) => ({
    id: item._id || "",
    time: item.created_At || "",
    level: 0,
    content: item.body || "",
    likes: item.up_votes || 0,
    comments: item.reply_count || 0,
    author: item.user_id?.user_name || "Unknown",
    avatar: item.user_id?.image || "",
  }));
};

// Fetch channel posts
const fetchChannelPosts = async ({
  userId,
  sessionId,
  channelId,
}: FetchChannelParams) => {
  if (!channelId || !userId || !sessionId) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/v1/channel/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      session: sessionId,
      channelId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch channel content");
  }

  const result = await response.json();
  return result.data || [];
};

// Post to channel
const postToChannel = async ({
  userId,
  sessionId,
  channelId,
  body,
}: PostToChannelParams) => {
  const response = await fetch(`${API_BASE_URL}/v1/channel/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      session: sessionId,
      channelId,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send post");
  }

  return response.json();
};

// Hook for fetching channel posts
export const useChannelPosts = (params: FetchChannelParams | null) => {
  return useQuery({
    queryKey: ["channelPosts", params?.channelId],
    queryFn: () => (params ? fetchChannelPosts(params) : Promise.resolve([])),
    enabled: !!params?.channelId,
    select: transformChannelPosts,
  });
};

// Hook for posting to a channel
export const usePostToChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postToChannel,
    onSuccess: (newPost, variables) => {
      // Invalidate the query to refetch the posts
      queryClient.invalidateQueries({
        queryKey: ["channelPosts", variables.channelId],
      });

      // Optionally, update the cache directly for immediate UI update
      queryClient.setQueryData(
        ["channelPosts", variables.channelId],
        (oldData: ChannelPost[] = []) => {
          const transformedNewPost = {
            id: newPost._id || "",
            author: newPost.user_id?.user_name || "Unknown",
            time: newPost.created_At || "",
            level: 0,
            content: newPost.body || "",
            likes: newPost.up_votes || 0,
            comments: newPost.reply_count || 0,
            avatar: newPost.user_id?.image || "",
          };

          return [transformedNewPost, ...transformChannelPosts(oldData)];
        }
      );
    },
  });
};
