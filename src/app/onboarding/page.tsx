"use client";
import CreatorForm from "@/components/form/CreatorForm";

export default function OnboardingPage() {
  return (
    <div className=" w-full flex items-center justify-center ">
      <div className="w-full bg-white  flex flex-col items-center justify-center">
        <CreatorForm onClose={() => {}} />
      </div>
    </div>
  );
} 