"use client";

import { RootState } from "@/redux/store";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Badge } from "lucide-react";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { BookingDialog } from "../booking/Bookingdialog";



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
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);

// Update the Book Now button in the offering card


    // First, add the Offering interface

  // Add offerings state to existing states
  const [offerings, setOfferings] = useState<Offering[]>([]);
  
  // Add fetchOfferings function
  const fetchOfferings = async () => {
    if (!community.communityId) return;
  
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/offering/community/${community.communityId}`
      );
  
      if (response.data.r === "s") {
        setOfferings(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
    }
  };
  
  // Add useEffect to fetch offerings
  // Add this section after the existing community info grid
  const user = useSelector((state: RootState) => state.user.user);
  
  const community = useSelector((state: RootState) => state.community);
  useEffect(() => {
    fetchOfferings();
  }, [community.communityId]);
  

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!community.communityId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
          { communityId:community.communityId }
        );

        console.log("@profileREsponse",response.data.data)

        if (response.data.r === "s") {
          setProfile(response.data.data);
          // Generate avatar URL based on username
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
  }, [community.communityId]);

  const handleJoinCommunity = async () => {
    if (!user?._id || !community.communityId) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`,
        {
          userId: user._id,
          communityId:community.communityId
        }
      );
      // Handle successful join
      // if (response.data.r === "s") {
      //   // Refresh profile data
      //   fetchProfileData();
      // }
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile data available</div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-20">
      <div className="bg-card rounded-lg p-4 shadow-lg">
        <div className="relative">
          <div className="h-28 w-full overflow-hidden rounded-t-lg bg-card">
            <img
              src={bgImgUrl}
              alt="Profile banner"
              width={1200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-12 left-8">
            <Avatar className="w-32 h-32">
              <Image
                src={avatarImgUrl}
                alt={profile.community.name}
                width={100}
                height={100}
                className="w-32 h-32 rounded-full object-cover bg-black border-4 border-primary"
                unoptimized
              />
              <AvatarFallback className="text-black text-2xl w-32 h-32">
                {profile.user.user_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-16 pb-2 px-8 rounded-b-lg text-muted-foreground">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold text-muted">
                {profile.community.name}
              </h1>
              <p className="text-muted-foreground">
                Created by {profile.user.user_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.community.num_member.toLocaleString()} Members • {profile.community.post_count} Posts
              </p>
            </div>
            <Button
              variant="secondary"
              className="bg-primary-gradient text-primary-foreground hover:bg-primary/90"
              onClick={handleJoinCommunity}
            >
              Join Community
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 text-muted">
        <div className="bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-muted-foreground mb-4">
            {profile.community.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.community.tags.map((tag) => (
              <Badge key={tag} className="bg-background">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Community Info</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Privacy</h3>
              <p className="text-muted-foreground">
                {profile.community.is_locked ? "Private Community" : "Public Community"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Created By</h3>
              <p className="text-muted-foreground">{profile.user.user_name}</p>
            </div>
          </div>
        </div>        {/* Add this after the existing grid */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-muted">Offerings</h2>
            <AddOfferingDialog onOfferingAdded={fetchOfferings} />
          </div>
        
          {offerings.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-lg">
              <p className="text-muted-foreground">No offerings available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offerings.map((offering) => (
                <div
                  key={offering._id}
                  className="bg-card p-6 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {offering.title}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {offering.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {offering.is_free 
                          ? "Free" 
                          : `${offering.price.currency} ${offering.price.amount}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offering.duration} mins
                      </p>
                    </div>
                  </div>
        
                  <p className="text-sm text-muted-foreground mb-4">
                    {offering.description}
                  </p>
        
                  <div className="flex flex-wrap gap-2 mb-4">
                    {offering.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
        
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {offering.rating.toFixed(1)} ★
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({offering.total_ratings} ratings)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-primary-gradient"
                  onClick={() => setSelectedOffering(offering)}
                    >
                      Book Now
                    </Button>
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
    </div>
  );
}