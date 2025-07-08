import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { setUser, setSessionId } from "../redux/userSlice";

const AuthHandler = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const pathname = usePathname();

  // Define public pages that don't need any authentication
  const isPublicPage = pathname?.startsWith('/blogs') || 
                      pathname === '/' || 
                      pathname?.startsWith('/auth') ||
                      pathname?.startsWith('/privacy-policy') ||
                      pathname?.startsWith('/terms-conditions') ||
                      pathname?.startsWith('/contact-us');

  useEffect(() => {
    // Skip all authentication for blog pages
    if (pathname?.startsWith('/blogs')) {
      return;
    }

    const fetchSessionId = async (userId: string) => {
      try {
        // Only fetch sessionId if backend URL is configured
        if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
          console.warn("Backend URL not configured, skipping session fetch");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/getSession`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );
        
        if (!response.ok) {
          // Only log error for non-404 responses to avoid spam
          if (response.status !== 404) {
            console.warn("Failed to fetch sessionId:", response.status, response.statusText);
          }
          return;
        }

        const data = await response.json();
        if (data.data) {
          const sessionId = data.data;
          dispatch(setSessionId(sessionId));
        }
      } catch (error) {
        // Silently handle network errors to avoid blocking page functionality
        console.warn("Session fetch failed:", error instanceof Error ? error.message : 'Unknown error');
      }
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        // Only fetch profile if backend URL is configured
        if (!process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
          console.warn("Backend URL not configured, skipping profile fetch");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          // Only log error for non-404 responses to avoid spam
          if (response.status !== 404) {
            console.warn("Failed to fetch user profile:", response.status, response.statusText);
          }
          return;
        }

        const data = await response.json();
        
        if (data.r === "s" && data.data) {
          // Merge the profile data with the existing session user data
          const profileData = data.data;
          
          dispatch(setUser({
            ...session?.user,
            ...profileData,
            _id: session?.user._id || profileData._id,
          }));
        }
      } catch (error) {
        // Silently handle network errors to avoid blocking page functionality
        console.warn("Profile fetch failed:", error instanceof Error ? error.message : 'Unknown error');
      }
    };

    if (session?.user) {
      dispatch(setUser(session.user));

      const userId = session.user._id;
      
      // Only fetch additional auth data for authenticated pages or when user explicitly logs in
      if (userId && (!isPublicPage || session.user.email)) {
        fetchSessionId(userId);
        fetchUserProfile(userId);
      }
    }
  }, [session, dispatch, pathname, isPublicPage]);

  return null; // This component doesn't render anything
};

export default AuthHandler;
