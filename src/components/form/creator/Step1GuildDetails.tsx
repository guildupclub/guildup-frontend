import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { User, Calendar, BookOpen, Languages } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Step1GuildDetailsProps {
  formData: any;
  setFormData: (data: any) => void;
  categoryId: string;
  setCategoryId: (id: string) => void;
  categories: Category[];
  isCategoriesLoading: boolean;
}

const experienceOptions = [
  "<1 Year", "1-2 Years", "3-5 Years", "6-10 Years", "10+ Years"
];
const languageOptions = [
  "English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese"
];

export default function Step1GuildDetails({
  formData,
  setFormData,
  categoryId,
  setCategoryId,
  categories,
  isCategoriesLoading,
}: Step1GuildDetailsProps) {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 p-2 sm:p-6 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Guild Name */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="guild-name" className="font-poppins font-normal text-sm md:text-sm">Choose a name that represents your expertise and community</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </span>
            <Input
              id="guild-name"
              name="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dummy Guild 2"
              className="bg-white border border-gray-200 h-11 text-base pl-10 font-poppins"
            />
          </div>
        </div>
        {/* Years of Experience */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="experience" className="font-poppins font-normal text-sm md:text-sm">Enter the years of experience that you have gained as an expert</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="w-5 h-5" />
            </span>
            <Select
              value={formData.experience}
              onValueChange={val => setFormData({ ...formData, experience: val })}
            >
              <SelectTrigger className="bg-white border border-gray-200 h-11 text-sm pl-10 font-poppins">
                <SelectValue placeholder="Years of Experience" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Sessions Conducted */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="sessions" className="font-poppins font-normal text-sm md:text-base">Enter total session that you conducted</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <Input
              id="sessions"
              name="sessionsConducted"
              value={formData.sessionsConducted}
              onChange={e => setFormData({ ...formData, sessionsConducted: e.target.value })}
              placeholder="Sessions conducted"
              className="bg-white border border-gray-200 h-11 text-sm pl-10 font-poppins"
              type="number"
              min={0}
            />
          </div>
        </div>
        {/* Preferred Languages */}
        <div className="flex flex-col gap-1">
          <Label htmlFor="languages" className="font-poppins font-normal text-sm md:text-base">Select the preferred languages that you know</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Languages className="w-5 h-5" />
            </span>
            <Select
              value={formData.languages[0] || ""}
              onValueChange={val => {
                if (!formData.languages.includes(val as string)) {
                  setFormData({ ...formData, languages: [...formData.languages, val as string] });
                }
              }}
            >
              <SelectTrigger className="bg-white border border-gray-200 h-9 text-sm pl-10 font-poppins">
                <SelectValue placeholder="Select languages" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Show selected languages as chips */}
          <div className="flex flex-wrap gap-2 mt-1">
            {formData.languages.map((lang: string) => (
              <span key={lang} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs flex items-center gap-1 font-poppins">
                {lang}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, languages: formData.languages.filter((l: string) => l !== lang) })}
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
      <div className="mt-2">
        <Label className="mb-2 block font-poppins font-semibold text-base md:text-lg">Select your expertise</Label>
        <span className="block text-xs text-muted-foreground mb-2 font-poppins">Choose the category that best describes your Guild</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {isCategoriesLoading ? (
            <div>Loading...</div>
          ) : (
            categories.map((category: Category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => setCategoryId(category._id)}
                className={`w-full p-2 rounded-md border transition-all duration-200 min-h-[25px] text-left font-medium text-sm font-poppins ${
                  categoryId === category._id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 active:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 