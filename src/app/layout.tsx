import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "../../provider";
import { Toaster } from "sonner";
import { ChakraProvider } from '@chakra-ui/react';
import NavbarClient from "@/components/layout/NavbarClient";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import PostHogProviderWrapper from "@/components/providers/PostHogWrapper";
import WelcomeBanner from "@/components/banner/Banner";
import CouponBanner from "@/components/banner/CouponBanner";
import CookieConsent from "@/components/cookies/CookieConsent";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";
import AttributionInitializer from "@/components/analytics/AttributionInitializer";
import ProgramCTABanner from "@/components/programs/ProgramCTABanner";
// import GoogleOneTap from "@/components/GoogleOneTap";

import RouteChangeTracker from "@/components/RouteChangeTracker";
import GlobalInteractionTracker from "@/components/analytics/GlobalInteractionTracker";
import FloatingNeedHelpButton from "@/components/needHelp/FloatingNeedHelpButton";
import dynamic from "next/dynamic";
import Script from "next/script";
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});
const guildup_logo_final = "/guildup_logo_final.png";

// Feature flag to toggle CouponBanner visibility
const ENABLE_COUPON_BANNER = false;

export const metadata: Metadata = {
  title: "GuildUp",
  description:
    "Discover trusted coaches, therapists & experts. One platform. Real guidance. Personalized help — just when you need it.",
  metadataBase: new URL("https://guildup.club"),
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
        {/* Warmly Script Loader */}
        <Script
          id="warmly-script-loader"
          src="https://opps-widget.getwarmly.com/warmly.js?clientId=763f8ad95eda79622d76436b4f16dd66"
          strategy="afterInteractive" 
        />
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-5ZKZDMMK');
    `,
          }}
        />
        <Script 
        id="ga4-loader"
        async src="https://www.googletagmanager.com/gtag/js?id=G-8TF2QM56T0">
        </Script>
        <Script
        id="ga4"
         dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
          gtag('config', 'G-8TF2QM56T0');
        `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?                         
              n.callMethod.apply(n,arguments):n.queue.push   
              (arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!
              0;n.version='2.0';n.queue=[];t=b.createElement(e);
              t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,
              'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '661403980198126');
              fbq('track', 'PageView');
            `,
          }}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta
          name="facebook-domain-verification"
          content="jiqk23ypswv5t4ozyxbhpy3z1mhrcd"
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
        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "rgpxrvmq3a");
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5ZKZDMMK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=661403980198126&ev=PageView&noscript=1"
          />
        </noscript>
        <AnalyticsWrapper />
        <AttributionInitializer />
        <CookieConsentProvider>
        <PostHogProviderWrapper>
            <ChakraProvider>
              <div style={{ margin: 0, padding: 0 }}>
                <Providers>
                  {/* {ENABLE_COUPON_BANNER && <CouponBanner />} */}
                  <div style={{ margin: 0, padding: 0 }}>
                    <NavbarClient />
                    <Breadcrumb />
                  </div>
                <RouteChangeTracker />
                <GlobalInteractionTracker />
                {children}
                <ProgramCTABanner />
                <FloatingNeedHelpButton />
                {/* <GoogleOneTap /> */}
                {/* <Toaster richColors position="top-center" />s */}
                {/* <CookieConsent /> */}
                {/* <WelcomeBanner /> */}
                </Providers>
              </div>
            </ChakraProvider>
            </PostHogProviderWrapper>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
