"use client";

import React, { useEffect, useState } from "react";
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
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const tags: string[] = community?.community?.tags?.[0]?.includes(",")
    ? community.community.tags[0].split(",").map((tag: string) => tag.trim())
    : community?.community?.tags || [];

  const communityDetails = community?.community;
  const OfferingDetails = community?.offerings;

  const firstOffering = OfferingDetails?.length > 0 ? OfferingDetails[0] : null;

  useEffect(() => {
    if (community) {
      const seedValue =
        community._id ||
        communityDetails?._id ||
        (communityDetails?.name &&
          `${communityDetails.name}-${
            communityDetails?.user_id || Date.now()
          }`);

      setAvatarImgUrl(
        communityDetails?.image ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}`
      );

      setBgImgUrl(
        communityDetails?.background_image ||
          "https://random-image-pepebigotes.vercel.app/api/random-image"
      );
    }
  }, [community, communityDetails]);

  return (
    <Card
      onClick={onClick}
      className="relative w-full border border-gray-200 rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-[80px] w-full bg-gray-200">
        <Image
          src={bgImgUrl }
          alt="Background"
          fill
          className="object-cover"
        />
      </div>
      <div className="absolute left-4 top-[50px] rounded-full border border-white">
        <Image
          src={avatarImgUrl}
          alt="Profile"
          width={64}
          height={64}
          className="rounded-full object-cover h-16 w-16"
        />
      </div>

      <div className="p-4 pt-10 flex-1">
        <h3 className="font-semibold text-gray-800 text-lg">
          {communityDetails?.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
          <span className="flex items-center gap-1">
            <ImUsers className="text-blue-600 h-4 w-4" />{" "}
            {communityDetails?.num_member}+
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag: string, index: number) => (
            <Badge
              key={index}
              className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded-lg"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      {firstOffering ? (
        <div className="mt-auto flex items-center justify-between m-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoVideocam className="text-primary h-6 w-6" />
            <div>
              <span className="text-primary font-medium">
                {firstOffering.type}
              </span>
              <p className="text-xs text-gray-500">
                {firstOffering.duration} Min
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="text-white px-6 py-2 rounded-lg flex items-center gap-2 bg-primary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking the button
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
            }}
          >
            {firstOffering?.discounted_price && firstOffering?.price?.amount ? (
              <>
                <span className="line-through text-xs opacity-60">
                  ₹{firstOffering.price.amount}
                </span>
                <span> ₹{firstOffering.discounted_price}</span>
              </>
            ) : (
              <span>₹{firstOffering?.price?.amount || "FREE"}</span>
            )}
          </Button>
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-center m-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-muted font-medium">No Offering Available</p>
        </div>
      )}
    </Card>
  );
}

export default React.memo(CommunityCard);
