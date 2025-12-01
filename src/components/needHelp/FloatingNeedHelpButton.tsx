"use client";

import { Button } from "@/components/ui/button";
import { primary } from "@/app/colours";
import { WHATSAPP_NUMBER_DIGITS } from "@/config/constants";
import { usePathname } from "next/navigation";

export default function FloatingNeedHelpButton() {
  const pathname = usePathname();
  
  // Hide on friendship pages
  if (pathname?.startsWith("/friendship")) {
    return null;
  }

  const handleWhatsAppClick = () => {
    const whatsappMessage = encodeURIComponent(`Hi!, I'd like to know more about Guildup's program`);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-full h-10 w-10 md:px-4 md:py-3 md:h-auto md:w-auto"
        style={{ 
          backgroundColor: primary,
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <svg 
            className="w-4 h-4 md:w-5 md:h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="font-medium text-sm md:text-base hidden md:inline">Need Help?</span>
        </div>
      </Button>
    </div>
  );
}
