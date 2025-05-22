"use client";
import { useEffect } from "react";

export default function GoogleOneTap() {
  useEffect(() => {
    // Only run on client
    if (
      typeof window === "undefined" ||
      !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ) {
      console.error(
        "Google Client ID is not defined or not in browser environment"
      );
      return;
    }

    // Dynamically load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        // Initialize Google One Tap
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          context: "signin",
        });

        // Display the One Tap prompt
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.error(
              "Prompt not displayed:",
              notification.getNotDisplayedReason()
            );
          } else if (notification.isSkipped()) {
            console.error("Prompt skipped:", notification.getSkippedReason());
          }
        });
      } else {
        console.error("Google Identity Services not loaded");
      }
    };

    // Cleanup script on component unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  function handleCredentialResponse(response: { credential: string }) {
    console.log("Encoded JWT ID token:", response.credential);

    // Send the credential to your backend for verification
    fetch("/api/auth/callback/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential: response.credential }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Sign-in response:", data))
      .catch((err) => console.error("Sign-in error:", err));
  }

  return null;
}
