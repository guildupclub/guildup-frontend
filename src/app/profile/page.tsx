"use client";

import * as React from "react";
import Image from "next/image";
import { FaArrowLeft } from 'react-icons/fa';
import InputField from '@/components/userProfile/Input'
import axios from 'axios';
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./../../components/ui/dialog";
import { StringConstants } from "@/components/common/CommonText";

interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  avatar: string;
  cover: string | null;
  about: string;
  phone: string;
  location: string;
  user_interests: string[];
  save: string[];
  share: string[];
  upvote: string[];
  downvote: string[];
  emailVerified: string | null;
  community_joined: string[];
  is_creator: boolean;
  custom_feeds: string[];
}

const ProfilePage = () => {
  const {user}= useSelector((state: RootState)=> state.user);
  const userId= user?._id
  const [profile, setProfile] = React.useState<User | null>(null);
  const [profileCopy, setProfileCopy] = React.useState<User | null>(null);
  const [isEditable, setIsEditable] = React.useState(false);
  const [avatarImgUrl, setAvatarImgUrl]= React.useState<string>('');
  const [changedFields, setChangedFields] = React.useState({});
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);


  React.useEffect(() => {
    const updateUserProfile = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile`, {userId});
        
        if (response.data.r === "s") {
          setProfile(response.data.data);
          setProfileCopy(response.data.data)
          
          if (response.data.data.avatar) {
            setAvatarImgUrl(response.data.data.avatar);
          } else if(response.data.data.image){
            setAvatarImgUrl(response.data.data.image);
          } else {
            setAvatarImgUrl(
              `https://api.dicebear.com/9.x/thumbs/svg`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    updateUserProfile();
  }, []);

  const updateUserProfile = async () => {
    try {
      const response = await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/edit`, {updateData: changedFields, userId});
      if (response.data.r === "e") {
        toast.error(response.data.message)
        setProfile(profileCopy)
      } else {
        toast.success("Signed in successfully!");
        setProfile(response.data.data.user);
        setProfileCopy(response.data.data.user)
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile((prevProfile) => prevProfile ? { ...prevProfile, [name]: value } : null);
    setChangedFields(prevChanged => ({ ...prevChanged, [name]: value }));
  };

  const handleSave = () => {
    if (profile) {
      updateUserProfile();
      setIsEditable(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toast.error("Please select an image file.");
      return;
    }

    const previousAvatarUrl = avatarImgUrl;
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("avatar", file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/update-avatar`,
        formData, { headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.r === "s") {
        const newAvatarUrl = response.data.data.user.avatar;
        setAvatarImgUrl(newAvatarUrl);
        toast.success(response.data.data.message);
        setIsModalOpen(false);
      } else if (response.data.r === "e") {
        if (Array.isArray(response.data.e)) {
          response.data.e.forEach((err: any) => {
            toast.error(err.message);
          });
        } else {
          toast.error(response.data.e);
        }
        setAvatarImgUrl(previousAvatarUrl);
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      toast.error(error.message || "Error uploading profile picture.");
      setAvatarImgUrl(previousAvatarUrl);
    }finally {
      event.target.value = "";
    }
  };

  if (!profile) return <p>Loading...</p>;
  return (
    <div className="flex bg-[#f2f2f2]">
      <div className="flex grow flex-col w-full gap-6 px-20 mx-5 mt-6">
        <div className="flex flex-row justify-between">
          <div className='h-30 flex flex-row items-center gap-3'>
            <div><FaArrowLeft /></div>
            <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">My Profile</h1>
          </div>
          {/* <h1 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">X My Profile</h1> */}
          <button className="text-red-600 border border-red-600 px-4 py-1 rounded-lg hover:bg-red-600 hover:text-white transition">
            Delete Account
          </button>
        </div>
        <div className="flex flex-col w-full bg-card shadow-md p-6 rounded-lg relative gap-12">
          <div className="flex items-center gap-4">
          <Dialog>
            {/* Use DialogTrigger to wrap the Image, so clicking opens the modal */}
            <DialogTrigger asChild>
              <Image
                src={avatarImgUrl}
                alt="Profile Picture"
                width={80}
                height={80}
                className="rounded-full hover:cursor-pointer"
              />
            </DialogTrigger>

            {/* Dialog Content */}
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
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-gray-100 file:hover:bg-gray-200"
                />
              </div>

              {/* Footer with a close button */}
              <DialogFooter>
                <DialogClose asChild>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {StringConstants.CLOSE}
                  </button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            <div>
              <h2 className="font-semibold text-2xl font-[Source Sans Pro] leading-7">{profile.name}</h2>
              <p className="block text-[#19191A] text-base font-normal leading-7 front-[Source Sans Pro]">{profile.email}</p>
            </div>
            <button className={`ml-auto bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 transition ${isEditable ? 'bg-gray-500 pointer-events-none' : 'null'}`}
              onClick={() => setIsEditable(true)} disabled={isEditable}>
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
                label="Name"
                name="name"
                placeholder="Enter your name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditable}
              />
            {/* <InputField
              label="Last Name"
              name="lastName"
              placeholder="Enter your last name"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!isEditable}
            /> */}
            <InputField
              label="Email ID"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={profile.email}
              onChange={handleChange}
              disabled
            />
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="Enter your phone number"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditable}
              prefix="+91"
            />
          </div>

          <div className="flex justify-start">
            <button
              onClick={handleSave}
              className={`bg-blue-600 text-white px-14 py-2 rounded-lg hover:bg-blue-700 transition ${isEditable ? 'null' : 'bg-gray-500 pointer-events-none'}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
