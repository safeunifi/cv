import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow building without env vars set (they'll be required at runtime)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
