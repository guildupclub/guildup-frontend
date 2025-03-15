//

"use client";

import * as React from "react";
import { Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import FooterLinks from "./FootLinks";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";

interface TrendingPost {
  _id: string;
  user_id: {
    _id: string;
    avatar: string | null;
    name: string;
  };
  community_id: {
    name: string;
    image: string | null;
    background_image: string | null;
  };
  body: string;
  up_votes: number;
}

export function RightSidebar() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Get the user data from Redux store
  const user = useSelector((state: RootState) => state.user);
  // Check if user is already a creator using the is_creator flag
  const isCreator = user?.user?.is_creator ? true : false;

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/trending`,
          { page: 0, limit: 5 }
        );

        if (response && response.data && response.data.r === "s") {
          console.log("API response data:", response.data.data);
          setTrendingPosts(response.data.data);
        } else {
          console.error("Failed to fetch trending posts", response.data);
        }
      } catch (error) {
        console.error("Error fetching trending posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  const handleCreatorButtonClick = () => {
    if (!session) {
      signIn("google");
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <aside className="right-0 h-screen w-80 pl-2 pt-4 pb-4 pe-5 space-y-4">
      {/* Creator Box - Only show if user is not already a creator */}
      {!isCreator && (
        <div className="bg-card rounded-xl p-4 w-full space-y-4 shadow-sm border border-zinc-200/30">
          <h1 className="font-semibold text-lg">
            Ready to start making money?
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button
              className="w-full text-white shadow-md"
              onClick={handleCreatorButtonClick}
            >
              {session ? (
                <DialogTrigger className="w-full">
                  {StringConstants.CREATE_A_PAGE}
                </DialogTrigger>
              ) : (
                <>{StringConstants.CREATE_A_PAGE}</>
              )}
            </Button>

            {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
          </Dialog>
        </div>
      )}

      {/* Trending Posts Box */}
      <div className="bg-card rounded-xl shadow-sm border border-zinc-200/30">
        <h2 className="text-lg font-semibold px-4 py-3 border-b border-zinc-200/50">
          {StringConstants.TRENDING_POSTS}
        </h2>
        <div className="max-h-[470px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
          {isLoading ? (
            // Loading skeleton UI
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-zinc-200/50 last:border-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))
          ) : trendingPosts.length > 0 ? (
            trendingPosts.map((post) => (
              <div
                key={post._id}
                className="px-4 py-3 border-b border-zinc-200/50 last:border-0 hover:bg-muted/10 transition-colors cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-1 ring-zinc-200">
                      {post?.community_id?.image ? (
                        <AvatarImage
                          src={post?.community_id?.image}
                          alt={post?.community_id?.name || "User"}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">
                      {post?.community_id && post.community_id.name
                        ? post.community_id.name
                        : ""}
                    </span>
                  </div>

                  <p className="text-sm line-clamp-3 font-normal text-foreground/90">
                    {post.body}
                  </p>

                  {/* <div className="flex items-center text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1 group">
                      <Heart className="h-3.5 w-3.5 group-hover:text-red-500 transition-colors" />
                      <span>{post.up_votes}</span>
                    </div>
                  </div> */}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-muted-foreground">
                No trending posts available
              </p>
            </div>
          )}
        </div>
      </div>

      <FooterLinks />
    </aside>
  );
}
