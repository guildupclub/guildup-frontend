import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/constants";

interface ChatMessage {
  _id: string;
  message_content: string;
  createdAt: string;
  sender_id: {
    _id: string;
    name: string;
    image: string;
  };
}

interface FetchChatParams {
  userId: string;
  channelId: string;
}

interface SendChatMessageParams {
  userId: string;
  channelId: string;
  message_type: string;
  message_content: string;
}

// Transform API data to our Post interface format
const transformChatMessages = (data: ChatMessage[]) => {
  return data.map((item:any) => ({
    id: item._id || "",
    time: item.createdAt || "",
    content: item.message_content || "",
    author: item.sender_id?.user_name || "Unknown",
    avatar: item.sender_id?.image || "",
  }));
};

// Fetch chat messages
const fetchChatMessages = async ({ userId, channelId }: FetchChatParams) => {
  if (!channelId || !userId) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/v1/channel/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channelId,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat messages");
  }

  const result = await response.json();
  return result.data || [];
};

// Send chat message
const sendChatMessage = async ({
  userId,
  channelId,
  message_type,
  message_content,
}: SendChatMessageParams) => {
  const response = await fetch(`${API_BASE_URL}/v1/channel/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channelId,
      message_type,
      message_content,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};

// Hook for fetching chat messages
export const useChatMessages = (params: FetchChatParams | null) => {
  return useQuery({
    queryKey: ["chatMessages", params?.channelId],
    queryFn: () => (params ? fetchChatMessages(params) : Promise.resolve([])),
    enabled: !!params?.channelId && !!params?.userId,
    select: transformChatMessages,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
};

// Hook for sending chat messages
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (newMessage, variables) => {
      // Invalidate the query to refetch the messages
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.channelId],
      });

      // Optionally, update the cache directly for immediate UI update
      queryClient.setQueryData(
        ["chatMessages", variables.channelId],
        (oldData: ChatMessage[] = []) => {
          const transformedNewMessage = {
            id: newMessage._id || "",
            author: newMessage.sender_id?.user_name || "Unknown",
            time: newMessage.createdAt || "",
            content: newMessage.message_content || "",
            avatar: newMessage.sender_id?.image || "",
          };

          return [transformedNewMessage, ...transformChatMessages(oldData)];
        }
      );
    },
  });
};
