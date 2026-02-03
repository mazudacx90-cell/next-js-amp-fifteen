import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    amp: {
      skipValidation: true,
    },
  } as any,
};

export default nextConfig;
