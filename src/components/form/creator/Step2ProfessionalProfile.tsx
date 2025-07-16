import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Video, Facebook, Instagram, Youtube, X as XIcon, User, Quote } from "lucide-react";
import Image from "next/image";

interface Step2ProfessionalProfileProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function Step2ProfessionalProfile({ formData, setFormData }: Step2ProfessionalProfileProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-2 sm:p-6 font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col gap-2 items-center md:items-start">
          <Label className="font-semibold text-sm md:text-base">Upload a picture</Label>
          <span className="text-xs text-muted-foreground mb-1">Choose the profile picture</span>
          <label className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center cursor-pointer bg-gray-50">
            {formData.profilePicture ? (
              <Image src={typeof formData.profilePicture === 'string' ? formData.profilePicture : URL.createObjectURL(formData.profilePicture)} alt="Profile" width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <Camera className="w-4 h-4 text-gray-400" />
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
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="title" className="font-normal text-[12px] md:text-sm">Enter professional title that represents your expertise and community</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </span>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Consultant Psychologist"
              className="bg-white border border-gray-200 h-9 text-base pl-10 font-poppins"
            />
          </div>
          <Label htmlFor="quote" className="font-normal text-[12px] md:text-sm mt-2">Enter a quote people can read on my profile</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Quote className="w-5 h-5" />
            </span>
            <Input
              id="quote"
              name="quote"
              value={formData.quote}
              onChange={e => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Enter Quote"
              className="bg-white border border-gray-200 h-9 text-base pl-10 font-poppins"
            />
          </div>
        </div>
      </div>
      {/* Introduction Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        <div className="flex flex-col gap-2">
          <Label className="font-semibold text-sm md:text-[20px]">Introduction Video</Label>
          <span className="text-xs text-muted-foreground mb-1">Upload introduction video that represents your expertise and community</span>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <label className="relative w-44 h-20 rounded-lg overflow-hidden border-2 border-primary flex items-center justify-center cursor-pointer bg-gray-50">
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
      </div>
      {/* Social Media Links */}
      <div className="flex flex-col gap-2 mt-2">
        <Label className="font-normal text-sm md:text-base">Social media links</Label>
        <span className="text-xs text-muted-foreground mb-1">Attach your social platform to showcase your expertise</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1877F3]">
              <Facebook className="w-5 h-5" />
            </span>
            <Input
              value={formData.socialLinks.facebook}
              onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
              placeholder="www.facebook.com/profilelink"
              className="flex-1 bg-white border border-gray-200 h-11 text-base pl-10 font-poppins"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E4405F]">
              <Instagram className="w-5 h-5" />
            </span>
            <Input
              value={formData.socialLinks.instagram}
              onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
              placeholder="Enter link"
              className="flex-1 bg-white border border-gray-200 h-11 text-base pl-10 font-poppins"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#000]">
              <Youtube className="w-5 h-5" />
            </span>
            <Input
              value={formData.socialLinks.tiktok}
              onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, tiktok: e.target.value } })}
              placeholder="Enter link"
              className="flex-1 bg-white border border-gray-200 h-11 text-base pl-10 font-poppins"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <XIcon className="w-5 h-5" />
            </span>
            <Input
              value={formData.socialLinks.other}
              onChange={e => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, other: e.target.value } })}
              placeholder="Enter link"
              className="flex-1 bg-white border border-gray-200 h-11 text-base pl-10 font-poppins"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 