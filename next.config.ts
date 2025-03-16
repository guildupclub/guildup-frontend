import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: true,
  },
  images: {
    domains: [
      "target.scene7.com",
      "lh3.googleusercontent.com",
      "api.dicebear.com",
      "random-image-pepebigotes.vercel.app",
      "storage.googleapis.com",
      "img.freepik.com",
    ], // Correct usage for external domains
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
};

export default nextConfig;
