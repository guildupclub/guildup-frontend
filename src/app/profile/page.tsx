"use client";

import * as React from "react";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";
import InputField from "@/components/userProfile/Input";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StringConstants } from "@/components/common/CommonText";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  year_of_experience?: string;
  session_conducted?: string;
  languages?: string[];
}


const ProfileRedirect = () => {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to the new dashboard profile page
    router.replace("/dashboard/profile");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return <ProfileRedirect />;
};

export default ProfileRedirect;
