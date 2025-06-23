"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StringConstants } from "@/components/common/CommonText";
import InputField from "@/components/userProfile/Input";
import { ProfileHeader, LanguagesManager } from "@/components/profile";
import { useProfileEdit } from "@/hooks/useProfile";
import { 
  useUserProfileById, 
  useUpdateProfileById, 
  useUpdateUserAvatar 
} from "@/hooks/api/useUserQueries";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const userId = user?._id;

  // Fetch profile data
  const { 
    data: profileData, 
    isLoading, 
    isError 
  } = useUserProfileById(userId!, !!userId);

  // Mutations
  const updateProfileMutation = useUpdateProfileById();
  const updateAvatarMutation = useUpdateUserAvatar();

  // Profile edit state management
  const {
    profile,
    profileCopy,
    isEditable,
    changedFields,
    avatarImgUrl,
    activeTab,
    newLanguage,
    setProfile,
    setProfileCopy,
    setIsEditable,
    setChangedFields,
    setAvatarImgUrl,
    setActiveTab,
    setNewLanguage,
    handleChange,
    handleAddLanguage,
    handleRemoveLanguage,
    resetProfile,
    getDefaultAvatarUrl,
  } = useProfileEdit();

  // Initialize profile data when fetched
  React.useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setProfileCopy(profileData);
      setAvatarImgUrl(getDefaultAvatarUrl(profileData));
    }
  }, [profileData, setProfile, setProfileCopy, setAvatarImgUrl, getDefaultAvatarUrl]);

  // Handle profile save
  const handleSave = React.useCallback(() => {
    if (!profile || !userId) return;
    
    updateProfileMutation.mutate(
      { userId, updateData: changedFields },
      {
        onSuccess: (updatedUser) => {
          setProfile(updatedUser);
          setProfileCopy(updatedUser);
          setIsEditable(false);
          setChangedFields({});
        },
        onError: () => {
          setProfile(profileCopy);
        }
      }
    );
  }, [profile, userId, changedFields, updateProfileMutation, setProfile, setProfileCopy, setIsEditable, setChangedFields, profileCopy]);

  // Handle file upload
  const handleFileChange = React.useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toast.error("Please select an image file.");
      return;
    }

    const previousAvatarUrl = avatarImgUrl;

    updateAvatarMutation.mutate(
      { userId, file },
      {
        onSuccess: ({ user: updatedUser }) => {
          const newAvatarUrl = updatedUser.avatar || "";
          setAvatarImgUrl(newAvatarUrl);
          setProfile(updatedUser);
          setProfileCopy(updatedUser);
        },
        onError: () => {
          setAvatarImgUrl(previousAvatarUrl);
        }
      }
    );

    event.target.value = "";
  }, [userId, avatarImgUrl, updateAvatarMutation, setAvatarImgUrl, setProfile, setProfileCopy]);

  // Handle language input key down
  const handleLanguageKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLanguage();
    }
  }, [handleAddLanguage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] text-muted">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  console.log(isError,profile);
  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] text-muted">
        <div className="text-center">
          <p className="text-lg">Failed to load profile</p>
          <p className="text-sm text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#777BEA]/20 pb-16 text-primary">
      <div className="pt-20 md:pt-24 px-4 md:px-20 text-primary-f min-h-screen">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <ProfileHeader
            profile={profile}
            avatarUrl={avatarImgUrl}
            isEditable={isEditable}
            onEditClick={() => setIsEditable(true)}
            onFileChange={handleFileChange}
          />

          <CardContent className="p-6">
            <Tabs
              defaultValue="personal"
              className="w-full"
              onValueChange={setActiveTab}
              value={activeTab}
            >
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
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
                    value={profile.phone || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    prefix="+91"
                  />
                  <InputField
                    label="Location"
                    name="location"
                    placeholder="Enter your location"
                    value={profile.location || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                  />
                </div>
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Years of Experience"
                    name="year_of_experience"
                    placeholder="Enter years of experience"
                    value={profile.year_of_experience || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    type="number"
                  />
                  <InputField
                    label="Sessions Conducted"
                    name="session_conducted"
                    placeholder="Enter number of sessions"
                    value={profile.session_conducted || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    type="number"
                  />

                  <LanguagesManager
                    languages={profile.languages}
                    newLanguage={newLanguage}
                    isEditable={isEditable}
                    onNewLanguageChange={setNewLanguage}
                    onAddLanguage={handleAddLanguage}
                    onRemoveLanguage={handleRemoveLanguage}
                    onKeyDown={handleLanguageKeyDown}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {isEditable && (
              <div className="flex justify-end mt-6 gap-4">
                <Button
                  variant="outline"
                  className="text-primary"
                  onClick={resetProfile}
                >
                  Cancel
                </Button>
                <Button 
                  className="px-6" 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : StringConstants.SAVE}
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
