import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../public/Login_laptop.png";
import GoogleSignIn from "../common/GoogleSignIn";
import { useSession } from "next-auth/react";
import { useState } from "react";
import CreatorForm from "./CreatorForm";
import { LoginContainer } from "./LoginContainer";
import { FaCheck } from "react-icons/fa";

export const CreatorMobileHeroSection1: React.FC = () => {
  const { data: session } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSuccess = () => {
    setIsFormOpen(false);
  };
  return (
    <div className="w-full bg-white border border-background flex flex-col h-full max-h-screen overflow-hidden gap-6">
      <div className="w-full flex justify-center pt-6">
        <Image
          src={guildup_logo || "/placeholder.svg"}
          alt="GuildUp"
          width={160}
          height={40}
          className="h-10 w-auto"
        />
      </div>

      <div className="flex flex-col justify-between px-3 gap-2">
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full gap-3">
          <div className="h-14 w-full">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-full text-white text-lg font-bold bg-[#334BFF]`
                  }
                >
                  {session? <FaCheck/> : "1"}
                </div>
              </div>
              {!session ? (
                <div className="flex items-center space-x-3 px-2">
                  <div
                    className={`h-1 w-14 ${ "bg-[#334BFF]" }`}
                  ></div>
                  <div
                    className={`h-1 w-14 ${ "bg-[#334BFF]" }`}
                  ></div>
                  <div
                    className={`h-1 w-14 ${ "bg-[#334BFF]" }`}
                  ></div>
                  <div
                    className={`h-1 w-14 ${ "bg-[#334BFF]" }`}
                  ></div>
                </div>
                ) : (
                  <div className="flex items-center h-1 flex-1 bg-[#334BFF] mx-2"></div>
                )
              }
              {/* Step 2 */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-full  text-lg font-bold ${
                  session ? "bg-[#334BFF] text-white" : "border-dashed border-2 border-[#334BFF] text-[#334BFF]"
                }`}
              >
                2
              </div>
            </div>
          </div>
            <div className="w-full gap-2 text-center">
              <h1 className="font-semibold text-2xl">
                Be found. GuildUp makes it easy.
              </h1>

              <p className="text-base">Create your Guild where you can <span className="font-semibold text-[#334BFF]">offer</span> paid consultations, <span className="font-semibold text-[#334BFF]">build</span> your following, get <span className="font-semibold text-[#334BFF]">discovered</span></p>
            </div>
            {!session && (<div className="w-full flex justify-center">
              <div className="relative w-full max-w-md h-[220px] ">
                <Image
                  src={Login_laptop || "/placeholder.svg"}
                  alt="GuildUp Platform"
                  className="object-contain"
                  // width={600}
                  // height={300}
                />
              </div>
            </div>)}
          </div>
      </div>

      {session && isFormOpen ? (
        <CreatorForm onSuccess={handleSuccess} />
      ) : (
        <div className="flex justify-center mt-4 border-t border-background">
          <LoginContainer/>
        </div>
      )}
    </div>
  );
};