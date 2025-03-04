"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Loader from "../Loader";
import { PostCard } from "./PostCard";
import { API_ENDPOINTS } from "@/config/constants";

interface Post {
  community_id: string;
  upvote_userId: any;
  _id: string;
  title: string;
  body: string;
  created_At: string;
  up_votes: number;
  reply_count: number;
  post_type: string;
  slug: string;
}

interface ApiResponse {
  r: string;
  data: Post[];
}

export function Feed() {
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchPosts = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getPosts, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, page }),
      });

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data: ApiResponse = await response.json();
      if (data.r === "s" && Array.isArray(data.data)) {
        return data.data;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMorePosts = async () => {
      const newPosts = await fetchPosts(page);
      if(newPosts){   
      setPosts((prevPosts) => {
        const uniquePosts = [...prevPosts, ...newPosts].filter(
          (post, index, self) =>
            index === self.findIndex((p) => p._id === post._id)
        );
        return uniquePosts;
      });

      setHasMore(newPosts?.length > 0);
    }
    };

    loadMorePosts();
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="feed" className="w-full">
        <TabsContent value="feed" className="mt-0 p-4">
          {loading && posts?.length === 0 ? (
            <Loader />
          ) : posts?.length === 0 ? (
            <div className="text-center text-zinc-400">No posts available</div>
          ) : (
            posts?.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                ref={index === posts?.length - 1 ? lastPostElementRef : null}
              />
            ))
          )}
          {loading && <Loader />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
