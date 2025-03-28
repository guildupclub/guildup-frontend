import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import guildup_logo from "./../../../public/svg/GuildUp_Logo_Light.svg";
import Login_laptop from "./../../../public/Login_laptop.png";

export const UserHeroSection: React.FC = () => {
  return (
    <div className="w-full bg-white border border-background flex flex-col h-full max-h-screen overflow-hidden">
      <div className="w-full flex justify-center p-6">
        <Image
          src={guildup_logo || "/placeholder.svg"}
          alt="GuildUp"
          width={160}
          height={48}
          className="h-12 w-auto"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between px-8 pb-6 overflow-y-auto">

        <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
    
          <div className="w-full mb-8">
            <h1 className="font-semibold text-2xl md:text-3xl text-center mb-8">
              Discover Expertise and Communities like never before
            </h1>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-primary">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-lg md:text-xl">
                  Find experts who actually help.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-primary">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-lg md:text-xl">Book sessions instantly.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-primary">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-lg md:text-xl">No more endless searching.</p>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center my-2">
            <div className="relative w-full max-w-md h-[240px] ">
              <Image
                src={Login_laptop || "/placeholder.svg"}
                alt="GuildUp Platform"
                className="object-contain"
                width={600}
                height={300}
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-4 pt-4 border-t border-background">
          <p className="text-muted-foreground mb-2 text-sm">
            Are you an expert looking to create a page?
          </p>
          <Button variant="outline" asChild className="font-medium">
            <Link href="#">Become a Creator</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
