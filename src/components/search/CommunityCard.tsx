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
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );

  const offerings = Array.isArray(community.offerings)
    ? community.offerings
    : [];
  const offerings = Array.isArray(community.offerings)
    ? community.offerings
    : [];
  const communityDetails = community.community;
  // Get the first offering from the array if it exists
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
  return (
    <Card
      onClick={() => onClick(community.community._id)}
      className="group w-full border border-zinc-200 rounded-xl cursor-pointer min-h-[320px] h-full overflow-hidden bg-white transition-all duration-500 hover:shadow-lg shadow-sm hover:shadow-blue-100/20 hover:border-blue-200/30 relative active:bg-white focus:bg-white"
    >
      <div className="relative h-[80px] w-full bg-gray-200">
        <Image
          src={
            community?.community?.background_image ||
            "/defaultCommunityIcon.png"
          }
          alt="Background"
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute left-4 top-[50px] rounded-full border border-white">
        <Image
          src={
            community.community.image && community.community.image !== ""
              ? community.community.image
              : "/defaultCommunityIcon.png"
          }
          alt="Profile"
          width={64}
          height={64}
          className="rounded-full object-cover h-16 w-16"
        />
      </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {communityDetails.name}
            </h3>
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

        {/* Offerings Section - Premium, minimal styling */}
        <div className="mt-auto flex-shrink-0">
          {firstOffering ? (
            <div className="mt-4 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-100/80 overflow-hidden group-hover:border-blue-100 transition-all duration-500">
              {/* Offering header */}
              <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoVideocam className="text-blue-500 h-4 w-4 group-hover:text-blue-600 transition-colors duration-300" />
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
                      <span className="text-lg font-semibold text-blue-600">
                        ₹{firstOffering.discounted_price}
                      </span>
                      <span className="line-through text-xs text-gray-400">
                        ₹{firstOffering.price.amount}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-blue-600">
                      {firstOffering?.price?.amount
                        ? `₹${firstOffering.price.amount}`
                        : "Free"}
                    </span>
                  )}
                </div>
                {/* 
                <Button
                  size="sm"
                  className="bg-blue-600 text-white rounded-md px-4 py-1 text-sm hover:bg-blue-700 transition-colors duration-300"
                  onClick={handleOfferingClick}
                >
                  Book Now
                </Button> */}
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
