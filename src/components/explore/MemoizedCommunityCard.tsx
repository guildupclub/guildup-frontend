"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "../ui/button";
import { ImUsers } from "react-icons/im";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import { FaLinkedinIn } from "react-icons/fa6";
import numbro from "numbro";
import { StringConstants } from "../common/CommonText";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCommunityData } from "@/redux/communitySlice";
import { setActiveCommunity } from "@/redux/channelSlice";
import { Loader2 } from "lucide-react";
import Loader from "../Loader";

interface CommunityCardProps {
  community: any;
  onClick: () => void;
}

// Add the required CSS class at the top of the file
const scrollbarHideStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

function CommunityCard({ community, onClick }: CommunityCardProps) {
  const { data: session } = useSession();
  const [selectedOffering, setSelectedOffering] = useState<any>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  const communityDetails = useMemo(() => community?.community, [community]);
  const firstOffering = useMemo(
    () => (community?.offerings?.length > 0 ? community.offerings[0] : null),
    [community?.offerings]
  );

  // Add years of experience (default to 0 if not available)
  const yearsOfExperience = useMemo(() => {
    return communityDetails?.years_of_experience || 0;
  }, [communityDetails]);

  const tags: string[] = useMemo(() => {
    // If tags don't exist, return empty array
    if (!communityDetails?.tags || !communityDetails.tags.length) return [];

    // Create a flat array of all tags
    let allTags: string[] = [];

    // Process each item in the tags array
    communityDetails.tags.forEach((tagItem: any) => {
      if (typeof tagItem === "string") {
        // If it's a string, check if it contains multiple comma-separated tags
        if (tagItem.includes(",")) {
          const splitTags = tagItem
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean);
          allTags = [...allTags, ...splitTags];
        } else {
          allTags.push(tagItem.trim());
        }
      } else if (Array.isArray(tagItem)) {
        // If it's an array, process each item
        tagItem.forEach((tag: any) => {
          if (typeof tag === "string") {
            if (tag.includes(",")) {
              const splitTags = tag
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean);
              allTags = [...allTags, ...splitTags];
            } else {
              allTags.push(tag.trim());
            }
          }
        });
      }
    });

    // Remove duplicates and empty strings
    return [...new Set(allTags)].filter(Boolean);
  }, [communityDetails?.tags]);

  const avatarImgUrl = useMemo(() => {
    if (!community) return "";

    const seedValue =
      community._id ||
      communityDetails?._id ||
      (communityDetails?.name &&
        `${communityDetails.name}-${communityDetails?.user_id || Date.now()}`);

    return (
      communityDetails?.image ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}`
    );
  }, [community, communityDetails]);

  const handleOfferingClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session) {
        toast("Please sign in to book the offering", {
          action: {
            label: "Sign In",
            onClick: () =>
              signIn(undefined, {
                callbackUrl: `${window.location.origin}?hero=1`,
              }),
          },
        });
        return;
      }
      setSelectedOffering(firstOffering);
    },
    [session, firstOffering]
  );

  const formatNumber = (num: any) => {
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

  const handleCardClick = useCallback(
    (communityData: { community: any }) => {
      if (!communityData.community || !communityData.community._id) {
        console.error("Invalid community data:", communityData);
        return;
      }

      // Set loading state
      setIsLoading(true);

      dispatch(
        setCommunityData({
          communityId: communityData.community._id,
          userId: communityData.community.user_id,
        })
      );

      // @ts-ignore - Ignoring type mismatch as the action only needs id and name
      dispatch(
        setActiveCommunity({
          id: communityData.community._id,
          name: communityData.community.name,
          image: "",
          background_image: "",
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );

      // Add a small delay to show the loader
      setTimeout(() => {
        router.push(`/community/${communityData.community._id}/profile`);
      }, 300);
    },
    [dispatch, router]
  );

  // Add this at the beginning of the component
  useEffect(() => {
    // Add the scrollbar-hide style to the document head
    if (!document.getElementById("scrollbar-hide-style")) {
      const style = document.createElement("style");
      style.id = "scrollbar-hide-style";
      style.innerHTML = scrollbarHideStyles;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up on component unmount
      const styleElement = document.getElementById("scrollbar-hide-style");
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <Card
      onClick={(e) => handleCardClick({ community: communityDetails })}
      className="group w-full border border-zinc-200 rounded-xl cursor-pointer min-h-[320px] h-full overflow-hidden bg-white transition-all duration-500 hover:shadow-lg shadow-sm hover:shadow-blue-100/20 hover:border-blue-200/30 relative active:bg-white focus:bg-white"
    >
      {/* Premium gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-100/0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80 backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="flex flex-col h-full p-5 relative">
        {/* Header with premium spacing and layout */}
        <div className="flex gap-4">
          <div className="relative group-hover:scale-105 transition-transform duration-500">
            <div className="relative">
              <Image
                src={avatarImgUrl}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-xl object-cover w-16 h-16 transition-all duration-500 group-hover:shadow-lg border border-gray-100"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-xl blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-primary-foreground transition-colors duration-300">
              {communityDetails?.name}
            </h3>

            <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
              <div>
                {communityDetails?.owner_experience > 0 && (
                  // <div className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors duration-300">
                  //   <ImUsers className="h-3.5 w-3.5 text-primary-foreground" />
                  //   <span>{formatNumber(communityDetails.num_member)}+</span>
                  // </div>
                  <div className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-amber-500"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                    <span>
                      {formatNumber(communityDetails?.owner_experience)}+
                    </span>
                  </div>
                )}
              </div>
              {communityDetails?.owner_sessions > 0 && (
                <div className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-violet-500"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>{formatNumber(communityDetails?.owner_sessions)}+</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags Section - horizontally scrollable, with original styling */}
        <div className="mt-4 mb-3 relative">
          <div className="overflow-x-auto scrollbar-hide pb-1.5">
            <div ref={tagContainerRef} className="flex gap-1.5 min-w-min">
              {tags.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  className="bg-white text-gray-600 px-2 py-0.5 text-[11px] rounded-full whitespace-nowrap
                    border border-gray-100/80 shadow-sm transition-all duration-300 hover:text-primary hover:border-primary/10 flex-shrink-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Subtle horizontal scroll indicators */}
          <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-white to-transparent transition-colors duration-500"></div>
          <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-white to-transparent transition-colors duration-500"></div>
        </div>

        {/* Premium Stats Bar - Clear separation from tags */}
        <div className="flex items-center gap-5 text-xs text-gray-500 border-t border-b border-gray-100 py-2.5">
          {communityDetails?.num_member > 0 && (
            <div className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors duration-300">
              <ImUsers className="h-3.5 w-3.5 text-primary-foreground" />
              <span>{formatNumber(communityDetails.num_member)}+</span>
            </div>
          )}

          {communityDetails?.linkedin_followers > 0 && (
            <div className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors duration-300">
              <FaLinkedinIn className="h-3.5 w-3.5 text-blue-600" />
              <span>{formatNumber(communityDetails.linkedin_followers)}+</span>
            </div>
          )}

          {communityDetails?.instagram_followers > 0 && (
            <div className="flex items-center gap-1.5 hover:text-pink-600 transition-colors duration-300">
              <GrInstagram className="h-3.5 w-3.5 text-pink-500" />
              <span>{formatNumber(communityDetails.instagram_followers)}+</span>
            </div>
          )}

          {communityDetails?.youtube_followers > 0 && (
            <div className="flex items-center gap-1.5 hover:text-red-600 transition-colors duration-300">
              <BsYoutube className="h-3.5 w-3.5 text-red-500" />
              <span>{formatNumber(communityDetails.youtube_followers)}+</span>
            </div>
          )}
        </div>

        {/* Offerings Section - Premium, minimal styling */}
        <div className="mt-auto flex-shrink-0">
          {firstOffering ? (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-100/80 overflow-hidden group-hover:border-blue-100 transition-all duration-500">
              {/* Offering header */}
              <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoVideocam className="text-primary-foreground h-4 w-4 transition-colors duration-300" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
                    {firstOffering.type || "Consultation"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {firstOffering.duration || 60} min
                </span>
              </div>

              {/* Pricing */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  {firstOffering?.discounted_price &&
                  firstOffering?.price?.amount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-primary-foreground">
                        ₹{firstOffering.discounted_price}
                      </span>
                      <span className="line-through text-xs text-gray-400">
                        ₹{firstOffering.price.amount}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-primary-foreground">
                      {firstOffering?.price?.amount
                        ? `₹${firstOffering.price.amount}`
                        : "Free"}
                    </span>
                  )}
                </div>

                <Button
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400"
                  onClick={handleOfferingClick}
                >
                  Book Now
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center p-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 backdrop-blur-sm rounded-xl border border-gray-200/50
              group-hover:from-gray-100/50 group-hover:to-gray-200/50 transition-all duration-500"
            >
              <p className="text-muted text-sm font-medium">
                No Offering Available
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default CommunityCard;
