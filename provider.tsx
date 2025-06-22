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
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Create QueryClient outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const Providers = ({ children }: { children: React.ReactNode }) => {

  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <ThemeProvider>
                <NavigationProvider>
                  <CommunityProvider>
                    <NotificationProvider>
                      <ChatProvider>
                        <GoogleMeetProvider>
                          <AuthHandler />
                          {children}
                        </GoogleMeetProvider>
                      </ChatProvider>
                    </NotificationProvider>
                  </CommunityProvider>
                </NavigationProvider>
              </ThemeProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
};
