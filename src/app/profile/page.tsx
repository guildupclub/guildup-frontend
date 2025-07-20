"use client";

import * as React from "react";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";
import InputField from "@/components/userProfile/Input";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./../../components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StringConstants } from "@/components/common/CommonText";
import { Button } from "@/components/ui/button";

interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  avatar: string;
  cover: string | null;
  about: string;
  phone: string;
  location: string;
  user_interests: string[];
  save: string[];
  share: string[];
  upvote: string[];
  downvote: string[];
  emailVerified: string | null;
  community_joined: string[];
  is_creator: boolean;
  custom_feeds: string[];
  year_of_experience?: string;
  session_conducted?: string;
  languages?: string[];
}

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const [profile, setProfile] = React.useState<User | null>(null);
  const [profileCopy, setProfileCopy] = React.useState<User | null>(null);
  const [isEditable, setIsEditable] = React.useState(false);
  const [avatarImgUrl, setAvatarImgUrl] = React.useState<string>("");
  const [changedFields, setChangedFields] = React.useState<Record<string, any>>(
    {}
  );
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [newLanguage, setNewLanguage] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<string>("personal");
  const isCreator = user?.is_creator ? true : false;

  React.useEffect(() => {
    const updateUserProfile = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile`,
          { userId }
        );

        if (response.data.r === "s") {
          setProfile(response.data.data);
          setProfileCopy(response.data.data);

          if (response.data.data.avatar) {
            setAvatarImgUrl(response.data.data.avatar);
          } else if (response.data.data.image) {
            setAvatarImgUrl(response.data.data.image);
          } else {
            setAvatarImgUrl(`https://api.dicebear.com/9.x/thumbs/svg`);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    updateUserProfile();
  }, [userId]);

  const updateUserProfile = async () => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/edit`,
        {
          updateData: changedFields,
          userId,
        }
      );
      if (response.data.r === "e") {
        toast.error(response.data.message);
        setProfile(profileCopy);
      } else {
        toast.success("Profile Updated Successfully!");
        setProfile(response.data.data.user);
        setProfileCopy(response.data.data.user);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, [name]: value } : null
    );
    setChangedFields((prevChanged) => ({ ...prevChanged, [name]: value }));
  };

  const handleSave = () => {
    if (profile) {
      updateUserProfile();
      setIsEditable(false);
    }
  };

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;

    const updatedLanguages = [
      ...(profile?.languages || []),
      newLanguage.trim(),
    ];

    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, languages: updatedLanguages } : null
    );

    setChangedFields((prevChanged) => ({
      ...prevChanged,
      languages: updatedLanguages,
    }));

    setNewLanguage("");
  };

  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = (profile?.languages || []).filter(
      (lang) => lang !== language
    );

    setProfile((prevProfile) =>
      prevProfile ? { ...prevProfile, languages: updatedLanguages } : null
    );

    setChangedFields((prevChanged) => ({
      ...prevChanged,
      languages: updatedLanguages,
    }));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toast.error("Please select an image file.");
      return;
    }

    const previousAvatarUrl = avatarImgUrl;
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("avatar", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/update-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.r === "s") {
        const newAvatarUrl = response.data.data.user.avatar;
        setAvatarImgUrl(newAvatarUrl);
        toast.success(response.data.data.message);
        setIsModalOpen(false);
      } else if (response.data.r === "e") {
        if (Array.isArray(response.data.e)) {
          response.data.e.forEach((err: any) => {
            toast.error(err.message);
          });
        } else {
          toast.error(response.data.e);
        }
        setAvatarImgUrl(previousAvatarUrl);
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.message || "Error uploading profile picture.");
      setAvatarImgUrl(previousAvatarUrl);
    } finally {
      event.target.value = "";
    }
  };

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] text-muted">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white  pb-16 text-primary">
      <div className="pt-20 md:pt-24 px-4 md:px-20 text-primary-f  min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">My Profile</h1>
        <Card className="bg-white shadow-none border-none overflow-hidden">
          {/* Profile header */}
          <div className="bg-white 5 p-6 md:p-8">
            <div className="flex flex-col items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative group w-32 h-32 md:w-40 md:h-40">
                    <Image
                      src={avatarImgUrl || "/placeholder.svg"}
                      alt="Profile Picture"
                      width={160}
                      height={160}
                      className="w-full h-full object-cover rounded-full shadow-md hover:cursor-pointer transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">
                        Change
                      </span>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      {StringConstants.UPDATE_PROFILE_PICTURE_DESCRIPTION ||
                        "Upload a new image to update your profile picture."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 flex flex-col space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-100 file:hover:bg-gray-200"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <button className="bg-[#334bff] text-white px-4 py-2 rounded hover:bg-[#2a3ecc] transition">
                        {StringConstants.CLOSE}
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="text-center md:text-left">
                {profile.languages && profile.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.languages.slice(0, 2).map((lang, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-[#334bff]/10 text-primary-foreground border-[#334bff]/20"
                      >
                        {lang}
                      </Badge>
                    ))}
                    {profile.languages.length > 2 && (
                      <Badge
                        variant="outline"
                        className="bg-[#334bff]/10 text-primary-foreground border-[#334bff]/20"
                      >
                        +{profile.languages.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button
                className={`realtive top-2 right-2 md:ml-auto w-full md:w-auto px-10 py-2  transition ${
                  isEditable ? "bg-gray-500 pointer-events-none" : ""
                }`}
                onClick={() => setIsEditable(true)}
                disabled={isEditable}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsContent value="personal" className="space-y-6 ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Name"
                    name="name"
                    placeholder="Enter your name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                  <InputField
                    label="Email ID"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="Phone Number"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditable}
                    prefix="+91"
                  />
                  <InputField
                    label="Location"
                    name="location"
                    placeholder="Enter your location"
                    value={profile.location}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {isEditable && (
              <div className="flex justify-end mt-6 gap-4">
                <Button
                  variant="outline"
                  className="text-primary"
                  onClick={() => {
                    setProfile(profileCopy);
                    setChangedFields({});
                    setIsEditable(false);
                  }}
                >
                  Cancel
                </Button>
                <Button className="px-6" onClick={handleSave}>
                  {StringConstants.SAVE}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
