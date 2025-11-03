"use client";

import React from "react";
import { usePathname } from "next/navigation";
import LeadFormModal from "@/components/programs/LeadFormModal";
import { primary, white } from "@/app/colours";
import { PROGRAMS, type ProgramKey } from "@/app/programs/config";

export default function ProgramCTABanner() {
  const pathname = usePathname();

  // Check if we're on a program page
  const isProgramPage = pathname?.startsWith("/programs/");
  
  if (!isProgramPage) {
    return null;
  }

  // Extract program key from pathname
  const programKey = pathname?.split("/programs/")[1]?.split("/")[0] as ProgramKey | undefined;
  const program = programKey && PROGRAMS[programKey] ? PROGRAMS[programKey] : null;

  if (!program) {
    return null;
  }

  // Get banner content based on program type
  const getBannerContent = () => {
    if (program.slug === "relationship") {
      return "Let try to find balance";
    } else if (program.slug === "pcos" || program.slug === "stress-anxiety") {
      return `Fight ${program.slug === "pcos" ? "PCOS" : "Stress"} in 28 days`;
    }
    return "Get your personalized plan";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div 
        className="border-t shadow-lg px-4 py-3"
        style={{ 
          backgroundColor: white,
          borderColor: "#e5e7eb" 
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex-1">
            <p 
              className="text-sm font-semibold"
              style={{ 
                fontFamily: "'Poppins', sans-serif",
                color: "#0f172a"
              }}
            >
              {getBannerContent()}
            </p>
          </div>
          <LeadFormModal
            program={program.slug}
            triggerLabel="Join"
            variant="primary"
            appearance="default"
          />
        </div>
      </div>
    </div>
  );
}

