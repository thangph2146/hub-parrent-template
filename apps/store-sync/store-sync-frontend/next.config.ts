import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    "@workspace/ui",
    "@workspace/api-client",
    "@workspace/dealer-support",
  ],
};

export default nextConfig;
