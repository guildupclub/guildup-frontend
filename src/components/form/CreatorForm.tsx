"use client";

import { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, X, Check, Camera, Video, Facebook, Instagram, Youtube } from "lucide-react";
import { setLoading } from "@/redux/memberSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import debounce from "lodash/debounce";
import Image from "next/image";
import Step1GuildDetails from "@/components/form/creator/Step1GuildDetails";
import Step2ProfessionalProfile from "@/components/form/creator/Step2ProfessionalProfile";
import Step3AboutMe from "@/components/form/creator/Step3AboutMe";
import Step4ReviewsAchievements from "@/components/form/creator/Step4ReviewsAchievements";
import Step5AttachCalendar from "@/components/form/creator/Step5AttachCalendar";

interface CreatorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  _id: string;
  name: string;
}

interface EducationType { school: string; duration: string; degree: string; }
interface WorkExperienceType { title: string; duration: string; }
interface CertificateType { file: File | string | null; }
interface AwardType { title: string; }
interface FormDataType {
  name: string;
  description: string;
  experience: string;
  sessionsConducted: string;
  languages: string[];
  expertise: string;
  profilePicture: File | string | null;
  title: string;
  quote: string;
  introVideo: File | string | null;
  socialLinks: { facebook: string; instagram: string; tiktok: string; other: string };
  tags: string[];
  bio: string;
  faqs: { question: string; answer: string }[];
  education: EducationType[];
  workExperience: WorkExperienceType[];
  certificates: CertificateType[];
  awards: AwardType[];
  calendar: string;
  offeringTitle: string;
  offeringType: string;
  offeringDescription: string;
  offeringPrice: string;
  offeringDuration: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  instaFollowers: string;
  youtubeSubscribers: string;
  phoneNumber: string;
  countryCode: string;
}

// Add country codes data
const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
];

const languageOptions = [
  "English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese"
];
const experienceOptions = [
  "<1 Year", "1-2 Years", "3-5 Years", "6-10 Years", "10+ Years"
];

const stepTitles = [
  "Guild details",
  "Professional Profile",
  "About me",
  "Reviews & Achievements",
  "Attach Calendar",
  "Create first offering",
  "Link bank account"
];

