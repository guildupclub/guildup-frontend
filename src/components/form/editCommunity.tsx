// components/community/EditCommunityModal.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import { API_ENDPOINTS } from "@/config/constants";
import Image from "next/image";
import { RootState } from "@/redux/store";

interface Category {
  _id: string;
  name: string;
}

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditCommunityModal({ isOpen, onClose }: EditCommunityModalProps) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    rules: "",
    tags: [] as string[],
    image: "",
    bgImage: "",
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState({
    profile: false,
    background: false,
  });

   const user = useSelector((state: RootState) => state.user.user);
    const community = useSelector((state: RootState) => state.community);
    const  communityId = community?.communityId;
    const userId = user?._id;


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.getCategories}`);
        const data = await response.json();
        if (data.r === "s") {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle image upload
  const handleImageUpload = async (
    file: File,
    type: "profile" | "background"
  ) => {
    try {
      setImageUploading({ ...imageUploading, [type]: true });
      
      // Get signed URL
      const signUrlResponse = await fetch(API_ENDPOINTS.getSignUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: "image",
          userId,
          communityId,
        }),
      });
      
      const signedData = await signUrlResponse.json();
      
      if (signedData.r === "s") {
        // Upload to S3
        await fetch(signedData.data.signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        
        // Update form data with public URL
        setFormData({
          ...formData,
          [type === "profile" ? "image" : "bgImage"]: signedData.data.publicUrl,
        });
      }
    } catch (error) {
      console.error(`Failed to upload ${type} image:`, error);
    } finally {
      setImageUploading({ ...imageUploading, [type]: false });
    }
  };

  // Handle tag management
  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(API_ENDPOINTS.editCommunity, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          userId,
          ...formData,
          additional_tags: formData.tags,
        }),
      });

      const data = await response.json();
      
      if (data.r === "s") {
        // Update Redux store if needed
        onClose();
      }
    } catch (error) {
      console.error("Failed to update community:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white text-black">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
              />
              <Button onClick={handleAddTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
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

          <div className="grid gap-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <Image
                  src={formData.image}
                  alt="Profile"
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleImageUpload(e.target.files[0], "profile")
                }
                disabled={imageUploading.profile}
              />
              {imageUploading.profile && <div>Uploading...</div>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Background Image</Label>
            <div className="flex items-center gap-4">
              {formData.bgImage && (
                <Image
                  src={formData.bgImage}
                  alt="Background"
                  className="h-16 w-32 object-cover rounded"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleImageUpload(e.target.files[0], "background")
                }
                disabled={imageUploading.background}
              />
              {imageUploading.background && <div>Uploading...</div>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rules">Community Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
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