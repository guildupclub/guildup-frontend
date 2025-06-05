"use client";

import * as React from "react";
import Image from "next/image";
import { FaPlus, FaTimes } from "react-icons/fa";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Settings, Camera, Save, Edit } from "lucide-react";

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

const DashboardProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const userId = user?._id;
  const [profile, setProfile] = React.useState<User | null>(null);
  const [profileCopy, setProfileCopy] = React.useState<User | null>(null);
  const [isEditable, setIsEditable] = React.useState(false);
  const [avatarImgUrl, setAvatarImgUrl] = React.useState<string>("");
  const [changedFields, setChangedFields] = React.useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [newLanguage, setNewLanguage] = React.useState<string>("");

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
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error updating avatar. Please try again.");
    }
  };

  if (!profile) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditable ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditable(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditable(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Summary Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={avatarImgUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      Choose a new profile picture. Recommended size: 400x400 pixels.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-4 mt-3">
                {profile.is_creator && (
                  <Badge className="bg-blue-100 text-blue-800">Creator</Badge>
                )}
                <Badge variant="secondary">
                  {profile.community_joined?.length || 0} Communities
                </Badge>
                {profile.year_of_experience && (
                  <Badge variant="outline">
                    {profile.year_of_experience} years experience
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="personal" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Professional
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={!isEditable}
                />
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={true}
                />
                <InputField
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  disabled={!isEditable}
                />
                <InputField
                  label="Location"
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  placeholder="Enter your location"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <InputField
                  label="About"
                  type="text"
                  name="about"
                  value={profile.about || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  disabled={!isEditable}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Years of Experience"
                  type="text"
                  name="year_of_experience"
                  value={profile.year_of_experience || ""}
                  onChange={handleChange}
                  placeholder="e.g., 5 years"
                  disabled={!isEditable}
                />
                <InputField
                  label="Sessions Conducted"
                  type="text"
                  name="session_conducted"
                  value={profile.session_conducted || ""}
                  onChange={handleChange}
                  placeholder="e.g., 100+"
                  disabled={!isEditable}
                />
              </div>
              
              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.languages?.map((language, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {language}
                      {isEditable && (
                        <button
                          onClick={() => handleRemoveLanguage(language)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditable && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddLanguage();
                        }
                      }}
                    />
                    <Button onClick={handleAddLanguage} size="sm">
                      <FaPlus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader className="pb-6">
              <CardTitle>Account Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Creator Account</h4>
                    <p className="text-sm text-gray-600">
                      {profile.is_creator ? "You have creator privileges" : "Upgrade to become a creator"}
                    </p>
                  </div>
                  <Badge variant={profile.is_creator ? "default" : "secondary"}>
                    {profile.is_creator ? "Active" : "Standard"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Communities Joined</h4>
                    <p className="text-sm text-gray-600">
                      You're a member of {profile.community_joined?.length || 0} communities
                    </p>
                  </div>
                  <Badge variant="outline">
                    {profile.community_joined?.length || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Verification</h4>
                    <p className="text-sm text-gray-600">
                      {profile.emailVerified ? "Your email is verified" : "Email verification pending"}
                    </p>
                  </div>
                  <Badge variant={profile.emailVerified ? "default" : "destructive"}>
                    {profile.emailVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardProfilePage; 