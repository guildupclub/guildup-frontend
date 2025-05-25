"use client";

import { useEffect, useCallback, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Script from "next/script";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const { data: session } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleCredentialResponse = useCallback((response: any) => {
    console.log("Google One Tap response:", response);
    signIn("googleonetap", {
      credential: response.credential,
      redirect: false,
      callbackUrl: process.env.NEXT_PUBLIC_BASE_FRONTEND_URL!,
    })
      .then((result) => {
        if (result?.error) {
          console.error("Sign-in error:", result.error);
        } else {
          console.log("Sign-in success");
        }
      })
      .catch((err) => {
        console.error("One Tap sign-in error:", err);
      });
  }, []);

  const initializeOneTap = useCallback(() => {
    if (window.google && !session) {
      console.log("Initializing One Tap");

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: true,
          context: "signin",
          itp_support: true,
          // Avoid unnecessary flags like use_fedcm_for_prompt or cancel_on_tap_outside unless you really need them
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log(
              "Not displayed, reason:",
              notification.getNotDisplayedReason()
            );
          }
          if (notification.isSkippedMoment()) {
            console.log("Skipped, reason:", notification.getSkippedReason());
          }
          if (notification.isDismissedMoment()) {
            console.log(
              "Dismissed, reason:",
              notification.getDismissedReason()
            );
          }
        });
      } catch (error) {
        console.error("One Tap init error:", error);
      }
    }
  }, [session, handleCredentialResponse]);

  useEffect(() => {
    if (scriptLoaded && !session) {
      initializeOneTap();
    }
  }, [scriptLoaded, session, initializeOneTap]);

  useEffect(() => {
    if (session) {
      window.google?.accounts.id.cancel();
    }
  }, [session]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      async
      defer
      strategy="afterInteractive"
      onLoad={() => {
        console.log("Google One Tap script loaded");
        setScriptLoaded(true);
      }}
      onError={(err) => {
        console.error("Error loading Google One Tap script:", err);
      }}
    />
  );
}
