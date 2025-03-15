"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { StringConstants } from "../common/CommonText";

interface CreatorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  _id: string;
  name: string;
}

export default function CreatorForm({ onClose, onSuccess }: CreatorFormProps) {
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    instaFollowers: "",
    youtubeSubscribers: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [additionalTags] = useState([]);

  // Fetch categories dynamically
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/category/`
      );
      if (!response || !response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      return data.data || [];
    },
  });

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value);
    setCategoryId(value);
  };

  console.log("Categories", categoryId);

  // Mutation for creating community
  const createCommunity = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            name: formData.name,
            description: formData.description,
            additional_tags: formData.tags.split(","),
            category_id: categoryId,
            instagram_followers: formData.instaFollowers,
            youtube_followers: formData.youtubeSubscribers,
            is_locked: false,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (!data && data.r !== "s")
        console.log(data.e || "Failed to create community");

      return data;
    },
    onSuccess: () => {
      toast.success("Community created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setFormData({
        name: "",
        description: "",
        tags: "",
        instaFollowers: "",
        youtubeSubscribers: "",
      });
      setCategoryId("");
      onClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Failed to create community: ${error.message}`);
      onClose();
    },
  });

  // Handle submit action
  const handleSubmit = () => {
    if (!formData.name || !formData.description || !categoryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a topic.");
      return;
    }

    createCommunity.mutate();
  };

  return (
    session && (
      <DialogContent className="sm:max-w-[470px] bg-card text-muted border-none">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-normal">
            Fill to create your page
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Page Name<span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              className="bg-background border-none"
            />
          </div>
          <div className="space-y-2">
            <Label>
              {StringConstants.SELECT_TOPICS}
              <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-background border-none">
                <SelectValue placeholder="Select your topic" />
              </SelectTrigger>
              <SelectContent className="bg-background text-accent border-none h-64 cursor-pointer">
                {categories.map((category: Category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>
              {StringConstants.TAGS}
              <span className="text-red-500">*</span>
            </Label>
            <span>(comma-separated)</span>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter Tags"
              className="bg-background border-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {StringConstants.FOLLOWERS}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                name="instaFollowers"
                type="number"
                value={formData.instaFollowers}
                onChange={handleInputChange}
                placeholder="Enter Instagram Followers"
                className="bg-background border-none"
              />
            </div>
            <div className="space-y-2">
              <Label>
                {StringConstants.SUBSCRIBERS}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                name="youtubeSubscribers"
                type="number"
                value={formData.youtubeSubscribers}
                onChange={handleInputChange}
                placeholder="Enter YouTube Subscribers"
                className="bg-background border-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{StringConstants.ABOUT_THE_PAGE}<span className="text-red-500">*</span>
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Briefly describe your page"
              className="bg-background border-none min-h-[30px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-muted bg-transparent border-gray-600 hover:bg-background"
          >
            {StringConstants.CANCEL}
          </Button>

          <Button className="text-white" onClick={handleSubmit}>
            {StringConstants.CREATE}
          </Button>
        </div>
      </DialogContent>
    )
  );
}
