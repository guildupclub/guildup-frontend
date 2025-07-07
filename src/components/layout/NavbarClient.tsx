"use client"; // Ensure this component is client-side

import { useRouter } from "next/navigation"; // Import from next/navigation for App Router
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation"; // Import usePathname

const NavbarClient = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname without query parameters

  // Log pathname for debugging
  console.log("Current pathname:", pathname);

  // Check if we're on an authentication page or onboarding page
  const isAuthPage =
    pathname?.includes("/api/auth/signin") ||
    pathname?.includes("/api/auth/signup") ||
    pathname?.includes("/api/auth/callback") ||
    pathname?.startsWith("/onboarding");

  // Conditionally render the Navbar
  if (isAuthPage) {
    return null; // Don't render the Navbar on authentication or onboarding pages
  }

  return <Navbar />;
};

export default NavbarClient;
