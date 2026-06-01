import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fileserver2.hub.edu.vn", pathname: "/**" },
      { protocol: "https", hostname: "hub.edu.vn", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "3002", pathname: "/api/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3002", pathname: "/api/uploads/**" },
    ],
  },
  transpilePackages: ["@workspace/api-client", "@thangph2146/lexical-editor"],
};

export default nextConfig;
