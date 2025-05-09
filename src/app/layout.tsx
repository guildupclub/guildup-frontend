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
  generator:"Next.js",
  manifest: "/manifest.json",
  applicationName: "GuildUp Club",
  authors: [{ name: "GuildUp Club", url: "https://guildup.club" }],
  creator: "GuildUp Club",
  keywords: ["GuildUp Club", "Community", "Knowledge Sharing", "Monetization"],
    themeColor: "#ffffff",
    colorScheme: "light",

  

  icons: {
    icon: "/guildup_logo_final.png",
    shortcut: "/guildup_logo_final.png",
    apple: "/guildup_logo_final.png",
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
        <link rel="shortcut icon" href="/guildup_logo_final.png" />
        <link rel="icon" type="image/png" href="/guildup_logo_final.png" />
        <link rel="apple-touch-icon" href="/guildup_logo_final.png" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-B3B9W8GRQP"></script>
        <script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-B3B9W8GRQP');
          `}
        </script>
      
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