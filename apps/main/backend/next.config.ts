import type { NextConfig } from "next";

function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const withSlash = v.startsWith("/") ? v : `/${v}`;
  return withSlash.replace(/\/+$/, "");
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BACKEND_BASE_PATH);

// Optional: run admin under a trailingSlash production
// Set NEXT_PUBLIC_TRAILING_SLASH=true in .env to enable trailing slashes for all routes
const trailingSlash = process.env.NEXT_PUBLIC_TRAILING_SLASH === "true";

function apiProxyTarget(): string {
  const raw =
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://127.0.0.1:3002/api";
  return raw.replace(/\/api\/?$/, "");
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  trailingSlash,
  transpilePackages: [
    "@workspace/ui",
    "@workspace/api-client",
    "@workspace/query-client",
    "@thangph2146/lexical-editor",
  ],
  ...(basePath ? { basePath } : {}),
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_PROXY !== "true") return [];
    const target = apiProxyTarget();
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
