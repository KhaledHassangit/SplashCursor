// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    
  },
  images: {
    domains: ["s3-us-west-2.amazonaws.com"],
  },
};

export default nextConfig;
