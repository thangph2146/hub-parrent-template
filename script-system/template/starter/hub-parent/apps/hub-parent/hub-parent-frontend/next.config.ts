import type { NextConfig } from "next";

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function buildImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [
    { protocol: "https", hostname: "fileserver2.hub.edu.vn", pathname: "/**" },
    { protocol: "https", hostname: "hub.edu.vn", pathname: "/**" },
    /** API / uploads trên subdomain HUB (vd. tuyensinh.hub.edu.vn). */
    { protocol: "https", hostname: "*.hub.edu.vn", pathname: "/**" },
    {
      protocol: "http",
      hostname: "localhost",
      port: "3002",
      pathname: "/api/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "3002",
      pathname: "/api/**",
    },
  ];

  const apiRaw =
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiRaw) {
    try {
      const origin = new URL(apiRaw.replace(/\/api\/?$/i, ""));
      const protocol = origin.protocol.replace(":", "") as "http" | "https";
      const fromEnv: RemotePattern = {
        protocol,
        hostname: origin.hostname,
        pathname: "/**",
      };
      if (origin.port) fromEnv.port = origin.port;
      const exists = patterns.some(
        (p) => p.hostname === fromEnv.hostname && p.protocol === fromEnv.protocol,
      );
      if (!exists) patterns.push(fromEnv);
    } catch {
      // bỏ qua URL env không hợp lệ
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  /** Cho phép `next/image` tối ưu ảnh từ domain HUB (có thể bỏ `unoptimized` từng bước sau QA). */
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  transpilePackages: [
    "@workspace/ui",
    "@workspace/api-client",
    "@workspace/query-client",
    "@thangph2146/lexical-editor",
  ],
};

export default nextConfig;
