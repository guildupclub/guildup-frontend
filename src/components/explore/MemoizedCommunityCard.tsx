"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "../ui/button";
import { ImUsers } from "react-icons/im";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

interface CommunityCardProps {
  community: any;
  onClick: () => void;
}

function CommunityCard({ community, onClick }: CommunityCardProps) {
  const { data: session } = useSession();
  const [selectedOffering, setSelectedOffering] = useState<any>(null);

  const communityDetails = useMemo(() => community?.community, [community]);
  const firstOffering = useMemo(
    () => (community?.offerings?.length > 0 ? community.offerings[0] : null),
    [community?.offerings]
  );

  const tags: string[] = useMemo(() => {
    const rawTags = communityDetails?.tags?.[0];
    if (!rawTags) return [];
    return rawTags.includes(",")
      ? rawTags.split(",").map((tag: string) => tag.trim())
      : [rawTags];
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

  return (
    <Card
      onClick={onClick}
      className="group w-full border border-gray-200/50 rounded-2xl cursor-pointer h-[320px] overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/10 relative"
    >
      {/* Shine effect overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      <div className="flex flex-col h-full p-4 relative">
        {/* Header - Avatar and Name with enhanced hover effects */}
        <div className="flex gap-4">
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
              {communityDetails?.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full truncate group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-all duration-300">
                <ImUsers className="text-blue-600 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {communityDetails?.num_member}+ members
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Tags Section with hover effects */}
        <div className="h-[60px] my-4 overflow-hidden">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: string, index: number) => (
              <Badge
                key={index}
                className="bg-gray-50/50 text-gray-600 px-2 py-0.5 text-[10px] rounded-full border border-gray-100/50 
                  transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/10
                  group-hover:translate-y-[-2px]"
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Offerings Section with enhanced effects */}
        <div className="mt-auto flex-shrink-0">
          {firstOffering ? (
            <div
              className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm rounded-xl border border-blue-100/50
              group-hover:border-blue-200/50 group-hover:from-blue-100/50 group-hover:to-purple-100/50 transition-all duration-500"
            >
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

                <div className="flex-shrink-0 text-right">
                  {firstOffering?.discounted_price &&
                  firstOffering?.price?.amount ? (
                    <div className="flex flex-col items-end">
                      <span className="line-through text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        ₹{firstOffering.price.amount}
                      </span>
                      <span className="text-sm font-medium text-primary group-hover:text-blue-700 transition-colors duration-300">
                        ₹{firstOffering.discounted_price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-primary group-hover:text-blue-700 transition-colors duration-300">
                      ₹{firstOffering?.price?.amount || "FREE"}
                    </span>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                className="w-full mt-3 bg-primary text-white px-4 py-1.5 rounded-lg flex items-center justify-center text-sm
                  transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25
                  group-hover:bg-blue-600"
                onClick={handleOfferingClick}
              >
                Book Now
              </Button>
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
