import React from "react";
import { Edit, Phone } from "lucide-react";
import { FaFacebook, FaLinkedinIn } from "react-icons/fa6";
import { GrInstagram } from "react-icons/gr";
import { ChatSupportButton } from "../chat/ChatSupportButton";

interface ProfileSectionLeftHeroProps {
  profile: any;
  isOwner: boolean;
  isFollowing: boolean;
  followMutation: any;
  setIsEditing: (v: boolean) => void;
  scrollToOfferings: () => void;
}

const DecorativeBurst = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.2">
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="32"
          y1="8"
          x2="32"
          y2="0"
          stroke="#3B82F6"
          strokeWidth="2"
          transform={`rotate(${i * 30} 32 32)`}
        />
      ))}
    </g>
  </svg>
);

export function ProfileSectionLeftHero({
  profile,
  isOwner,
  isFollowing,
  followMutation,
  setIsEditing,
  scrollToOfferings,
}: ProfileSectionLeftHeroProps) {
  return (
    <div className="relative bg-primary/5 rounded-2xl shadow-sm p-6 md:p-10 flex flex-col items-center w-full max-w-md mx-auto">
      {/* Decorative SVG bursts */}
      <DecorativeBurst className="absolute -top-6 -left-6" />
      <DecorativeBurst className="absolute -top-6 -right-6" />
      <DecorativeBurst className="absolute -bottom-6 -left-6" />
      <DecorativeBurst className="absolute -bottom-6 -right-6" />

      {/* Share Button - Top Right */}
      <button className="absolute top-6 right-6 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-md">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      {/* Profile Image */}
      <div className="relative mb-3 mt-2">
        <img
          src={profile.community.image}
          alt={profile.community.name}
          className="w-32 h-32 rounded-full object-cover shadow-lg bg-gray-200 border-4 border-white"
        />
      </div>

      {/* Rating Badge */}
      <div className="mb-4">
        <div className="bg-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow">
          <span>⭐</span>
          <span>4.8 (30 reviews)</span>
        </div>
      </div>

      {/* Name and Subtitle */}
      <div className="text-center mb-4 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {profile.community.name}
        </h1>
        {/* Community Owner/Type as subtitle */}
        <p className="text-lg font-semibold text-gray-400 mb-3">
          {profile.community.type || profile.user.user_name}
        </p>
        {/* Follow/Edit Button - Centered below */}
        <div className="flex justify-center mb-2">
          {!isOwner ? (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-base font-semibold flex items-center gap-2 shadow"
            >
              <span>👤</span>
              {followMutation.isPending ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-base font-semibold shadow"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tags - Pill style, wrap to two rows */}
      <div className="w-full flex flex-wrap justify-center gap-3 mb-8">
        {profile.community.tags?.map((tag: string, index: number) => (
          <span
            key={index}
            className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-base font-medium border border-blue-200"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action Buttons - Side by side, large */}
      <div className="w-full flex gap-3 mb-8">
        <ChatSupportButton
          expertEmail={profile.user.user_email}
          expertDetails={{
            name: profile.user.user_name,
            image: profile.user.user_avatar || profile.community.image,
            email: profile.user.user_email,
          }}
          isBankConnected={profile.user.user_isBankDetailsAdded}
          className="flex-1 flex items-center justify-center gap-2 px-0 py-4 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-base font-semibold min-h-[48px] bg-white"
        >
          <span className="ml-2">Chat with Expert</span>
        </ChatSupportButton>
        <button
          onClick={scrollToOfferings}
          className="flex-1 flex items-center justify-center gap-2 px-0 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-semibold min-h-[48px] shadow"
        >
          <Phone size={18} />
          Quick Explore Call
        </button>
      </div>

      {/* Social Media - Modern icons, centered */}
      <div className="flex gap-6 justify-center mt-2">
        <a href="#" className="text-blue-600 hover:text-blue-800 text-2xl"><FaFacebook /></a>
        <a href="#" className="text-gray-900 hover:text-gray-700 text-2xl"><GrInstagram /></a>
        <a href="#" className="text-black hover:text-gray-700 text-2xl"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.87 8.78 8.7 9.7.64.12.88-.28.88-.62v-2.17c-3.54.77-4.29-1.71-4.29-1.71-.58-1.47-1.42-1.86-1.42-1.86-1.16-.8.09-.78.09-.78 1.28.09 1.95 1.32 1.95 1.32 1.14 1.95 2.99 1.39 3.72 1.06.12-.83.45-1.39.82-1.71-2.83-.32-5.8-1.41-5.8-6.28 0-1.39.5-2.53 1.32-3.42-.13-.33-.57-1.66.13-3.46 0 0 1.07-.34 3.5 1.31A12.1 12.1 0 0 1 12 6.84c1.09.01 2.19.15 3.22.44 2.42-1.65 3.49-1.31 3.49-1.31.7 1.8.26 3.13.13 3.46.82.89 1.32 2.03 1.32 3.42 0 4.88-2.98 5.96-5.81 6.28.46.4.87 1.18.87 2.38v3.53c0 .34.24.74.89.62C18.13 20.78 22 16.84 22 12c0-5.52-4.48-10-10-10z" fill="currentColor"/></svg></a>
        <a href="#" className="text-black hover:text-gray-700 text-2xl"><FaLinkedinIn /></a>
      </div>
    </div>
  );
} 