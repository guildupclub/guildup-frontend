"use client";
import CreatorForm from "@/components/form/CreatorForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center ">
      <div className="w-full bg-white  flex flex-col items-center justify-center h-screen">
        <CreatorForm onClose={() => {}} />
      </div>
    </div>
  );
} 