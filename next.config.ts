import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server from other devices on the LAN (e.g. phone /
  // another PC). Add any host/IP you browse from here.
  allowedDevOrigins: ["172.168.10.182"],
  images: {
    // Allow product imagery from Unsplash (seed data) and Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
