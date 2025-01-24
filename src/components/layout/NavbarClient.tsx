"use client"; // Ensure this component is client-side

import { useRouter } from "next/navigation"; // Import from next/navigation for App Router
import { Navbar } from "@/components/layout/Navbar";
import { usePathname } from "next/navigation"; // Import usePathname

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

  // Conditionally render the Navbar
  if (isAuthPage) {
    return null; // Don't render the Navbar on authentication pages
  }

  return <Navbar />;
};

export default NavbarClient;
