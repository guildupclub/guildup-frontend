import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { ImUsers } from "react-icons/im";
import { FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { BookingDialog } from "../booking/Bookingdialog";
import { useSession, signIn } from "next-auth/react";
import { GrInstagram } from "react-icons/gr";
import { BsYoutube } from "react-icons/bs";
import numbro from "numbro";
import { toast } from "sonner";

interface Offering {
  type: string;
  duration: number;
  price?: {
    amount: number;
  };
  discounted_price: string;
  tags?: string[];
  title?: string;
}

interface Community {
  _id: string;
  name: string;
  description: string;
  num_member: number;
  image?: string;
  icon?: string;
  tags?: string[];
  background_image: string;
  linkedin_followers: number;
  instagram_followers: number;
  youtube_followers: number;
  owner_sessions: number;
  owner_experience: number;
}

interface CommunityCardProps {
  community: {
    community: Community;
    offerings: Offering[];
  };
  onClick: (id: string) => void;
}

function CommunityCard({ community, onClick }: CommunityCardProps) {
  const { data: session } = useSession();
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );

  const offerings = Array.isArray(community.offerings)
    ? community.offerings
    : [];
  const communityDetails = community.community;
  const firstOffering = offerings.length > 0 ? offerings[0] : null;

  const tags: string[] = community?.community?.tags?.[0]?.includes(",")
    ? community?.community?.tags[0]?.split(",").map((tag: string) => tag.trim())
    : community?.community?.tags || [];

  const avatarImgUrl =
    communityDetails?.image && communityDetails.image !== ""
      ? communityDetails.image
      : `/defaultCommunityIcon.png`;

  const formatNumber = (num: any) => {
    if (num < 1000) return num;
    return numbro(num).format({ average: true, mantissa: 1 }).toUpperCase();
  };

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
  return (
    <Card
      onClick={() => onClick(community.community._id)}
      className="group w-full border border-zinc-200 rounded-xl cursor-pointer min-h-[320px] h-full overflow-hidden bg-white transition-all duration-500 hover:shadow-lg shadow-sm hover:shadow-blue-100/20 hover:border-blue-200/30 relative active:bg-white focus:bg-white"
      data-analytics-type="community-card"
      data-analytics-name={communityDetails.name}
      data-community-id={communityDetails._id}
      data-community-name={communityDetails.name}
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      <div className="flex flex-col h-full p-4 relative">
        {/* Header - Avatar and Name with enhanced hover effects */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative group-hover:scale-105 transition-transform duration-500">
            <div className="relative">
              <Image
                src={avatarImgUrl}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-2xl object-cover w-20 h-20 transition-transform duration-500 group-hover:shadow-lg"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {communityDetails.name}
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
            <div className="flex gap-1.5 min-w-min">
              {tags.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  className="bg-gray-50/50 text-gray-600 px-2 py-0.5 text-[12px] rounded-full border border-gray-100/50 
                  transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/10"
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
            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors duration-300">
              <ImUsers className="h-3.5 w-3.5 text-blue-500" />
              <span>{formatNumber(communityDetails.num_member)}+</span>
            </div>
          )}

          {communityDetails?.linkedin_followers > 0 && (
            <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors duration-300">
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
                  data-analytics-type="community-cta"
                  data-analytics-name="Book Now"
                  data-community-id={communityDetails._id}
                  data-community-name={communityDetails.name}
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

export default React.memo(CommunityCard);
