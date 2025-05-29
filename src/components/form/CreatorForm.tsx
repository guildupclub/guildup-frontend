"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { StringConstants } from "../common/CommonText";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { setActiveCommunity } from "@/redux/channelSlice";
import { setCommunityData } from "@/redux/communitySlice";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { setLoading } from "@/redux/memberSlice";

interface CreatorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  _id: string;
  name: string;
}

export default function CreatorForm({ onClose, onSuccess }: CreatorFormProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const { data: session } = useSession();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    instaFollowers: "",
    youtubeSubscribers: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Handle category selection
  const handleCategorySelect = (categoryData: Category) => {
    setCategoryId(categoryData._id);
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Handle tag input on Enter
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Step validation
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return categoryId !== "";
      case 3:
        return formData.tags.length > 0;
      case 4:
        return formData.description.trim() !== "";
      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep < 4) {
      toast.error("Please complete this step before continuing.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
            additional_tags: formData.tags,
            category_id: categoryId,
            instagram_followers: formData.instaFollowers,
            youtube_followers: formData.youtubeSubscribers,
            is_locked: false,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data || data.r !== "s" || !data.data) {
        throw new Error(data?.e || data?.message || "Failed to create community");
      }

      return data;
    },
    onSuccess: async (data) => {
      const newCommunity = data.data;
      
      if (!newCommunity || !newCommunity._id) {
        toast.error("Its not you, its us. Please try again later.");
        return;
      }
      
      toast.success("Community created successfully! 🎉");
      
      // Update Redux state
      dispatch(
        setActiveCommunity({
          id: newCommunity._id,
          name: newCommunity.name,
          image: newCommunity.image,
          background_image: newCommunity.background_image,
          user_isBankDetailsAdded: false,
          user_iscalendarConnected: false,
        })
      );
      dispatch(
        setCommunityData({
          communityId: newCommunity._id,
          userId: userId,
        })
      );
      
      // Clean up form state
      setFormData({
        name: "",
        description: "",
        tags: [],
        instaFollowers: "",
        youtubeSubscribers: "",
      });
      setCategoryId("");
      
      // Handle async operations
      await queryClient.invalidateQueries({ queryKey: ["communities"] });
      await queryClient.invalidateQueries({ queryKey: ["userCommunities"] });
      await router.push(`/community/${newCommunity.name}-${newCommunity._id}/profile`);
    },
    onError: (error: any) => {
      console.error("Community creation error:", error);
      toast.error(error.message || "Failed to create community");
    },
  });

  // Handle submit action
  const handleSubmit = () => {
    if (!isStepValid(4)) {
      toast.error("Please complete all required fields.");
      return;
    }    
    createCommunity.mutate();
    onClose();
    setCurrentStep(1);
  };

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="h-full flex flex-col space-y-3 p-3 sm:p-2">
            <div className="text-center">
              <div className="text-xs text-primary mb-1 font-medium">Step 1 of 4</div>
              <h3 className="text-base font-semibold mb-1">What's your Guild name?</h3>
              <p className="text-xs text-muted-foreground px-2 opacity-75">
                Choose a name that represents your expertise and community
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">
                Guild Name&nbsp;<span className="text-red-500">*</span>
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Mindfulness with Shivani"
                className="bg-white border-lg text-base h-9 sm:h-10"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="h-full flex flex-col p-3 sm:p-2">
            <div className="text-center flex-shrink-0 mb-2">
              <div className="text-xs text-primary mb-1 font-medium">Step 2 of 4</div>
              <h3 className="text-base font-semibold mb-1">Select your expertise</h3>
              <p className="text-xs text-muted-foreground px-2 opacity-75">
                Choose the category that best describes your Guild
              </p>
            </div>
            <div className="flex-1 overflow-y-scroll scrollbar-hide">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1">
                {categories.map((category: Category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full p-2 h-auto text-left rounded-md border transition-all duration-200 min-h-[40px] touch-manipulation ${
                      categoryId === category._id
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 active:bg-gray-100"
                    }`}
                  >
                    <span className="text-xs font-medium leading-tight block">
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="h-full flex flex-col p-3 sm:p-2">
            <div className="text-center flex-shrink-0 mb-2">
              <div className="text-xs text-primary mb-1 font-medium">Step 3 of 4</div>
              <h3 className="text-base font-semibold mb-1">Add keywords</h3>
              <p className="text-xs text-muted-foreground px-2 opacity-75">
                Type keywords and press Enter to help users find your Guild
              </p>
            </div>
            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              <div className="flex-shrink-0">
                <Label className="text-sm block mb-1">
                  Keywords&nbsp;<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a keyword and press Enter"
                  className="bg-white border-gray-200 focus:border-primary h-9 sm:h-10"
                />
              </div>
              <div className="flex-1 min-h-[120px] overflow-y-auto">
                {formData.tags.length > 0 ? (
                  <>
                    <Label className="block mb-2 text-sm">Selected Keywords:</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs border border-primary/20"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary/70 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    Added keywords will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="h-full flex flex-col p-3 sm:p-2">
            <div className="text-center flex-shrink-0 mb-2">
              <div className="text-xs text-primary mb-1 font-medium">Step 4 of 4</div>
              <h3 className="text-base font-semibold mb-1">Describe your Guild</h3>
              <p className="text-xs text-muted-foreground px-2 opacity-75">
                Tell people what they can expect from your Guild
              </p>
            </div>
            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              <Label className="flex-shrink-0 text-sm">
                About your Guild&nbsp;<span className="text-red-500">*</span>
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Weekly mindfulness tips & guided meditations to reduce stress."
                className="bg-white border-gray-200 focus:border-primary flex-1 resize-none text-sm min-h-[80px] sm:min-h-[100px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    session && (
      <DialogContent className="w-[95vw] max-w-[450px] h-[600px] bg-card text-muted border-none flex flex-col">
        <DialogHeader className="flex items-center justify-between py-2 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-semibold font-serif">
            Let&apos;s Build your Guild!
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex space-x-2 mb-1 flex-shrink-0 px-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                step <= currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step content - Responsive height container */}
        <div className="flex-1 overflow-hidden min-h-0">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-row justify-between gap-2 pt-2 border-t border-gray-100 flex-shrink-0">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : prevStep}
            className="flex-1 text-muted bg-transparent border-gray-300 hover:bg-gray-50 h-7 text-sm"
          >
            {currentStep === 1 ? (
              StringConstants.CANCEL
            ) : (
              <>
                <ChevronLeft size={12} className="mr-1" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={currentStep === 4 ? handleSubmit : nextStep}
            disabled={!isStepValid(currentStep) || createCommunity.isPending}
            className="flex-1 text-white bg-primary hover:bg-primary/90 h-7 text-sm"
          >
            {currentStep === 4 ? (
              createCommunity.isPending ? "Creating..." : "Join as Expert"
            ) : (
              <>
                Next
                <ChevronRight size={12} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    )
  );
}
