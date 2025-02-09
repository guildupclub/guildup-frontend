"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCreator } from './PostCreator';
import { PostCard } from './PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { fetchPosts } from '../../redux/postSlice';

export function Feed() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, isLoading, error, page, hasMore } = useSelector((state: RootState) => state.posts);

  // Load the first page on mount (make sure your reducer appends posts)
  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts({ userId: "678cf03a3755e3d81f93d5aa", page: 0 }));
    }
  }, [dispatch, posts.length]);

  // Infinite scroll: observe the last post element.
  // Using a threshold of 0.5 to trigger loading earlier.
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            dispatch(fetchPosts({ page, userId: "678cf03a3755e3d81f93d5aa" }));
          }
        },
        { threshold: 0.5 }  // Adjust threshold as needed
      );
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, dispatch, page]
  );

  return (
    // Optionally wrap posts in a container that does not force scroll-top on re-render.
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="w-full justify-start h-14 bg-transparent border-b border-zinc-800 rounded-none p-0">
          <TabsTrigger
            value="feed"
            className="data-[state=active]:bg-transparent data-[state=active]:text-purple-500 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-8 h-14"
          >
            Feed
          </TabsTrigger>
          <TabsTrigger
            value="snipz"
            className="data-[state=active]:bg-transparent data-[state=active]:text-purple-500 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 px-8 h-14"
          >
            Snipz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="feed" className="mt-0 p-4">
          <PostCreator />
          {isLoading && posts.length === 0 ? (
            <div className="text-center text-zinc-400">Loading posts...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-zinc-400">No posts available</div>
          ) : (
            posts.map((post, index) => {
              if (posts.length === index + 1) {
                // Attach observer ref to the last post.
                return (
                  <div key={post._id} ref={lastPostElementRef}>
                    <PostCard post={post} />
                  </div>
                );
              } else {
                return <PostCard key={post._id} post={post} />;
              }
            })
          )}
          {isLoading && posts.length > 0 && (
            <div className="text-center text-zinc-400">Loading more posts...</div>
          )}
        </TabsContent>
        <TabsContent value="snipz">
          <div className="p-4 text-center text-zinc-400">No snipz available</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}