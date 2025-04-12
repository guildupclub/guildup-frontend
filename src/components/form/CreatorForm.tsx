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
import { DialogDescription } from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Celebration } from "../common/Celebration";
import { useRouter } from "next/navigation";

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    instaFollowers: "",
    youtubeSubscribers: "",
  });
  const [categoryId, setCategoryId] = useState("");
  const [additionalTags] = useState([]);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
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

  // Handle category change
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value);
    setCategoryId(value);
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
    onSuccess: async (data) => {
      const newCommunity = data.data;
      toast.success("Community created successfully! 🎉");
      setShowCelebration(true);

      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setFormData({
        name: "",
        description: "",
        tags: "",
        instaFollowers: "",
        youtubeSubscribers: "",
      });
      setCategoryId("");
      setStep(1); // Reset step to 1
      onClose(); // Close the dialog
      await router.push(`/community/${newCommunity._id}/profile`);


      
      // Hide celebration after 4 seconds
      setTimeout(() => {
        setShowCelebration(false);
        onSuccess?.();
      }, 4000);
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

  const nextStep = () => {
    if (step === 1 && !formData.name) {
      toast.error("Please enter a guild name");
      return;
    }
    if (step === 2 && !categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (step === 3 && !formData.tags) {
      toast.error("Please enter at least one keyword");
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    session && (
      <>
        {showCelebration && <Celebration />}
        <DialogContent className="sm:max-w-[640px] h-[600px] bg-gradient-to-b from-white to-gray-50/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
          <div className="flex flex-col h-full">
            {/* Top Section with Progress */}
            <div className="relative mt-6 mb-8 px-1">
              {/* Step indicator */}
              <div className="absolute -top-8 right-0 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                Step {step} of {totalSteps}
              </div>
              
              {/* Premium Progress bar */}
              <div className="w-full h-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-600 to-purple-600"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                          Name your Guild
                        </Label>
                        <p className="text-gray-500">This will be your community's identity. Make it memorable!</p>
                      </div>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Mindfulness with Sarah"
                        className="text-lg py-6 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        autoFocus
                      />
                      <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-sm text-blue-600">
                          💡 Tip: Great guild names often combine your expertise with your personal brand
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                          Your Expertise
                        </Label>
                        <p className="text-gray-500">Choose the category that best represents your knowledge domain</p>
                      </div>

                      {/* Selected Category Tags */}
                      {categoryId && (
                        <div className="flex gap-2 flex-wrap">
                          {categories
                            .filter((cat: Category) => cat._id === categoryId)
                            .map((category: Category) => (
                              <div
                                key={category._id}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm"
                              >
                                <span>{category.name}</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCategoryId("");
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {/* Category Selection Grid */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {categories
                          .filter((category: Category) => !categoryId || category._id === categoryId)
                          .map((category: Category) => (
                            <button
                              key={category._id}
                              onClick={() => handleCategoryChange(category._id)}
                              className={`p-2 rounded-lg border transition-all duration-200 text-left group
                                ${categoryId === category._id 
                                  ? 'border-primary/50 bg-blue-50/50 shadow-sm' 
                                  : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50/50'
                                }`}
                            >
                              <span className={`text-sm font-medium whitespace-nowrap
                                ${categoryId === category._id 
                                  ? 'text-primary' 
                                  : 'text-gray-700'
                                }`}
                              >
                                {category.name}
                              </span>
                            </button>
                          ))}
                      </div>

                      {/* Tip Box */}
                      <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <p className="text-sm text-blue-600">
                          💡 Tip: Choose the category that best aligns with your core expertise
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                          Keywords
                        </Label>
                        <p className="text-gray-500">Help people discover your guild with relevant keywords</p>
                      </div>
                      <Input
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="e.g., yoga, wellness, meditation"
                        className="text-lg py-6 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <div className="flex gap-2 flex-wrap mt-2">
                        {formData.tags.split(',').map((tag, index) => (
                          tag.trim() && (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                              {tag.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                          Tell Your Story
                        </Label>
                        <p className="text-gray-500">Share what makes your guild unique and what members can expect</p>
                      </div>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your guild's mission, your expertise, and what members will gain..."
                        className="text-lg py-4 px-4 rounded-xl border border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 min-h-[200px]"
                        autoFocus
                      />
                      <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                        <p className="text-sm text-purple-600">
                          ✨ Pro tip: Mention your experience, teaching style, and the transformation members can expect
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={step === 1 ? onClose : prevStep}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-6 
                  hover:shadow-md transition-all duration-200"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={step === totalSteps ? handleSubmit : nextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 
                  hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 
                  hover:scale-[1.02]"
              >
                {step === totalSteps ? 'Launch Guild ✨' : 'Continue'}
                <motion.div
                  className="ml-2"
                  animate={{ x: step === totalSteps ? 0 : 5 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                >
                  {step === totalSteps ? '' : '→'}
                </motion.div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </>
    )
  );
}
