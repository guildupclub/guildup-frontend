// src/hook/queries/usePostMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface CreatePostData {
  userId: string;
  communityId: string;
  title: string;
  body: string;
  tags?: string[];
  file?: File;
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostData) => {
      const formData = new FormData();
      formData.append("userId", postData.userId || "");
      formData.append("communityId", postData.communityId || "");
      formData.append("title", postData.title);
      formData.append("body", postData.body);
      
      // Add tags if any
      if (postData.tags && postData.tags.length > 0) {
        formData.append("tags", JSON.stringify(postData.tags));
      }

      // Add file if selected
      if (postData.file) {
        formData.append("file", postData.file);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });
};