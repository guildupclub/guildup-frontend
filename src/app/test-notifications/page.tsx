"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToPushNotifications } from "@/utils/pushNotifications";

export default function TestNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Check if push notifications are supported
    if (!("Notification" in window)) {
      setError("This browser does not support notifications");
      return;
    }

    // Check permission status
    setStatus(`Permission status: ${Notification.permission}`);
  }, []);

  const handleSubscribe = async () => {
    try {
      setError("");
      setStatus("Requesting permission...");

      const sub = await subscribeToPushNotifications();
      setSubscription(sub);
      setStatus("Successfully subscribed to push notifications!");

      // Test the notification
      await fetch("/api/push-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: sub,
          notification: {
            title: "Test Notification",
            message: "If you see this, push notifications are working! 🎉",
            data: {
              url: window.location.origin,
            },
          },
        }),
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Push Notifications Test</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {status && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {status}
        </div>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleSubscribe}
          disabled={!!subscription}
          className="w-full"
        >
          {subscription ? "Already Subscribed" : "Test Push Notification"}
        </Button>

        {subscription && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Subscription Info:</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
