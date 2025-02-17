/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

interface ProfileCardProps {
  name: string;
  title: string;
  description: string;
  memberCount?: number;
  price?: string;
  skills: string[];
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  avatarUrl: string;
  offerings: Array<{
    title: string;
    price: number;
    description: string;
    icon?: string;
  }>;
}

interface ProfileData {
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
    image?: string;
  };
}

export function ProfileCard({
  name,
  skills,
  socialLinks,
  avatarUrl,
  offerings,
}: ProfileCardProps) {
  const user = useSelector((state: RootState) => state?.user?.user);
  const communityId = useSelector(
    (state: RootState) => state.community.communityId
  );

  // const { data: session } = useSession();
  const userId = useSelector((state: RootState) => state.community.userId);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [avatarImgUrl, setAvatarImgUrl] = useState("");
  const [bgImgUrl, setbgImgUrl] = useState("");

  const handleJoinCommunity = async () => {
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/join`,
        {
          userId: user.id,
          communityId
        }
      );
  
    console.log("@resposenJoin",response)
    } catch (err) {
      console.error('Error joining community:', err);
    } 
  };
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!communityId || !userId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/about`,
          { userId, communityId }
        );
        setProfileData(response.data.data);
        if (response.data.data?.user?.user_name) {
          const userName = response.data.data?.user?.user_name || "Adarsh";

          setAvatarImgUrl(
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
          );
          setbgImgUrl(
            "https://random-image-pepebigotes.vercel.app/api/random-image"
          );
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [communityId, userId]);

  if (!profileData || !profileData.user || !profileData.community) {
    return <p>Loading profile...</p>;
  }

  // console.log("communityId", communityId);
  // console.log("start");
  // console.log("userId", userId);
  // console.log("end");
  // console.log(session);
  // const avatarImgUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.user.user_name}`;
  console.log("Generated Avatar URL:", avatarUrl);

  return (
    <div className="w-full max-w-5xl mx-auto  text-zinc-200 py-20">
      <div className="relative ">
        <div className="h-48 w-full overflow-hidden ounded-t-lg">
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
              src={profileData.community.image || avatarImgUrl}
              alt={name}
              width={100}
              height={100}
              className="w-32 h-32 rounded-full object-cover bg-black border-4 border-primary "
              unoptimized
            />
            <AvatarFallback className="text-black text-2xl w-32 h-32">
              {profileData?.user?.user_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="bg-background pt-16 pb-8 px-8 rounded-b-lg bg-black">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{profileData.user.user_name}</h1>
            <p className="text-muted-foreground">
              {profileData.community.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {profileData.community.num_member.toLocaleString()} Members •{" "}
              {profileData.community.post_count} Posts
            </p>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.instagram && (
              <Link
                href={socialLinks.instagram}
                className="text-zinc-300 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.linkedin && (
              <Link
                href={socialLinks.linkedin}
                className="text-zinc-300 hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.twitter && (
              <Link
                href={socialLinks.twitter}
                className="text-zinc-300 hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            )}
            {socialLinks.facebook && (
              <Link
                href={socialLinks.facebook}
                className="text-zinc-300 hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            )}
            <Button
            onClick={handleJoinCommunity}
              variant="secondary"
              className="bg-primary-gradient text-primary-foreground hover:bg-primary/90"
            >
              Join Group sbe
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          <div className="bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground mb-4">
              {profileData?.user?.about || "?"}
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-black text-zinc-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Offering</h2>
            <div className="space-y-4 ">
              {offerings.map((offering) => (
                <Card key={offering.title} className="bg-zinc-900 border-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="font-semibold">{offering.title}</h3>
                    <p className="font-bold">${offering.price}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {offering.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
