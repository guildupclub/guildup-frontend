import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../../provider";
import { Toaster } from "sonner";
import NavbarClient from "@/components/layout/NavbarClient";
import { headers } from "next/headers";
import Script from "next/script";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import PostHogProviderWrapper from "@/components/providers/PostHogWrapper";

import CookieConsent from "@/components/cookies/CookieConsent";

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
  title: "GuildUp",
  description:
    "Discover trusted coaches, therapists & experts. One platform. Real guidance. Personalized help — just when you need it.",
  openGraph: {
    title: "GuildUp",
    description:
      "Discover trusted coaches, therapists & experts. One platform. Real guidance. Personalized help.",
    url: "https://guildup.club",
    siteName: "GuildUp",
    images: [
      {
        url: "/guildup-logo.png",
        width: 1200,
        height: 630,
        alt: "GuildUp Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  generator: "Next.js",
  manifest: "/manifest.json",
  applicationName: "GuildUp Club",
  authors: [{ name: "GuildUp Club", url: "https://guildup.club" }],
  creator: "GuildUp Club",
  keywords: ["GuildUp Club", "Community", "Knowledge Sharing", "Monetization"],


  icons: {
    icon: "/guildup-logo.png",
    shortcut: "/guildup-logo.png",
    apple: "/guildup-logo.png",
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <link rel="shortcut icon" href="/guildup_logo_final.png" />
        <link rel="icon" type="image/png" href="/guildup_logo_final.png" />
        <link rel="apple-touch-icon" href="/guildup_logo_final.png" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GuildUp" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Do not remove these script */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-B3B9W8GRQP"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-B3B9W8GRQP');
            `,
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('PWA: ServiceWorker registration successful');
                    })
                    .catch(function(error) {
                      console.log('PWA: ServiceWorker registration failed');
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsentProvider>
          <PostHogProviderWrapper>
            <Providers>
              <NavbarClient />
              {children}
              <Toaster richColors position="top-center" />
              <CookieConsent />
            </Providers>
          </PostHogProviderWrapper>

        </CookieConsentProvider>
      </body>
    </html>
  );
}
