import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.scdn.co"], // Allow images from Spotify's CDN
  },
};

export default nextConfig;
