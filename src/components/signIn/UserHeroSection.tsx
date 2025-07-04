import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import guilduplogo from "./../../../public/guilduplogo.webp";
import bgleft from "./../../../public/bgleft.webp";


import Login_laptop from "./../../../public/Login_laptop.png";
import { Poppins as PoppinsFont } from "next/font/google";

const Poppins = PoppinsFont({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600"],
});

export const UserHeroSection: React.FC = () => {
  return (
    <div className="w-full bg-white border border-background flex flex-col p-5  h-[50vh] lg:h-screen overflow-hidden" >
     <div className="relative h-full w-full rounded-xl bg-blue-50" >

          <div className="h-36 lg:h-64 w-36 lg:w-64 absolute top-0 right-0">
             <Image src={bgleft} alt={"bg"}/>
          </div>
          <div className="relative top-3 md:top-5 lg:top-7 left-6 z-10 flex gap-3 md:gap-4 lg:gap-5 items-center justify-start">

            <Image
              src={guilduplogo}
              alt="GuildUp Logo"
              className="w-10 md:w-14 lg:w-20 h-8 md:h-12 lg:h-16 "
            />
            <h1 className={`font-semibold text-2xl md:text-3xl lg:text-4xl font-poppins`}>GuildUp</h1>
          </div>
          <div className=" absolute bottom-3 md:bottom-5 lg:bottom-6 flex flex-col gap-2 lg:gap-3 xl:gap-5 px-3 lg:px-5">
            
                   <h1 className={`font-semibold text-[#334BFF] text-lg md:text-xl lg:text-2xl ${Poppins.className}`}>Work 1:1 with</h1>
                   <p className={`font-bold text-2xl md:text-3xl lg:text-5xl font-poppins`}>Trusted Coaches, Therapists, Nutritionists & more</p>
                   <p className={`font-normal text-xs lg:text-base text-gray-500 font-poppins`}>Join a growing community of over 2.5 lakh people and connect with 100+ verified coaches, therapists, nutritionists, and wellness experts</p>
          </div>
          
     </div>
    </div>
  );
};
