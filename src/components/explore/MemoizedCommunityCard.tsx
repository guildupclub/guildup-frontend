import React, { useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { IoVideocam } from "react-icons/io5";
import { Button } from "../ui/button";
import { ImUsers } from "react-icons/im";
import { FaYoutube } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { BookingDialog } from "../booking/Bookingdialog"; // Ensure correct import path
import { useSession, signIn } from "next-auth/react";

interface CommunityCardProps {
  community: any; 
  onClick: () => void;
}

function CommunityCard({ community, onClick }: CommunityCardProps) {
  const { data: session } = useSession();
  const [selectedOffering, setSelectedOffering] = useState<any>(null);

  const tags: string[] = [
    ...new Set(
      community?.offerings?.flatMap((offering: any) =>
        Array.isArray(offering.tags) ? offering.tags : []
      )
    ),
  ];

  const communityDetails = community?.community;
  const OfferingDetails = community?.offerings;

  return (
    <Card
      onClick={onClick}
      className="relative w-full lg:w-[320px] border border-gray-200 rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Background Image */}
      <div className="relative h-[80px] w-full bg-gray-200">
        <Image
          src={community.image || "/defaultCommunityIcon.png"}
          alt="Background"
          fill
          className="object-cover"
        />
      </div>

      {/* Profile Image */}
      <div className="absolute left-4 top-[50px] w-14 h-14 rounded-full border-4 border-white">
        <Image
          src={community.icon || "/defaultCommunityIcon.png"}
          alt="Profile"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 pt-8 flex-1">
        {/* Name & Stats */}
        <h3 className="font-semibold text-gray-800 text-lg">
          {communityDetails?.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
          <span className="flex items-center gap-1">
            <ImUsers className="text-blue-600 h-4 w-4" />{" "}
            {communityDetails?.num_member}+
          </span>
          {/* <span className="flex items-center gap-1 mx-2">
            <FaYoutube className="text-red-600 h-4 w-4" /> 4K+
          </span> */}
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

      {/* Offerings Section (Stuck at Bottom) */}
      <div className="mt-auto flex items-center justify-between m-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <IoVideocam className="text-primary h-6 w-6" />
          <div>
            <span className="text-primary font-medium">
              {OfferingDetails?.[0]?.type}
            </span>
            <p className="text-xs text-gray-500">
              {OfferingDetails?.[0]?.duration} Min
            </p>
          </div>
        </div>

        {OfferingDetails && (
          <Button
            size="sm"
            className="text-white px-6 py-2 rounded-lg flex items-center gap-2 bg-primary"
            onClick={(e) => {
              // Prevent card onClick from triggering
              e.stopPropagation();
              if (!session) {
                signIn("google");
                return;
              }
              setSelectedOffering(OfferingDetails[0]);
            }}
          >
            {OfferingDetails?.[0]?.price?.amount ? (
              <>
                <span className="line-through text-xs opacity-60">
                  ₹{OfferingDetails[0].price.amount + 1000}
                </span>{" "}
              </>
            ) : null}
            {OfferingDetails?.[0]?.price?.amount
              ? `₹${OfferingDetails[0].price.amount}`
              : "FREE"}
          </Button>
        )}
      </div>
      
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


{
  /* <Button className="text-sm font-semibold text-white bg-primary px-4 py-1 rounded-lg">
{OfferingDetails?.[0]?.price?.amount ? (
  <>
    <span className="line-through text-xs opacity-60">
      ₹{OfferingDetails[0].price.amount + 1000}
    </span>{" "}
  </>
) : null}
{OfferingDetails?.[0]?.price?.amount
  ? `₹${OfferingDetails[0].price.amount}`
  : "FREE"}
</Button> */
}
