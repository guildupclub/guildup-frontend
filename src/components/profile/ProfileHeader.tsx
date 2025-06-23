import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import type { User } from "@/types/auth.types";

interface ProfileHeaderProps {
  profile: User;
  avatarUrl: string;
  isEditable: boolean;
  onEditClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  avatarUrl,
  isEditable,
  onEditClick,
  onFileChange,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#334bff]/10 to-[#334bff]/5 p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <AvatarUpload avatarUrl={avatarUrl} onFileChange={onFileChange} />
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-xl md:text-2xl leading-7 text-primary">
            {profile.name}
          </h2>
          <p className="text-[#19191A] text-sm md:text-base leading-7">
            {profile.email}
          </p>
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.languages.slice(0, 2).map((lang, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-[#334bff]/10 text-primary-foreground border-[#334bff]/20"
                >
                  {lang}
                </Badge>
              ))}
              {profile.languages.length > 2 && (
                <Badge
                  variant="outline"
                  className="bg-[#334bff]/10 text-primary-foreground border-[#334bff]/20"
                >
                  +{profile.languages.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button
          className={`md:ml-auto w-full md:w-auto px-10 py-2 transition ${
            isEditable ? "bg-gray-500 pointer-events-none" : ""
          }`}
          onClick={onEditClick}
          disabled={isEditable}
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
}; 