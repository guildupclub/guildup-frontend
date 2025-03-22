"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { setUser } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import GoogleSignIn from "@/components/common/GoogleSignIn";
import Image from "next/image";
import guildup_logo from "./../../../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../../../public/Login_laptop.png";
import Login_mobile from "./../../../../../public/Login_mobile.png";
import { FaCheck } from "react-icons/fa";
import CreatorForm from "@/components/signIn/CreatorForm";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {RightSection} from '@/components/signIn/RightSection'
import { UserHeroSection } from "@/components/signIn/UserHeroSection";
import { CreatorHeroSection1 } from "@/components/signIn/CreatorHeroSection1";
import { CreatorHeroSection2 } from "@/components/signIn/CreatorHeroSection2";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // const result = await signIn("credentials", {
      //   email,
      //   password,
      //   redirect: false,
      // });
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/login`,
        {
          email,
          password,
        }
      );

      dispatch(
        setUser({
          _id: result.data.data.user.id,
          name: result.data.data.user.name || "",
          email: result.data.data.user.email,
          image: result.data.data.user.avatar,
          accessToken: result.data.data.session,
        })
      );
      console.log("@sininreust", result);
      if (result?.data?.e === "e") {
        setError(result.data.data);
      } else {
        toast.success("Signed in successfully!");
        router.push("/explore");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const getHeroVersion = () => {
    // hero section 2 is for user and 1 for creator
    if (!callbackUrl) return 2; // Default
    
    try {
      const url = new URL(callbackUrl);
      return url.searchParams.get("hero") === "1" ? 1 : 2;
    } catch {
      return 2; // Fallback to default
    }
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Left: Hero/Marketing */}
      {getHeroVersion() === 1 ? (
        session ? <CreatorHeroSection2 /> : <CreatorHeroSection1 />
      ) : (
        <UserHeroSection />
      )}

      {/* Right: Gradient background + login */}
      <RightSection />
    </div>
  );
}
