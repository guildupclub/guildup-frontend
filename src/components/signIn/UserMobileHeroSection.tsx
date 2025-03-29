import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../public/Login_laptop.png";
import GoogleSignIn from "../common/GoogleSignIn";
import { signIn } from "next-auth/react";

export const UserMobileHeroSection: React.FC = () => {
  return (
    <div className="w-full bg-white border border-background flex flex-col h-full max-h-screen overflow-hidden gap-6">
      <div className="w-full flex justify-center pt-6">
        <Image
          src={guildup_logo}
          alt="GuildUp Logo"
          width={160}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      <div className="flex flex-col justify-between px-3 gap-2">
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full gap-3">
          <div className="w-full gap-2 text-center">
            <h1 className="font-semibold text-2xl">
              Explore & Book Experts Seamlessly
            </h1>

            <p className="text-base">Sign up on GuildUp and grow your Guild with thousands of users looking for top coaches, consultants, and professionals. <span className="font-semibold text-[#334BFF]">Build your custom community and start earning in under 30 minutes!</span></p>
          </div>

          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-md h-[220px] ">
              <Image
                src={Login_laptop}
                alt="GuildUp Platform"
                className="object-contain"
                // width={600}
                // height={300}
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-8 border-t border-background">
          <p className="text-muted-foreground text-sm">
            Are you an expert looking to create a page?
          </p>
          <span className="font-semibold text-color-[#334BFF]">
            <button onClick={() => signIn(undefined, {
              callbackUrl: `${window.location.origin}?hero=1`
            })}>Become a Creator</button>
          </span>
        </div>
      </div>

      {/* LoginContainer Section */}
      <div className="w-4/5 max-w-md bg-white rounded-lg shadow-lg mx-auto">
        <GoogleSignIn />
      </div>
    </div>
  );
};