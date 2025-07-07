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
    <div className="flex items-center justify-center w-full py-4">
      {[...Array(totalSteps)].map((_, idx) => (
        <div key={idx} className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 text-base font-bold z-10
              ${idx + 1 <= currentStep ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-400'}`}
          >
            {idx + 1}
          </div>
          {idx < totalSteps - 1 && (
            <div className="w-12 sm:w-20 h-0 border-t-2 border-dashed mx-1 sm:mx-2 transition-colors duration-300"
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
        return formData.name.trim() !== "";
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

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guild Name */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="guild-name">Choose a name that represents your expertise and community</Label>
                <Input
                  id="guild-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Dummy Guild 2"
                  className="bg-white border border-gray-200 h-11 text-base"
                />
              </div>
              {/* Years of Experience */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="experience">Enter the years of experience that you have gained as an expert</Label>
                <Select
                  value={formData.experience}
                  onValueChange={val => setFormData({ ...formData, experience: val })}
                >
                  <SelectTrigger className="bg-white border border-gray-200 h-11 text-base">
                    <SelectValue placeholder="Years of Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Sessions Conducted */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="sessions">Enter total session that you conducted</Label>
                <Input
                  id="sessions"
                  name="sessionsConducted"
                  value={formData.sessionsConducted}
                  onChange={handleInputChange}
                  placeholder="Sessions conducted"
                  className="bg-white border border-gray-200 h-11 text-base"
                  type="number"
                  min={0}
                />
              </div>
              {/* Preferred Languages */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="languages">Select the preferred languages that you know</Label>
                <Select
                  value={formData.languages[0] || ""}
                  onValueChange={val => {
                    if (!formData.languages.includes(val as string)) {
                      setFormData({ ...formData, languages: [...formData.languages, val as string] });
                    }
                  }}
                >
                  <SelectTrigger className="bg-white border border-gray-200 h-11 text-base">
                    <SelectValue placeholder="Select languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Show selected languages as chips */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.languages.map(lang => (
                    <span key={lang} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      {lang}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) })}
                        className="hover:text-primary/70"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Expertise Category Selection */}
            <div className="mt-4">
              <Label className="mb-2 block">Select your expertise</Label>
              <span className="block text-xs text-muted-foreground mb-2">Choose the category that best describes your Guild</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category: Category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => setCategoryId(category._id)}
                    className={`w-full p-3 rounded-md border transition-all duration-200 min-h-[40px] text-left font-medium text-base ${
                      categoryId === category._id
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 active:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Professional Profile</h2>
              <span className="text-primary font-semibold text-sm">Step 2/7</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col gap-2 items-center md:items-start">
                <Label>Upload a picture</Label>
                <span className="text-xs text-muted-foreground mb-1">Choose the profile picture</span>
                <label className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center cursor-pointer bg-gray-50">
                  {formData.profilePicture ? (
                    <Image src={typeof formData.profilePicture === 'string' ? formData.profilePicture : URL.createObjectURL(formData.profilePicture)} alt="Profile" width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, profilePicture: e.target.files[0] });
                      }
                    }}
                  />
                </label>
              </div>
              {/* Professional Title & Quote */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Enter professional title that represents your expertise and community</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Consultant Psychologist"
                  className="bg-white border border-gray-200 h-11 text-base"
                />
                <Label htmlFor="quote" className="mt-2">Enter a quote people can read on my profile</Label>
                <Input
                  id="quote"
                  name="quote"
                  value={formData.quote}
                  onChange={handleInputChange}
                  placeholder="Enter Quote"
                  className="bg-white border border-gray-200 h-11 text-base"
                />
              </div>
              {/* Intro Video Upload */}
              <div className="flex flex-col gap-2 items-center md:items-start">
                <Label>Introduction Video</Label>
                <span className="text-xs text-muted-foreground mb-1">Upload introduction video that represents your expertise and community</span>
                <label className="relative w-48 h-28 rounded-lg overflow-hidden border-2 border-primary flex items-center justify-center cursor-pointer bg-gray-50">
                  {formData.introVideo ? (
                    <video controls className="object-cover w-full h-full">
                      <source src={typeof formData.introVideo === 'string' ? formData.introVideo : URL.createObjectURL(formData.introVideo)} />
                    </video>
                  ) : (
                    <Video className="w-10 h-10 text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFormData({ ...formData, introVideo: e.target.files[0] });
                      }
                    }}
                  />
                </label>
              </div>
              {/* Social Media Links */}
              <div className="flex flex-col gap-2">
                <Label>Social media links</Label>
                <span className="text-xs text-muted-foreground mb-1">Attach your social platform to showcase your expertise</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-5 h-5 text-[#1877F3]" />
                    <Input
                      value={formData.socialLinks.facebook}
                      onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                      placeholder="www.facebook.com/profilelink"
                      className="flex-1 bg-white border border-gray-200 h-10 text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-[#E4405F]" />
                    <Input
                      value={formData.socialLinks.instagram}
                      onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                      placeholder="Enter link"
                      className="flex-1 bg-white border border-gray-200 h-10 text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-[#FF0000]" />
                    <Input
                      value={formData.socialLinks.tiktok}
                      onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, tiktok: e.target.value } })}
                      placeholder="Enter link"
                      className="flex-1 bg-white border border-gray-200 h-10 text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.socialLinks.other}
                      onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, other: e.target.value } })}
                      placeholder="Enter link"
                      className="flex-1 bg-white border border-gray-200 h-10 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">About me</h2>
              <span className="text-primary font-semibold text-sm">Step 3/7</span>
            </div>
            {/* Tags input */}
            <div className="mb-2">
              <Label htmlFor="tags">Tags for area of expertise</Label>
              <span className="block text-xs text-muted-foreground mb-1">Type tags and press Enter to help users find your Guild</span>
              <Input
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="e.g. Parenting"
                className="bg-white border border-gray-200 h-11 text-base"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary/70"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {/* Bio textarea */}
            <div className="mb-2">
              <Label htmlFor="bio">Short bio about me</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="e.g., Weekly mindfulness tips & guided meditations to reduce stress."
                className="bg-white border border-gray-200 min-h-[80px] text-base"
              />
            </div>
            {/* FAQ dynamic add/remove */}
            <div>
              <Label>Add FAQs</Label>
              <span className="block text-xs text-muted-foreground mb-1">Some questions they answer</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-white">
                    <Input
                      value={faq.question}
                      onChange={e => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[idx].question = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Enter Question"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <Input
                      value={faq.answer}
                      onChange={e => {
                        const newFaqs = [...formData.faqs];
                        newFaqs[idx].answer = e.target.value;
                        setFormData({ ...formData, faqs: newFaqs });
                      }}
                      placeholder="Enter answer"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== idx) })}
                      className="text-xs text-red-500 hover:underline self-end"
                      disabled={formData.faqs.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, faqs: [...formData.faqs, { question: "", answer: "" }] })}
                className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90"
              >
                + Add new
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Reviews & Achievements</h2>
              <span className="text-primary font-semibold text-sm">Step 4/7</span>
            </div>
            {/* Education */}
            <div className="mb-2">
              <Label>Add Education</Label>
              <span className="block text-xs text-muted-foreground mb-1">Add your education so learners can view</span>
              <div className="flex flex-wrap gap-3">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-white min-w-[220px]">
                    <Input
                      value={edu.school || ''}
                      onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[idx].school = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                      placeholder="School/University"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <Input
                      value={edu.duration || ''}
                      onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[idx].duration = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                      placeholder="Duration (e.g. 2017-2021)"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <Input
                      value={edu.degree || ''}
                      onChange={e => {
                        const newEdu = [...formData.education];
                        newEdu[idx].degree = e.target.value;
                        setFormData({ ...formData, education: newEdu });
                      }}
                      placeholder="Degree/Standard"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, education: formData.education.filter((_, i) => i !== idx) })}
                      className="text-xs text-red-500 hover:underline self-end"
                      disabled={formData.education.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, education: [...formData.education, { school: '', duration: '', degree: '' }] })}
                className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90"
              >
                + Add new
              </button>
            </div>
            {/* Experience */}
            <div className="mb-2">
              <Label>Add Experience</Label>
              <span className="block text-xs text-muted-foreground mb-1">Add your experience so learners can view</span>
              <div className="flex flex-wrap gap-3">
                {formData.workExperience.map((exp, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-white min-w-[220px]">
                    <Input
                      value={exp.title || ''}
                      onChange={e => {
                        const newExp = [...formData.workExperience];
                        newExp[idx].title = e.target.value;
                        setFormData({ ...formData, workExperience: newExp });
                      }}
                      placeholder="Job Title"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <Input
                      value={exp.duration || ''}
                      onChange={e => {
                        const newExp = [...formData.workExperience];
                        newExp[idx].duration = e.target.value;
                        setFormData({ ...formData, workExperience: newExp });
                      }}
                      placeholder="Duration (e.g. 2017-2021)"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, workExperience: formData.workExperience.filter((_, i) => i !== idx) })}
                      className="text-xs text-red-500 hover:underline self-end"
                      disabled={formData.workExperience.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, workExperience: [...formData.workExperience, { title: '', duration: '' }] })}
                className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90"
              >
                + Add new
              </button>
            </div>
            {/* Certificates */}
            <div className="mb-2">
              <Label>Add Certificates</Label>
              <span className="block text-xs text-muted-foreground mb-1">Add your certificates so learners can view</span>
              <div className="flex flex-wrap gap-3">
                {formData.certificates.map((cert, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-white min-w-[180px] items-center">
                    {cert.file ? (
                      <Image src={typeof cert.file === 'string' ? cert.file : URL.createObjectURL(cert.file)} alt="Certificate" width={96} height={64} className="w-24 h-16 object-cover rounded mb-2" />
                    ) : (
                      <span className="w-24 h-16 flex items-center justify-center bg-gray-100 rounded mb-2 text-xs text-gray-400">No file</span>
                    )}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          const newCerts = [...formData.certificates];
                          newCerts[idx].file = e.target.files[0];
                          setFormData({ ...formData, certificates: newCerts });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, certificates: formData.certificates.filter((_, i) => i !== idx) })}
                      className="text-xs text-red-500 hover:underline self-end"
                      disabled={formData.certificates.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, certificates: [...formData.certificates, { file: null }] })}
                className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90"
              >
                + Add new
              </button>
            </div>
            {/* Awards */}
            <div className="mb-2">
              <Label>Add Awards</Label>
              <span className="block text-xs text-muted-foreground mb-1">Add your awards so learners can view</span>
              <div className="flex flex-wrap gap-3">
                {formData.awards.map((award, idx) => (
                  <div key={idx} className="border rounded-lg p-3 flex flex-col gap-2 bg-white min-w-[180px]">
                    <Input
                      value={award.title || ''}
                      onChange={e => {
                        const newAwards = [...formData.awards];
                        newAwards[idx].title = e.target.value;
                        setFormData({ ...formData, awards: newAwards });
                      }}
                      placeholder="Award Title"
                      className="bg-white border border-gray-200 h-10 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, awards: formData.awards.filter((_, i) => i !== idx) })}
                      className="text-xs text-red-500 hover:underline self-end"
                      disabled={formData.awards.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, awards: [...formData.awards, { title: '' }] })}
                className="mt-3 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90"
              >
                + Add new
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Attach Calendar</h2>
              <span className="text-primary font-semibold text-sm">Step 5/7</span>
            </div>
            <div className="mb-4">
              <Label>Add your Calendar</Label>
              <span className="block text-xs text-muted-foreground mb-1">Add your calendar to schedule offerings</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'google', label: 'Google Calendar', desc: 'Google Calendar, Google', icon: <Image src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google" width={32} height={32} className="w-8 h-8" /> },
                { key: 'office', label: 'Office 365', desc: 'Microsoft', icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_Office_2013_logo.svg" alt="Office" width={32} height={32} className="w-8 h-8" /> },
                { key: 'outlook', label: 'Outlook Calendar', desc: 'Outlook', icon: <Image src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Microsoft_Office_Outlook_%282018–present%29.svg" alt="Outlook" width={32} height={32} className="w-8 h-8" /> },
              ].map(provider => (
                <div key={provider.key} className={`border rounded-lg p-5 flex flex-col items-center gap-2 bg-white shadow-sm ${formData.calendar === provider.key ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}`}>
                  {provider.icon}
                  <div className="font-semibold text-base mt-2">{provider.label}</div>
                  <div className="text-xs text-muted-foreground mb-2">{provider.desc}</div>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 rounded border text-sm font-medium transition-colors ${formData.calendar === provider.key ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary hover:bg-primary/10'}`}
                    onClick={() => setFormData({ ...formData, calendar: provider.key })}
                  >
                    {formData.calendar === provider.key ? 'Connected' : 'Connect Calendar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Create first offering</h2>
              <span className="text-primary font-semibold text-sm">Step 6/7</span>
            </div>
            <div className="mb-4">
              <Label>Publish Your Offerings</Label>
              <span className="block text-xs text-muted-foreground mb-1">Create your offering and start earning.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Offering Title */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="offeringTitle">Enter offering title<span className="text-red-500">*</span></Label>
                <Input
                  id="offeringTitle"
                  name="offeringTitle"
                  value={formData.offeringTitle}
                  onChange={handleInputChange}
                  placeholder="Offering title goes here"
                  className="bg-white border border-gray-200 h-11 text-base"
                />
              </div>
              {/* Offering Type */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="offeringType">Select offering type<span className="text-red-500">*</span></Label>
                <Select
                  value={formData.offeringType}
                  onValueChange={val => setFormData({ ...formData, offeringType: val })}
                >
                  <SelectTrigger className="bg-white border border-gray-200 h-11 text-base">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="package">Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Description */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <Label htmlFor="offeringDescription">Description<span className="text-red-500">*</span></Label>
                <Textarea
                  id="offeringDescription"
                  name="offeringDescription"
                  value={formData.offeringDescription}
                  onChange={handleInputChange}
                  placeholder="In this offering we will discuss about..."
                  className="bg-white border border-gray-200 min-h-[80px] text-base"
                />
              </div>
              {/* Price */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="offeringPrice">Price (INR)<span className="text-red-500">*</span></Label>
                <Input
                  id="offeringPrice"
                  name="offeringPrice"
                  value={formData.offeringPrice}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  className="bg-white border border-gray-200 h-11 text-base"
                  type="number"
                  min={0}
                />
                <span className="text-xs text-muted-foreground">(10% platform fee + taxes, no hidden charges.)</span>
              </div>
              {/* Duration */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="offeringDuration">Duration (Mins)<span className="text-red-500">*</span></Label>
                <Input
                  id="offeringDuration"
                  name="offeringDuration"
                  value={formData.offeringDuration}
                  onChange={handleInputChange}
                  placeholder="Enter duration"
                  className="bg-white border border-gray-200 h-11 text-base"
                  type="number"
                  min={1}
                />
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-2">
              <h2 className="text-2xl font-bold mb-2 sm:mb-0">Link bank account</h2>
              <span className="text-primary font-semibold text-sm">Step 7/7</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Holder Name */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="accountHolder">Account holder's name<span className="text-red-500">*</span></Label>
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  placeholder="e.g. Kathan Bhavsar"
                  className="bg-white border border-gray-200 h-11 text-base"
                />
              </div>
              {/* Account Number */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="accountNumber">Account number<span className="text-red-500">*</span></Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  className="bg-white border border-gray-200 h-11 text-base"
                  type="text"
                />
              </div>
              {/* IFSC Code */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <Label htmlFor="ifsc">IFSC Code<span className="text-red-500">*</span></Label>
                <Input
                  id="ifsc"
                  name="ifsc"
                  value={formData.ifsc}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC Code"
                  className="bg-white border border-gray-200 h-11 text-base"
                  type="text"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    session && (
      <div className="w-full max-w-3xl rounded-2xl shadow-none flex flex-col items-center justify-center min-h-[70vh] bg-white mx-auto px-2 sm:px-8 py-8 sm:py-12">
        <div className="w-full flex flex-col items-center justify-center">
           <div className="w-full flex justify-between items-center px-0 sm:px-6 pb-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">{stepTitles[currentStep - 1]}</h2>
            <span className="text-primary font-semibold text-sm min-w-fit">Step {currentStep}/{totalSteps}</span>
          </div>
          <Stepper currentStep={currentStep} totalSteps={totalSteps} />
        </div>
        {/* Step content - fixed height, scrollable if overflow */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="w-full h-full flex flex-col justify-center rounded-xl shadow-none">
            {renderStepContent()}
          </div>
        </div>
        {/* Navigation buttons */}
        <div className="w-full flex flex-row flex-wrap justify-between gap-4 pt-4 border-t border-gray-100 flex-shrink-0 px-0 sm:px-6 pb-0 sm:pb-6 bg-white">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : prevStep}
            className="flex-1 min-w-[120px] text-muted bg-transparent border-gray-300 hover:bg-gray-50 h-12 text-base font-semibold"
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
            disabled={!isStepValid(currentStep)}
            className="flex-1 min-w-[120px] text-white bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
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
            className="flex-1 min-w-[120px] text-muted-foreground bg-transparent border-none h-12 text-base font-semibold"
          >
            Skip for now
          </Button>
        </div>
      </div>
    )
  );
}
