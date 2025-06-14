/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["i.scdn.co"], // Allow images from Spotify's CDN
  },
};

export default nextConfig;
