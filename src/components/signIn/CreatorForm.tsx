"use client";

// Add Loader to imports
import Loader from "@/components/Loader";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
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
import { useSession } from "next-auth/react";
import { StringConstants } from "../common/CommonText";
import { useRouter } from "next/navigation";
import { setActiveCommunity } from "@/redux/channelSlice";
import { setCommunityData } from "@/redux/communitySlice";

interface Category {
  _id: string;
  name: string;
}

interface FormProps {
  onSuccess?: () => void;
}

export default function CreatorForm({onSuccess}: FormProps) {
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    instaFollowers: "",
    youtubeSubscribers: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [additionalTags] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // Mutation for creating community
  const createCommunity = useMutation({
    mutationFn: async () => {
      setIsRedirecting(true); // Start loading
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
      if (!response.ok) {
        setIsRedirecting(false); // Stop loading on error
        throw new Error(data.e || "Failed to create community");
      }
      return data;
    },
    onSuccess: async (data) => {
      const newCommunity = data.data;
      toast.success("Community created successfully! 🎉");
      
      // Update Redux state with the new community
      dispatch(
        setActiveCommunity({
          id: newCommunity._id,
          name: newCommunity.name,
          image: newCommunity.image,
          background_image: newCommunity.background_image,
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false
        })
      );

      dispatch(
        setCommunityData({
          communityId: newCommunity._id,
          userId: userId,
        })
      );

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["communities"] });
      await queryClient.invalidateQueries({ queryKey: ["userCommunities"] });

      // Reset form
      setFormData({
        name: "",
        description: "",
        tags: "",
        instaFollowers: "",
        youtubeSubscribers: "",
      });
      setCategoryId("");
      
      // Call success callback
      onSuccess?.();

      // Redirect to the new community's profile page
      await router.push(`/community/${newCommunity._id}/profile`);
      setIsRedirecting(false); // Stop loading after redirect
    },
    onError: (error: any) => {
      setIsRedirecting(false); // Stop loading on error
      toast.error(`Failed to create community: ${error.message}`);
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
    <>
      {isRedirecting && <Loader />}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col justify-start items-center pb-4">
          <h2 className="text-xl font-semibold font-serif">Let&apos;s Build your Guild!</h2>
          <p className="text-sm text-muted-foreground">
            A Guild is your digital home for sharing expertise, building community, and earning money.
          </p>
        </div>

        <div className="space-y-5 ">
          <div className="space-y-2">
            <Label>
              Name your Guild&nbsp;<span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Mindfulness with Shivani"
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
                <SelectValue placeholder="Area of expertise?" />
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
              Keywords&nbsp;
              <span className="text-red-500">*</span>
            </Label>
            <span>&nbsp;(comma-separated)</span>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter keywords to help users find your Guild"
              className="bg-background border-none"
            />
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
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
          </div> */}

          <div className="space-y-2">
            <Label>{StringConstants.ABOUT_THE_PAGE}&nbsp;<span className="text-red-500">*</span>
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Weekly mindfulness tips & guided meditations to reduce stress."
              className="bg-background border-none min-h-[30px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4 w-full">
          <Button className="text-white w-full" onClick={handleSubmit}>
            {StringConstants.CREATE}
          </Button>
        </div>
      </div>
    </>
  );
}
