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
      <DialogContent className="sm:max-w-[640px] h-[85vh] bg-gradient-to-b from-white to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
            {StringConstants.EDIT_PAGE}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-6 px-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.PAGE_NAME}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your page name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.PAGE_DESCRIPTION}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe what your page is about..."
                />
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                {StringConstants.TAGS}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Type and press enter"
                  className="h-11 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                <Button 
                  onClick={handleAddTag}
                  className="px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-md transition-all duration-200"
                >
                  {StringConstants.ADD}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm 
                      bg-blue-50 text-blue-600 border border-blue-100 group hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.INSTAGRAMFOLLOWERS}
                </Label>
                <Input
                  type="number"
                  value={formData.instagram_followers}
                  onChange={(e) => setFormData({ ...formData, instagram_followers: e.target.value })}
                  className="h-11 rounded-xl bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.YOUTUBE_SUBSCRIBERS}
                </Label>
                <Input
                  type="number"
                  value={formData.youtube_followers}
                  onChange={(e) => setFormData({ ...formData, youtube_followers: e.target.value })}
                  className="h-11 rounded-xl bg-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.LINKEDIN_FOLLOWERS}
                </Label>
                <Input
                  type="number"
                  value={formData.linkedin_followers}
                  onChange={(e) => setFormData({ ...formData, linkedin_followers: e.target.value })}
                  className="h-11 rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.PROFILE_IMAGE}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <>
                        <Image
                          src={formData.image}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage("profile")}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </>
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], "profile")}
                      className="h-11 rounded-xl"
                    />
                    <p className="mt-1 text-xs text-gray-500">Recommended size: 400x400px</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  {StringConstants.BACKGROUND_IMAGE}
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.bgImage ? (
                      <>
                        <Image
                          src={formData.bgImage}
                          alt="Background"
                          width={128}
                          height={80}
                          className="object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage("background")}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </>
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      data-bg
                      onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0], "background")}
                      className="h-11 rounded-xl"
                    />
                    <p className="mt-1 text-xs text-gray-500">Recommended size: 1200x400px</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 px-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 rounded-xl hover:bg-gray-50"
          >
            {StringConstants.CANCEL}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white 
              hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
