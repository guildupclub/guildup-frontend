import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { ImUsers } from "react-icons/im";
import { FaYoutube } from "react-icons/fa";
import { BookingDialog } from "../booking/Bookingdialog";
import { useSession, signIn } from "next-auth/react";

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
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);

  const offerings = Array.isArray(community.offerings) ? community.offerings : [];
  const communityDetails = community.community;
  const firstOffering = offerings.length > 0 ? offerings[0] : null;

  const tags: string[] = community?.community?.tags?.[0]?.includes(",")
    ? community?.community?.tags[0]?.split(",").map((tag: string) => tag.trim())
    : community?.community?.tags || [];

  const avatarImgUrl = communityDetails?.image && communityDetails.image !== ""
    ? communityDetails.image
    : `/defaultCommunityIcon.png`;

  return (
    <Card
      onClick={() => onClick(community.community._id)}
      className="group w-full border border-gray-200/50 rounded-2xl cursor-pointer h-[320px] overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/10 relative"
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
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full truncate group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-all duration-300">
                <ImUsers className="text-blue-600 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{communityDetails.num_member}+</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="h-[60px] my-4 overflow-hidden">
          <div className="flex flex-wrap gap-1.5">
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

        {/* Offerings Section */}
        {firstOffering ? (
          <div className="mt-auto flex-shrink-0">
            <div className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm rounded-xl border border-blue-100/50
              group-hover:border-blue-200/50 group-hover:from-blue-100/50 group-hover:to-purple-100/50 transition-all duration-500">
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/80 rounded-lg flex-shrink-0 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                    <IoVideocam className="text-primary h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-primary text-sm font-medium block truncate group-hover:text-blue-700 transition-colors duration-300">
                      {firstOffering.type}
                    </span>
                    <p className="text-xs text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">
                      {firstOffering.duration} Min Session
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary/90 hover:bg-primary text-white shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!session) {
                      signIn("google");
                      return;
                    }
                    setSelectedOffering(firstOffering);
                  }}
                >
                  {firstOffering?.discounted_price && firstOffering?.price?.amount ? (
                    <>
                      <span className="line-through text-xs opacity-60">₹{firstOffering.price.amount}</span>
                      <span className="ml-1">₹{firstOffering.discounted_price}</span>
                    </>
                  ) : firstOffering?.price?.amount ? (
                    <span>₹{firstOffering.price.amount}</span>
                  ) : (
                    "Book Now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex-shrink-0">
            <div className="p-3 bg-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-100/50 text-center">
              <p className="text-gray-500 text-sm">No Offering Available</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default React.memo(CommunityCard);
