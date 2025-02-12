import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["target.scene7.com", "lh3.googleusercontent.com"], // Correct usage for external domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
