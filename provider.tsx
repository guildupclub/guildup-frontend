"use client";
import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./src/redux/store";
import AuthHandler from "@/components/AuthHandler";
import { NotificationProvider } from "@/components/notifications/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { GoogleMeetProvider } from "@/contexts/GoogleMeetContext";
import RouteChangeTracker from "@/components/RouteChangeTracker.tsxRouteChangeTracker";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient()); // ✅ Ensures a stable QueryClient instance

  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <ChatProvider>
              <GoogleMeetProvider>
                <AuthHandler />
                <RouteChangeTracker/>
                {children}
              </GoogleMeetProvider>
            </ChatProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
};
