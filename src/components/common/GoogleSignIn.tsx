import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface GoogleSignInProps {
  isLoading?: boolean;
  callbackUrl?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  isLoading,
  callbackUrl = window.location.href,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [finalCallbackUrl, setFinalCallbackUrl] = useState(callbackUrl);
  const user = useSelector((state: RootState) => state.user);
  // Check if user is already a creator using the is_creator flag
  const isCreator = user?.user?.is_creator ? true : false;

  // This hook will ensure the code is run only on the client-side (after mount)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use useRouter only after the component has mounted
  useEffect(() => {
    if (isMounted) {
      const urlParams = new URLSearchParams(window.location.search);
      const cb = urlParams.get("callbackUrl");
      setFinalCallbackUrl(cb || window.location.origin);
    }
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }
  return (
    <div className="flex items-center justify-center bg-background w-full h-full rounded-lg">
    
       

        
        <Button
          variant="outline"
          className="w-full bg-[#d7f8e0]  hover:bg-[#cff7da]"
          onClick={() => signIn("google", { callbackUrl: finalCallbackUrl })}
          disabled={isLoading}
        >
         <svg
          className="mr-2 h-7 w-7"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          aria-hidden="true"
          focusable="false"
        >
          <g>
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.09 1.53 7.49 2.81l5.54-5.54C33.64 3.54 29.14 1.5 24 1.5 14.82 1.5 6.98 7.98 3.69 16.44l6.44 5.01C12.13 15.01 17.62 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.01 46.1 31.24 46.1 24.5z"/>
            <path fill="#FBBC05" d="M10.13 28.45A14.5 14.5 0 0 1 9.5 24c0-1.56.27-3.07.76-4.45l-6.44-5.01A23.97 23.97 0 0 0 0 24c0 3.81.91 7.41 2.52 10.56l7.61-6.11z"/>
            <path fill="#EA4335" d="M24 46.5c6.14 0 11.3-2.03 15.07-5.53l-7.19-5.6c-2 1.34-4.56 2.13-7.88 2.13-6.38 0-11.87-5.51-13.87-12.94l-7.61 6.11C6.98 40.02 14.82 46.5 24 46.5z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </g>
        </svg>
        <span style={{ color: '#3c4043' }}>Continue with Google</span>
        </Button>
      
      
    </div>
  );
};

export default GoogleSignIn;
