import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload } from "lucide-react";
import { API_ENDPOINTS } from "@/config/constants";
import Image from "next/image";
import { RootState } from "@/redux/store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StringConstants } from "@/components/common/CommonText";

interface Category {
  _id: string;
  name: string;
}

interface ProfileData {
  name?: string;
  description?: string;
  category?: string;
  rules?: string;
  additional_tags?: string[];
  image?: string;
  bgImage?: string;
  [key: string]: any;
  instagram_followers: string | number;
  youtube_followers: string | number;
}

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: ProfileData;
}

export function EditCommunityModal({
  isOpen,
  onClose,
  profile,
}: EditCommunityModalProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: profile?.community?.name || "",
    description: profile?.community?.description || "",
    category: profile?.community?.category || "",
    rules: profile?.community?.rules || "",
    tags: profile?.community?.tags || [],
    image: profile?.community?.image || "",
    bgImage: profile?.community?.bgImage || "",
    instagram_followers: profile?.community?.instagram_followers || "",
    youtube_followers: profile?.community?.youtube_followers || "",
    linkedin_followers: profile?.community?.linkedin_followers || "",
  });

  // Add state for file objects
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);

  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state: RootState) => state.user.user);
  const community: any = useSelector((state: RootState) => state.community);
  const communityId = community?.communityId;
  const communityData = community?.communityData;
  const userId = user?._id;

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: profile?.community?.name || community?.community?.name || "",
        description: profile?.community?.description || "",
        category: profile?.community?.category || "",
        rules: profile?.community?.rules || "",
        tags: profile?.community?.tags || communityData?.additional_tags || [],
        image: profile?.community?.image || communityData?.image || "",
        bgImage: profile?.community?.bgImage || communityData?.bgImage || "",
        instagram_followers:
          profile?.community?.instagram_followers ||
          communityData?.instagram_followers ||
          "",
        youtube_followers:
          profile?.community?.youtube_followers ||
          communityData?.youtube_followers ||
          "",
        linkedin_followers:
          profile?.community?.linkedin_followers ||
          communityData?.linkedin_followers ||
          "",
      }));
    }
  }, [isOpen, profile, communityData]);

  // Handle image selection
  const handleImageSelect = (file: File, type: "profile" | "background") => {
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(`File size exceeds 5MB limit for ${type === "profile" ? "profile" : "background"} image`);
      return;
    }

    if (type === "profile") {
      setImageFile(file);
      // Create a temporary URL for preview
      setFormData({
        ...formData,
        image: URL.createObjectURL(file),
      });
    } else {
      setBgImageFile(file);
      // Create a temporary URL for preview
      setFormData({
        ...formData,
        bgImage: URL.createObjectURL(file),
      });
    }
  };

  // Add this function after handleImageSelect
  const handleRemoveImage = (type: "profile" | "background") => {
    if (type === "profile") {
      setImageFile(null);
      setFormData((prev) => ({
        ...prev,
        image: "",
      }));
    } else {
      setBgImageFile(null);
      setFormData((prev) => ({
        ...prev,
        bgImage: "",
      }));
    }

    // Reset the file input by creating a new one
    const fileInput = document.querySelector(
      `input[type="file"][accept="image/*"]${
        type === "profile" ? ":not([data-bg])" : "[data-bg]"
      }`
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle tag management
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });

      setNewTag("");
    }
  };

  console.log("formData.tags", formData.tags);
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validate mandatory fields
      const mandatoryFields = {
        name: "Page Name",
        description: "Page Description",
        tags: "Tags"
      };

      const missingFields = Object.entries(mandatoryFields).filter(([key]) => {
        if (key === 'tags') {
          return !formData.tags || formData.tags.length === 0;
        }
        return !formData[key as keyof typeof formData];
      });

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.map(([_, label]) => label).join(', ')}`);
        return;
      }

      setIsLoading(true);

      // Create FormData object for multipart/form-data submission
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("communityId", communityId);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("userId", userId);

      // Add tags as a comma-separated string
      formDataToSend.append("additional_tags", formData.tags.join(","));
      formDataToSend.append(
        "instagram_followers",
        formData.instagram_followers
      );
      formDataToSend.append("youtube_followers", formData.youtube_followers);
      formDataToSend.append("linkedin_followers", formData.linkedin_followers);

      // Add rules if available
      if (formData.rules) {
        formDataToSend.append("rules", formData.rules);
      }

      // Add category if available
      if (formData.category) {
        formDataToSend.append("category", formData.category);
      }

      // Add image files if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (bgImageFile) {
        formDataToSend.append("background_image", bgImageFile);
      }

      const response = await fetch(API_ENDPOINTS.editCommunity, {
        method: "POST",
        body: formDataToSend, // No Content-Type header needed, browser sets it with boundary
      });

      const data = await response.json();

      if (data.r === "s") {
        // Update Redux store if needed
        dispatch({
          type: "SET_COMMUNITY",
          payload: {
            ...community,
            community: {
              ...(communityData || {}),
              name: formData.name,
              description: formData.description,
              category: formData.category,
              rules: formData.rules,
              additional_tags: formData.tags,
              image: data.data?.image || formData.image,
              bgImage: data.data?.bgImage || formData.bgImage,
            },
          },
        });

        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
        queryClient.invalidateQueries({
          queryKey: ["communityProfile", communityId],
        });

        toast.success(StringConstants.PAGE_UPDATION_SUCCESS);
        onClose();
      } else {
        toast.error(data.e || StringConstants.PAGE_UPDATION_FAILED);
      }
    } catch (error) {
      console.error(StringConstants.PAGE_UPDATION_FAILED, error);
      toast.error(StringConstants.PAGE_UPDATION_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white text-black max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{StringConstants.EDIT_PAGE}</DialogTitle>
        </DialogHeader>

        {/* Updated container with proper padding and no scrollbar */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="grid gap-4 py-4 px-6"> {/* Added px-6 for consistent padding */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {StringConstants.PAGE_NAME}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                {StringConstants.PAGE_DESCRIPTION}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>
                {StringConstants.TAGS}
                <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                />
                <Button onClick={handleAddTag}>{StringConstants.ADD}</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag: any) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {tag}
                    <X
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {StringConstants.INSTAGRAMFOLLOWERS}
                </Label>
                <Input
                  name="instaFollowers"
                  type="number"
                  value={formData.instagram_followers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagram_followers: e.target.value,
                    })
                  }
                  placeholder="Enter Instagram Followers"
                  className="bg-background border-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label>
                  {StringConstants.YOUTUBE_SUBSCRIBERS}
                </Label>
                <Input
                  name="youtubeSubscribers"
                  type="number"
                  value={formData.youtube_followers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      youtube_followers: e.target.value,
                    })
                  }
                  placeholder="Enter YouTube Subscribers"
                  className="bg-background border-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label>
                  {StringConstants.LINKEDIN_FOLLOWERS}
                </Label>
                <Input
                  name="linkedinFollowers"
                  type="number"
                  value={formData.linkedin_followers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      linkedin_followers: e.target.value,
                    })
                  }
                  placeholder="Enter Linkedin Followers"
                  className="bg-background border-none"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{StringConstants.PROFILE_IMAGE}</Label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <div className="relative">
                    <Image
                      src={formData.image}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      onClick={() => handleRemoveImage("profile")}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleImageSelect(e.target.files[0], "profile")
                  }
                  key={formData.image}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{StringConstants.BACKGROUND_IMAGE}</Label>
              <div className="flex items-center gap-4">
                {formData.bgImage && (
                  <div className="relative">
                    <Image
                      src={formData.bgImage}
                      alt="Background"
                      width={128}
                      height={64}
                      className="h-16 w-32 object-cover rounded"
                    />
                    <button
                      onClick={() => handleRemoveImage("background")}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  data-bg
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleImageSelect(e.target.files[0], "background")
                  }
                  key={formData.bgImage}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t mt-4 px-6">
          <Button variant="outline" onClick={onClose}>
            {StringConstants.CANCEL}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
