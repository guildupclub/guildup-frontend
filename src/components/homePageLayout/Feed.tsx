"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCreator } from "./PostCreator";
import { useSession } from 'next-auth/react';
import  {PostCard}  from "./PostCard";
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
  const [posts, setPosts] = useState<Post[]>([]);
  const data = useSession();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef<any>(null);

  console.log("@session",data)
  const lastPostElementRef = useCallback(
    (node:any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // trigger loading of new posts by chaging page no
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const fetchPosts = async (page:any,num:any) => {
    try {
      const response:any = await fetch(API_ENDPOINTS.getPosts, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "678ce60732c37c1222f913e0",
          page:page
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data: ApiResponse = await response.json();
      if (data.r === "s" && Array.isArray(data.data)) {
        console.log("@Reponse",data)
        return data.data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    setLoading(true);
    console.log("Getting mroe post")
    const newPosts = await fetchPosts(page, 10);
    console.log("@newPost",newPosts)
    setPosts((prevPosts) => {
      if (prevPosts) {
        return [...prevPosts, ...newPosts || []];
      } else {
        return [...newPosts || []]; // Or return newPosts; if you want to replace previous posts entirely.
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadMorePosts();
  }, [page]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     try {
  //       const response = await fetch(API_ENDPOINTS.getPosts, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           userId: "678ce60732c37c1222f913e0",
  //         }),
  //       });

  //       if (!response.ok) throw new Error("Failed to fetch posts");

  //       const data: ApiResponse = await response.json();
  //       if (data.r === "s" && Array.isArray(data.data)) {
  //         setPosts(data.data);
  //       }
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : "Failed to fetch posts");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchPosts();
  // }, []);

  return (
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
          {/* <PostCreator /> */}

          {isLoading ? (
            <div className="text-center text-zinc-400">Loading posts...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-zinc-400">No posts available</div>
          ) : (
            posts.map((post,index) => <PostCard key={post._id} post={{...post, community_id: post.community_id || 'default', upvote_userId: post.upvote_userId}} ref={posts.length === index + 1 ? lastPostElementRef : null}
            />)
          )}
        </TabsContent>

        <TabsContent value="snipz">
          <div className="p-4 text-center text-zinc-400">
            Launching soon !!
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
