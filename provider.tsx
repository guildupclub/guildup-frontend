"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AuthHandler from "@/components/AuthHandler";
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthHandler />
        {children}
      </Provider>
    </SessionProvider>
  );
};
