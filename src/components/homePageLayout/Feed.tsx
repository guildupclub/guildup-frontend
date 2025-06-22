"use client";

import { useCallback, useRef, useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useInfinitePosts } from "@/hook/queries/useFeedQueries";
import Loader from "../Loader";
import { PostCarde } from "./PostCard";
import { StringConstants } from "../common/CommonText";
import PostFromFeed from "./PostFromFeed";

export function Feed() {
  const { user, isAuthenticated } = useAuth();

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    error 
  } = useInfinitePosts(user?.id);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage || !hasNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Get flattened posts from the hook's select function
  const posts = useMemo(() => data?.flattenedPosts || [], [data?.flattenedPosts]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500">
          <p>Failed to load posts</p>
          <p className="text-sm text-gray-500">{(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen overflow-scroll scrollbar-hide">
      <Tabs defaultValue="feed" className="w-full">
        {isAuthenticated && <PostFromFeed />}
        <TabsContent value="feed" className="mt-0 p-4">
          {posts.length === 0 ? (
            <div className="text-center text-zinc-400">
              {StringConstants.NO_POST_AVAILABLE}
            </div>
          ) : (
            posts.map((post, index) => (
              <PostCarde
                key={post._id}
                post={post}
                userID={user?.id || ""}
                cardRef={index === posts.length - 1 ? lastPostElementRef : null}
              />
            ))
          )}
          {isFetchingNextPage && <Loader />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
