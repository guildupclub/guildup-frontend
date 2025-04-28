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
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
          {
            page: 0,
            limit: 5,
          }
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

  // const handleCreatorButtonClick = () => {
  //   if (!session) {
  //     toast("Please sign in to Build your Guild", {
  //       action: {
  //         label: "Sign In",
  //         onClick: () => signIn(),
  //       },
  //     });
  //   } else {
  //     setIsDialogOpen(true);
  //   }
  // };
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
  const handlePostClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };
  return (
    <aside className="right-0 h-screen w-80 pl-2 pt-4 pb-4 pe-5 space-y-4">
      {!isCreator && (
        <div className="bg-card rounded-xl p-4 w-full space-y-4 shadow-sm border border-zinc-200/30">
          <h1 className="font-semibold  font-sans">
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

      <div className="bg-card rounded-xl shadow-sm border border-zinc-200/30 hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold px-4 py-1 border-b border-zinc-200/50">
          {StringConstants.TRENDING_POSTS}
        </h2>
        <div className="max-h-[470px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 overflow-auto scrollbar-none cursor-pointer">
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
                onClick={() => handlePostClick(post?._id)}
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

      <FooterLinks />
    </aside>
  );
}
