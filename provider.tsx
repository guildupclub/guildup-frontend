"use client";
import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./src/redux/store";
import AuthHandler from "@/components/AuthHandler";
import { NotificationProvider } from "@/components/notifications/NotificationContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient()); // ✅ Ensures a stable QueryClient instance

  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <AuthHandler />
            {children}
          </NotificationProvider>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
};
