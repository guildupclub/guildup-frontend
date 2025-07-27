"use client"; // Ensure this component is client-side

import { useRouter } from "next/navigation"; // Import from next/navigation for App Router
import { NewNavbar } from "@/components/layout/NewNavbar";
import { usePathname } from "next/navigation"; // Import usePathname
import { useEffect } from "react";

const NavbarClient = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname without query parameters

  // Log pathname for debugging
  console.log("Current pathname:", pathname);

  // Check if we're on an authentication page, checking for both signin and callback query parameters
  const isAuthPage =
    pathname?.includes("/api/auth/signin") ||
    pathname?.includes("/api/auth/signup") ||
    pathname?.includes("/api/auth/callback");

  // Check if we're on the chat page
  const isChatPage = pathname === "/chat";

  // Apply chat-specific body styling on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(max-width: 768px)');
      
      const applyBodyStyle = () => {
        if (isChatPage && mediaQuery.matches) {
          // Chat page on mobile: prevent scrolling
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
          document.body.style.overflow = 'hidden';
        } else {
          // All other pages: allow normal scrolling
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.height = '';
          document.body.style.overflow = '';
        }
      };

      // Apply initially
      applyBodyStyle();

      // Listen for screen size changes
      mediaQuery.addEventListener('change', applyBodyStyle);

      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', applyBodyStyle);
        // Reset body styles when component unmounts
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
      };
    }
  }, [isChatPage]);

  // Conditionally render the Navbar
  if (isAuthPage) {
    return null; // Don't render the Navbar on authentication pages
  }

  // On chat page, hide navbar on mobile but show on desktop
  if (isChatPage) {
    return (
      <div className="hidden md:block">
        <NewNavbar />
      </div>
    );
  }

  return <NewNavbar />;
};

export default NavbarClient;
