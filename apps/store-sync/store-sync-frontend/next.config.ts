import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: [
    "@workspace/ui",
    "@workspace/api-client",
    "@workspace/admin-app",
    "@workspace/dealer-support",
    "@thangph2146/lexical-editor",
  ],
};

export default nextConfig;
