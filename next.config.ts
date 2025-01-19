import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add your other config options here
  eslint: {
    ignoreDuringBuilds: true,
  } as any, // Temporary workaround to avoid type issues
};

export default nextConfig;
