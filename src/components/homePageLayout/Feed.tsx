"use client";

import { useCallback, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Loader from "../Loader";
import { PostCarde } from "./PostCard";
import { useInfinitePosts } from "@/hook/queries/useFeedQueries";
import { StringConstants } from "../common/CommonText";
import PostFromFeed from "./PostFromFeed";

export function Feed() {
  const userId = useSelector((state: RootState) => state.user.user?._id);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts(userId);

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

  const posts = data?.flattenedPosts || [];

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen overflow-scroll scrollbar-hide">
      <Tabs defaultValue="feed" className="w-full">
        <PostFromFeed />
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
                userID={userId}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
              />
            ))
          )}
          {isFetchingNextPage && <Loader />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
