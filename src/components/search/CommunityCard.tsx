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
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );

  const offerings = Array.isArray(community.offerings)
    ? community.offerings
    : [];
  const communityDetails = community.community;
  // Get the first offering from the array if it exists
  const firstOffering = offerings.length > 0 ? offerings[0] : null;

  const tags: string[] = community?.community?.tags?.[0]?.includes(",")
    ? community?.community?.tags[0]?.split(",").map((tag: string) => tag.trim())
    : community?.community?.tags || [];

  // Get tags from the first offering if it exists
  // const tags = firstOffering?.tags || [];

  return (
    <Card
      onClick={() => onClick(community.community._id)}
      className="relative w-full lg:w-[320px] border border-gray-200 rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
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
      <div className="absolute left-4 top-[50px] w-14 h-14 rounded-full border-4 border-white">
        <Image
          src={community?.community?.image || "/defaultCommunityIcon.png"}
          alt="Profile"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
      </div>
      <div className="p-4 pt-8 flex-1">
        <h3 className="font-semibold text-gray-800 text-lg">
          {community.community.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
          <span className="flex items-center gap-1">
            <ImUsers className="text-blue-600 h-4 w-4" />{" "}
            {community.community.num_member}+
          </span>
          {/* <span className="flex items-center gap-1 mx-2">
            <FaYoutube className="text-red-600 h-4 w-4" /> 4K+
          </span> */}
        </div>
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
      {firstOffering && (
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
              // e.stopPropagation();
              if (!session) {
                signIn("google");
                return;
              }
              setSelectedOffering(firstOffering);
            }}
          >
            {firstOffering.price?.amount ? (
              <>
                <span className="line-through text-xs opacity-60">
                  ₹{firstOffering.price.amount + 1000}
                </span>{" "}
              </>
            ) : null}
            {firstOffering.price?.amount
              ? `₹${firstOffering.price.amount}`
              : "FREE"}
          </Button>
        </div>
      )}
      {/* {selectedOffering && (
        <BookingDialog
          offering={selectedOffering}
          isOpen={!!selectedOffering}
          onClose={() => setSelectedOffering(null)}
        />
      )} */}
    </Card>
  );
}

export default React.memo(CommunityCard);
