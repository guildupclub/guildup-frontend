//

"use client";

import * as React from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import CreatorForm from "@/components/form/CreatorForm";
import FooterLinks from "./FootLinks";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, signIn } from "next-auth/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { StringConstants } from "@/components/common/CommonText";
import { toast } from "sonner";
import DOMPurify from "dompurify";
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
  media: {
    publicUrl: string;
    fileType: string;
  };
  body: string;
  up_votes: number;
}

export function RightSidebar() {
  const [mounted, setMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const isCreator = user?.user?.is_creator ? true : false;

  // Add mounted state check
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't fetch until component is mounted

    const fetchTrendingPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/post/trending`,
          {
            page: 0,
            limit: 5,
          }
        );

        if (response?.data?.r === "s") {
          setTrendingPosts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching trending posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, [mounted]);

  // Don't render until mounted
  if (!mounted) {
    return (
      <aside className="w-full">
        <div className="w-full flex flex-col gap-4">
          <div className="bg-card rounded-xl p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </aside>
    );
  }

  const handleCreatorButtonClick = () => {
    if (!session) {
      toast("Sign in required", {
        action: {
          label: "Sign In",
          onClick: () =>
            signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`,
            }),
        },
      });
    } else {
      setIsDialogOpen(true);
    }
  };

  return (
    <aside className="w-full">
      <div className="w-full flex flex-col gap-4">
        {/* Creator Section */}
        {!isCreator && (
          <div className="bg-card rounded-xl p-4 w-full space-y-4 shadow-sm border border-zinc-200/30">
            <h1 className="font-semibold font-sans">
              Ready to Turn Your Expertise into income?
            </h1>
            <Dialog
              open={session ? isDialogOpen : false}
              onOpenChange={setIsDialogOpen}
            >
              <Button
                className="w-full text-white shadow-md"
                onClick={handleCreatorButtonClick}
              >
                {StringConstants.CREATE_A_PAGE}
              </Button>

              {session && <CreatorForm onClose={() => setIsDialogOpen(false)} />}
            </Dialog>
          </div>
        )}

        {/* Trending Posts Section */}
        <div className="bg-card rounded-xl shadow-sm border border-zinc-200/30 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold px-4 py-1 border-b border-zinc-200/50">
            {StringConstants.TRENDING_POSTS}
          </h2>
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-none">
            {isLoading ? (
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
                  className="px-4 py-2 border-b border-zinc-200/50 last:border-0 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6 ring-1 ring-zinc-200/50 shadow-sm">
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

                    <div className="flex flex-row gap-3 justify-between">
                      {/* Description on the left */}
                      <div
                        className={`${
                          post?.media?.publicUrl ? "flex-1" : "w-full"
                        }`}
                      >
                        <p
                          className="text-sm line-clamp-4 font-normal text-foreground/90"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              post.body.startsWith('"') && post.body.endsWith('"')
                                ? post.body.slice(1, -1)
                                : post.body
                            ),
                          }}
                        />
                        <div className="text-sm text-accent mt-2" />
                      </div>
                      {post?.media?.publicUrl && (
                        <div className="flex-shrink-0 ml-2">
                          {post?.media?.fileType === "image" && (
                            <img
                              src={post.media.publicUrl || "/placeholder.svg"}
                              alt="Post Image"
                              className="w-24 h-12 rounded-lg object-cover shadow-sm"
                            />
                          )}
                          {post?.media?.fileType === "video" && (
                            <video
                              className="w-24 h-12 rounded-lg object-cover shadow-sm"
                              autoPlay
                              loop
                              muted
                              playsInline
                              disableRemotePlayback
                            >
                              <source
                                src={post?.media?.publicUrl}
                                type="video/mp4"
                              />
                            </video>
                          )}
                        </div>
                      )}
                    </div>
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

        {/* Footer Links */}
        <div>
          <FooterLinks />
        </div>
      </div>
    </aside>
  );
}
