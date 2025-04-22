import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: false,
  },
  images: {
    unoptimized: true,
    domains : [
      "target.scene7.com",
      "lh3.googleusercontent.com",
      "api.dicebear.com",
      "random-image-pepebigotes.vercel.app",
      "storage.googleapis.com",
      "img.freepik.com",
      "conqrr.vercel.app",
    ] ,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  },
};

export default nextConfig;
