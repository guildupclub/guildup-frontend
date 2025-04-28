"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { setUser } from "@/redux/userSlice";
import { useDispatch } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { RightSection } from "@/components/signIn/RightSection";
import { UserHeroSection } from "@/components/signIn/UserHeroSection";
import { UserMobileHeroSection } from "@/components/signIn/UserMobileHeroSection";
import { CreatorMobileHeroSection1 } from "@/components/signIn/CreatorMobileHeroSection1";
import { CreatorHeroSection1 } from "@/components/signIn/CreatorHeroSection1";
import { CreatorHeroSection2 } from "@/components/signIn/CreatorHeroSection2";
import Loader from "@/components/Loader";

function SignInContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const callbackUrl = searchParams.get("callbackUrl");

  const getHeroVersion = () => {
    if (!callbackUrl) return 2;
    try {
      const url = new URL(callbackUrl);
      return url.searchParams.get("hero") === "2" ? 2 : 1;
    } catch {
      return 2;
    }
  };

  return (
    <div className="flex md:flex-row h-screen md:overflow-hidden">
      <div className="hidden md:block w-1/2">
        {getHeroVersion() === 1 ? (
          session ? (
            <CreatorHeroSection2 />
          ) : (
            <CreatorHeroSection1 />
          )
        ) : (
          <UserHeroSection />
        )}
      </div>
      <div className="block w-full md:hidden">
        {getHeroVersion() === 1 ? (
          <CreatorMobileHeroSection1 />
        ) : (
          <UserMobileHeroSection />
        )}
      </div>
      <div className="hidden md:block md:w-1/2">
        <RightSection />
      </div>
    </div>
  );
}

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
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

  return (
    <Suspense fallback={<Loader />}>
      <SignInContent />
    </Suspense>
  );
}
