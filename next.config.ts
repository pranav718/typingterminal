import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true, // for book cover placeholders
  },
};

export default nextConfig;