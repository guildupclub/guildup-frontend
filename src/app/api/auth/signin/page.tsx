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
import CreatorForm from "@/components/form/CreatorForm";
import { Dialog } from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

  const LoginContainer: React.FC = () => {
    return (
      <div className="w-4/5 max-w-md bg-white rounded-lg shadow-lg">
        <GoogleSignIn/>
      </div>
    );
  };

  const UserHeroSection: React.FC = () => {
    return (
      <div className="w-1/2 bg-white flex flex-col items-start justify-start p-8 gap-16 border border-background">
        <div className="flex justify-center w-full">
          <Image
            src={guildup_logo || "/placeholder.svg"}
            alt="GuildUp"
            className="h-16 w-auto md:block"
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
              <h1 className="font-semibold text-3xl">Discover Expertise and Communities like never before</h1>
              <div className="flex flex-col gap-8">
                <div className="flex gap-3 items-center h-5">
                  <FaCheck />
                  <p className="font-normal text-2xl">Find experts who actually help.</p>
                </div>
                <div className="flex gap-3 items-center h-5">
                  <FaCheck />
                  <p className="font-normal text-2xl">Book sessions instantly.</p>
                </div>
                <div className="flex gap-3 items-center h-5">
                  <FaCheck />
                  <p className="font-normal text-2xl">No more endless searching.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src={Login_laptop || "/placeholder.svg"}
                alt="GuildUp"
                className="h-[360px] w-auto md:block -mt-8"
                />
            </div>
          </div>
          <div className="text-center w-full">
            <p>Are you an expert looking to create a page?</p>
            <p>Become a Creator</p>
          </div>
        </div>
      </div>
    );
  };
  
  const CreatorHeroSection1: React.FC = () => {
    return (
      <div className="w-1/2 bg-white flex flex-col items-start justify-start p-8 gap-8 border border-background">
        <div className="flex justify-center w-full">
          <Image
            src={guildup_logo || "/placeholder.svg"}
            alt="GuildUp"
            className="h-16 w-auto md:block"
          />
        </div>
        <div className="h-3"></div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">Be found. GuildUp makes it easy.</h1>
            <p className="text-2xl font-normal">
              Sign up on GuildUp and grow your Guild with thousands of users looking 
              for top coaches, consultants, and professionals. <span className="font-semibold text-[#334BFF]">Build your custom community and start earning in under 30 minutes!</span>
            </p>
          </div>
          <div className="flex justify-center">
              <Image
                src={Login_laptop || "/placeholder.svg"}
                alt="GuildUp"
                className="h-[360px] w-auto md:block -mt-4"
                />
          </div>
        </div>
      </div>
    );
  };
  
  const CreatorHeroSection2: React.FC = () => {
    return (
      <div className="w-1/2 bg-white flex flex-col items-start justify-start p-8 gap-8 border border-background">
        <div className="flex justify-center w-full">
          <Image
            src={guildup_logo || "/placeholder.svg"}
            alt="GuildUp"
            className="h-16 w-auto md:block"
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold">Start Monetizing Your Expertise</h1>
            <p className="text-2xl font-normal">
              Create your Guild where you can <span className="font-semibold text-[#334BFF]">offer</span> paid consultations, <span className="font-semibold text-[#334BFF]">build</span> your following, get <span className="font-semibold text-[#334BFF]">discovered</span>.
            </p>
          </div>
          <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">No more waiting for clients to find your Instagram bio link.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">No more DMs going unanswered or ghosted inquiries.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">Clients discover, compare, and book you instantly—zero friction.</p>
              </div>
              <div className="flex gap-3 items-center">
                <FaCheck />
                <p className="font-normal text-2xl">Structured bookings & secure payments—so you focus on what you do best.</p>
              </div>
          </div>
        </div>
        <div className="-mt-8">
            <Image
              src={Login_mobile || "/placeholder.svg"}
              alt="GuildUp"
              className="h-[360px] w-auto md:block -mt-4"
              />
        </div>
      </div>
    );
  };

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const getHeroVersion = () => {
    if (!callbackUrl) return 2; // Default
    
    try {
      const url = new URL(callbackUrl);
      return url.searchParams.get("hero") === "1" ? 1 : 2;
    } catch {
      return 2; // Fallback to default
    }
  };

  const RightSection: React.FC = () => {
    return (
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-[#9900FA] to-[#334BFF] p-8">
        {/* {getHeroVersion() === 1 ? 
          <Dialog>
            <div style={{ border: "1px solid red" }}>Checking visibility</div>
            <CreatorForm onClose={()=> {}} isLoginScreen={true}/> 
          </Dialog> : 
          <LoginContainer />} */}
          <LoginContainer />
          {/* <Dialog>
            <div style={{ border: "1px solid red" }}>Checking visibility</div>
            <CreatorForm onClose={()=> {}} isLoginScreen={true}/> 
          </Dialog> */}
      </div>
    );
  };
  
  


  return (
    <div className="flex min-h-screen">
      {/* Left: Hero/Marketing */}
      {getHeroVersion() === 1 ? <CreatorHeroSection1 /> : <UserHeroSection />}

      {/* Right: Gradient background + login */}
      <RightSection />
    </div>
  );
}
