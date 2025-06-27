import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { StringConstants } from "@/components/common/CommonText";

interface AvatarUploadProps {
  avatarUrl: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  onFileChange,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative group">
          <Image
            src={avatarUrl || "/placeholder.svg"}
            alt="Profile Picture"
            width={100}
            height={100}
            className="rounded-full border-4 border-white shadow-md hover:cursor-pointer transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            {StringConstants.UPDATE_PROFILE_PICTURE_DESCRIPTION ||
              "Upload a new image to update your profile picture."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-100 file:hover:bg-gray-200"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="bg-[#334bff] text-white px-4 py-2 rounded hover:bg-[#2a3ecc] transition">
              {StringConstants.CLOSE}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 