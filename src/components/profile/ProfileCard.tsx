"use client";

import { RootState } from "@/redux/store";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import {
  ArrowRight,
  Badge,
  Edit,
  Instagram,
  Trash2,
  Video,
} from "lucide-react";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { BookingDialog } from "../booking/Bookingdialog";
import { IoVideocam } from "react-icons/io5";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FiEdit } from "react-icons/fi";
import { EditCommunityModal } from "../form/editCommunity";
import EditOfferingModal from "./UpdateOffering";

// Add this state in ProfileCard component

interface CommunityProfile {
  user: {
    user_name: string;
    about: string;
  };
  community: {
    name: string;
    num_member: number;
    post_count: number;
    description: string;
    is_locked: boolean;
    tags: string[];
  };
}

interface ProfileCardProps {
  communityId: string;
}
interface Offering {
  _id: string;
  title: string;
  description: string;
  type: string;
  price: {
    amount: number;
    currency: string;
  };
  duration: number;
  is_free: boolean;
  tags: string[];
  rating: number;
  total_ratings: number;
}

export function ProfileCard() {
  const userFollowedCommunities = useSelector(
    (state: RootState) => state.user.userFollowedCommunities
  );
  const user = useSelector((state: RootState) => state.user.user);
  const community = useSelector((state: RootState) => state.community);
  const memberDetails = useSelector(
    (state: RootState) => state.member.memberDetails
  );
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfferingModal, setSelectedOfferingModal] = useState(null);

  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null
  );
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const activeCommunityId = community?.communityId;
  console.log(activeCommunityId);

  const isCommunityFollowed = userFollowedCommunities.some(
    (c) => c?._id === activeCommunityId
  );
  console.log(isCommunityFollowed);
  console.log(userFollowedCommunities);

  // Now button in the offering card

  // First, add the Offering interface

  // Add offerings state to existing states

  // Add fetchOfferings function
  const fetchOfferings = async () => {
    if (!community.communityId) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${community.communityId}`
      );

      if (response.data.r === "s") {
        setOfferings(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
  };

  // Add useEffect to fetch offerings
  // Add this section after the existing community info grid

  const handleLeaveCommunity = async () => {
    if (!user?._id || !community.communityId) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/leave`,
        {
          userId: user._id,
          communityId: community.communityId,
        }
      );

      if (response.data.r === "s") {
        toast.success("Successfully left the community!");
      }
    } catch (err) {
      console.error("Error leaving community:", err);
      toast.error("Failed to leave the community. Please try again.");
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, [community.communityId]);

  useEffect(() => {
    if (!community?.communityId) return; // Ensure communityId is set before fetching

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
          { communityId: community.communityId }
        );

        if (response.data.r === "s") {
          setProfile(response.data.data);
          setAvatarImgUrl(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.data.data.user.user_name}`
          );
          setBgImgUrl(
            "https://random-image-pepebigotes.vercel.app/api/random-image"
          );
        }
      } catch (error) {
        setError("Failed to load community profile");
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [community?.communityId]); // Dependency array includes communityId

  const handleJoinCommunity = async () => {
    if (!user?._id || !community.communityId) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`,
        {
          userId: user._id,
          communityId: community.communityId,
        }
      );

      // Show toast notification if the response is successful
      if (response.data.r === "s") {
        toast.success("Successfully joined the community!");
      }
    } catch (err) {
      console.error("Error joining community:", err);
      toast.error("Failed to join the community. Please try again.");
    }
  };

  const handleDeleteOffering = async (offeringId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/delete/${offeringId}`,
        {
          data: {
            userId: user._id,
            communityId: activeCommunityId,
          },
        }
      );
      toast.success("Offering deleted successfully");
      setOfferings(offerings.filter((offering) => offering._id !== offeringId));
    } catch (error) {
      console.error("Error deleting offering:", error);
      toast.error("Failed to delete offering");
    }
  };

  const handleEditClick = (offering: any) => {
    setSelectedOfferingModal(offering);
    setIsEditModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data available</div>;

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border/5">
        <div className="relative">
          <div className="h-32 w-full overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background">
            <img
              src={bgImgUrl || "/placeholder.svg"}
              alt="Profile banner"
              width={1200}
              height={400}
              className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          <div className="absolute -bottom-16 left-8">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-xl">
              <Image
                src={avatarImgUrl || "/placeholder.svg"}
                alt={profile.community.name}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover bg-primary/5 border-4 border-background transition-transform duration-300 hover:scale-105"
                unoptimized
              />
              {/* <AvatarFallback className="text-primary text-3xl w-32 h-32 bg-primary/5">
                {profile.user.user_name[0]}
              </AvatarFallback> */}
            </Avatar>
          </div>
        </div>

        <div className="pt-16 pb-4 px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                {profile?.community?.name}
                {memberDetails?.is_owner && (
                  <button
                    className="p-1 rounded-md hover:bg-background transition"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <FiEdit
                      size={18}
                      className="text-muted hover:text-primary"
                    />
                  </button>
                )}
              </h1>

              <p className="text-muted-foreground text-lg">
                Created by{" "}
                <span className="text-foreground">
                  {profile.user.user_name}
                </span>
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">
                    {profile.community.num_member.toLocaleString()}
                  </span>
                  Members
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">
                    {profile.community.post_count}
                  </span>
                  Posts
                </div>
              </div>
            </div>
            {memberDetails?.is_owner ? (
              ""
            ) : isCommunityFollowed ? (
              <Button
                variant="destructive"
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8"
                onClick={handleLeaveCommunity}
              >
                <HiMiniUserGroup className="h-8 w-8" />
                Leave Community
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-8"
                onClick={handleJoinCommunity}
              >
                <HiMiniUserGroup className="h-8 w-8" />
                Join Community
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="p-4 ">
          <h2 className="text-2xl font-semibold text-foreground mb-4">About</h2>
          <div className="bg-card rounded-xl p-8 shadow-sm border border-border/5 h-auto">
            <p className="text-muted-foreground leading-relaxed mb-6">
              {profile.community.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.community.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-border/5">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Community Info
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Privacy
              </h3>
              <p className="text-muted-foreground flex items-center gap-2">
                {profile.community.is_locked ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                    Private Community
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    Public Community
                  </>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Created By
              </h3>
              <p className="text-muted-foreground">{profile.user.user_name}</p>
            </div>
          </div>
        </div> */}

        <div className="rounded-xl p-4   transition-all duration-300 border border-border/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Offerings
            </h2>
            <AddOfferingDialog onOfferingAdded={fetchOfferings} />
          </div>

          {offerings.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-border/5">
              <p className="text-lg text-muted-foreground">
                No offerings available yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {offerings.map((offering) => (
                <div
                  key={offering._id || Math.random()}
                  className="group bg-white rounded-lg p-6 hover:shadow-sm transition-all duration-300"
                >

                  {/* Top Row: Icon + Title + Description */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <IoVideocam className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {offering.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 max-w-xl">
                        {offering.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 px-2">
                    {/* <span className="text-xl font-semibold text-gray-900 pl-12">
                      ₹{offering.price.amount}
                    </span> */}
                    <div className="flex items-center justify-between gap-2">
                      {memberDetails?.is_owner && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3 py-2 rounded-lg flex items-center gap-1"
                            onClick={() => handleEditClick(offering)}
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3 py-2 rounded-lg flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleDeleteOffering(offering._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      )}

                      {/* Book Now button */}
                      <Button
                        size="sm"
                        className={`text-white px-6 py-2 rounded-lg flex items-center gap-2 ${
                          !memberDetails?.is_owner ? "ml-auto" : ""
                        }`}
                        onClick={() => {
                          if (!session) {
                            signIn("google");
                            return;
                          }
                          setSelectedOffering(offering);
                        }}
                      >
                        <span className="line-through text-xs opacity-60">
                          ₹{offering.price.amount + 1000}
                        </span>
                        <span>₹{offering.price.amount}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {selectedOffering && (
                <BookingDialog
                  offering={selectedOffering}
                  isOpen={!!selectedOffering}
                  onClose={() => setSelectedOffering(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {isEditOpen && (
        <EditCommunityModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isEditModalOpen && selectedOfferingModal && (
        <EditOfferingModal
          offering={selectedOfferingModal}
          userId={user?._id}
          communityId={activeCommunityId}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchOfferings}
        />
      )}
    </div>
  );
}
