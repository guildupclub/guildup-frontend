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
    icon: "/guildup_logo_final.png",
    shortcut: "/guildup_logo_final.png",
    apple: "/guildup_logo_final.png",
  },
  openGraph: {
    title: "GuildUp Club",
    description: "Ultimate platform to build communities, share knowledge, and monetize your passion seamlessly",
    images: [
      {
        url: "/guildup_logo_final.png",
        width: 1200,
        height: 630,
        alt: "GuildUp Logo",
      },
    ],
    type: "website",
    siteName: "GuildUp",
  },
  twitter: {
    card: "summary_large_image",
    title: "GuildUp Club",
    description: "Ultimate platform to build communities, share knowledge, and monetize your passion seamlessly",
    images: ["/guildup_logo_final.png"],
  },
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