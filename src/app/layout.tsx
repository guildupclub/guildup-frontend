import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../../provider";
import { Toaster } from "sonner";
import NavbarClient from "@/components/layout/NavbarClient";
import { headers } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const guildup_logo_final = "/guildup_logo_final.png";

export const metadata: Metadata = {
  title: "GuildUp Club",
  description: "ultimate platform to build communities, share knowledge, and monetize your passion seamlessly",
  icons: {
    icon: [
      {
        url: guildup_logo_final, // Add forward slash to indicate public folder
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: guildup_logo_final, // Add forward slash to indicate public folder
        sizes: "16x16",
        type: "image/png"
      }
    ],
    shortcut: [guildup_logo_final], // Add forward slash
    apple: [
      {
        url: guildup_logo_final, // Add forward slash
        sizes: "180x180",
        type: "image/png"
      }
    ],
    other: [
      {
        rel: "mask-icon",
        url: guildup_logo_final
      }
    ]
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/guildup_logo_final.png" type="image/png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <NavbarClient />
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}