function Stepper({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center w-full py-2">
      {[...Array(totalSteps)].map((_, idx) => (
        <div key={idx} className="flex items-center">
          <div
            className={`w-4 md:w-6 h-4 md:h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 text-[12px] sm:text-sm  md:text-base font-bold z-10
              ${idx + 1 <= currentStep ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}
          >
            {idx + 1}
          </div>
          {idx < totalSteps - 1 && (
            <div className="w-6 sm:w-8 md:w-20 h-0 border-t-2 border-dashed mx-1 sm:mx-2 transition-colors duration-300"
              style={{ borderColor: idx + 1 < currentStep ? '#2563eb' : '#d1d5db' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreatorForm({ onClose }: CreatorFormProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const { data: session } = useSession();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    experience: "",
    sessionsConducted: "",
    languages: [],
    expertise: "",
    profilePicture: null,
    title: "",
    quote: "",
    introVideo: null,
    socialLinks: { facebook: "", instagram: "", tiktok: "", other: "" },
    tags: [],
    bio: "",
    faqs: [{ question: "", answer: "" }],
    education: [{ school: '', duration: '', degree: '' }],
    workExperience: [{ title: '', duration: '' }],
    certificates: [{ file: null }],
    awards: [{ title: '' }],
    calendar: "",
    offeringTitle: "",
    offeringType: "",
    offeringDescription: "",
    offeringPrice: "",
    offeringDuration: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    instaFollowers: "",
    youtubeSubscribers: "",
    phoneNumber: "",
    countryCode: "+91",
  });
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);

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


  const { refetch: checkNameAvailability } = useQuery({
    queryKey: ["checkGuildName", formData.name],
    queryFn: async () => {
      if (!formData.name.trim()) return null;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/community/check-name?name=${encodeURIComponent(formData.name.trim())}`
      );
      if (!response.ok) throw new Error("Failed to check name availability");
      const data = await response.json();
      return data.data.available;
    },
    enabled: false, 
  });

  // Debounced name check
  const debouncedNameCheck = debounce(async (name: string) => {
    if (!name.trim()) {
      setIsNameAvailable(null);
      return;
    }
    setIsCheckingName(true);
    try {
      const { data } = await checkNameAvailability();
      setIsNameAvailable(data);
    } catch (error) {
      console.error("Error checking name availability:", error);
      setIsNameAvailable(null);
    } finally {
      setIsCheckingName(false);
    }
  }, 500);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check name availability when name field changes
    if (name === "name") {
      debouncedNameCheck(value);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryData: Category) => {
    setCategoryId(categoryData._id);
  };

  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);

    // Check if the last character is a space or comma
    if (value.endsWith(' ') || value.endsWith(',')) {
      const tag = value.slice(0, -1).trim(); // Remove the space/comma and trim
      if (tag && !formData.tags.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag],
        });
        setTagInput(''); // Clear the input
      }
    }
  };

  // Handle tag input on Enter
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim();
      if (!formData.tags.includes(tag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tag],
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

  // Update step validation
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formData.name.trim() !== "" &&
          formData.experience.trim() !== "" &&
          formData.sessionsConducted.trim() !== "" &&
          formData.languages.length > 0 &&
          categoryId !== ""
        );
      case 2:
        return formData.title.trim() !== "";
      case 3:
        return formData.tags.length > 0;
      case 4:
        return true; // Education/experience/certificates/awards optional for now
      case 5:
        return true; // Calendar optional for now
      case 6:
        return formData.offeringTitle.trim() !== "" && formData.offeringType.trim() !== "";
      case 7:
        return formData.accountHolder.trim() !== "" && formData.accountNumber.trim() !== "" && formData.ifsc.trim() !== "";
      default:
        return false;
    }
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep < totalSteps) {
      toast.error("Please complete this step before continuing.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
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
            phone_number: `${formData.countryCode}${formData.phoneNumber}`, 
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
        experience: "",
        sessionsConducted: "",
        languages: [],
        expertise: "",
        profilePicture: null,
        title: "",
        quote: "",
        introVideo: null,
        socialLinks: { facebook: "", instagram: "", tiktok: "", other: "" },
        tags: [],
        bio: "",
        faqs: [{ question: "", answer: "" }],
        education: [{ school: '', duration: '', degree: '' }],
        workExperience: [{ title: '', duration: '' }],
        certificates: [{ file: null }],
        awards: [{ title: '' }],
        calendar: "",
        offeringTitle: "",
        offeringType: "",
        offeringDescription: "",
        offeringPrice: "",
        offeringDuration: "",
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
        instaFollowers: "",
        youtubeSubscribers: "",
        phoneNumber: "",
        countryCode: "+91",
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
    if (!isStepValid(7)) {
      toast.error("Please complete all required fields.");
      return;
    }    
    createCommunity.mutate();
    onClose();
    setCurrentStep(1);
  };

  return (
    session && (
      <div className="w-full min-h-screen max-w-4xl rounded-2xl shadow-none flex flex-col items-center justify-center bg-white mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-7 md:py-9">
        <div className="w-full flex flex-col items-center justify-center sticky top-0 z-10 bg-white pt-2 pb-2 sm:pb-4">
          <div className="w-full flex flex-row justify-between items-center px-2 sm:px-4 md:px-6 pb-2 ">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-poppins text-black text-center sm:text-left w-auto sm:w-auto">{stepTitles[currentStep - 1]}</h2>
            <span className="text-primary font-semibold text-xs sm:text-sm min-w-fit">Step {currentStep}/{totalSteps}</span>
          </div>
          <Stepper currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        {/* Step content - fixed height, scrollable if overflow */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col justify-center rounded-xl shadow-none font-poppins">
            {currentStep === 1 && (
              <Step1GuildDetails
                formData={formData}
                setFormData={setFormData}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                categories={categories}
                isCategoriesLoading={isCategoriesLoading}
              />
            )}
            {currentStep === 2 && (
              <Step2ProfessionalProfile
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {currentStep === 3 && (
              <Step3AboutMe
                formData={formData}
                setFormData={setFormData}
                tagInput={tagInput}
                setTagInput={setTagInput}
                removeTag={removeTag}
                handleTagInputChange={handleTagInputChange}
                handleTagInputKeyDown={handleTagInputKeyDown}
              />
            )}
            {currentStep === 4 && (
              <Step4ReviewsAchievements
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {currentStep === 5 && (
              <Step5AttachCalendar
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {/* Future: Add other steps here as <Step6CreateOffering ... /> etc. */}
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-col sm:flex-row flex-wrap justify-between gap-2 sm:gap-4 pt-4 border-t border-gray-100 flex-shrink-0 px-0 sm:px-4 md:px-6 pb-0 sm:pb-6 bg-white">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : prevStep}
            className="flex-1 min-w-[100px] sm:min-w-[120px] text-muted bg-transparent border-gray-300 hover:bg-gray-50 h-12 text-base font-semibold"
          >
            {currentStep === 1 ? (
              StringConstants.CANCEL
            ) : (
              <>
                <ChevronLeft size={18} className="mr-1" />
                Back
              </>
            )}
          </Button>
          <Button
            onClick={currentStep === totalSteps ? handleSubmit : nextStep}
            // disabled={!isStepValid(currentStep)}
            className="flex-1 min-w-[100px] sm:min-w-[120px] text-white bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
          >
            {currentStep === totalSteps ? "Setup Profile" : (
              <>
                Next
                <ChevronRight size={18} className="ml-1" />
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={skipStep}
            className="flex-1 min-w-[100px] sm:min-w-[120px] text-muted-foreground bg-transparent border-none h-12 text-base font-semibold"
          >
            Skip for now
          </Button>
        </div>
      </div>
    )
  );
}
