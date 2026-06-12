import type { NextConfig } from "next"

function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim()
  if (!v) return ""
  const withSlash = v.startsWith("/") ? v : `/${v}`
  return withSlash.replace(/\/+$/, "")
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BACKEND_BASE_PATH)

const trailingSlash = process.env.NEXT_PUBLIC_TRAILING_SLASH === "true"

function apiProxyTarget(): string {
  const raw =
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://127.0.0.1:3002/api"
  return raw.replace(/\/api\/?$/, "")
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  trailingSlash,
  ...(basePath ? { basePath } : {}),
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_PROXY !== "true") return []
    const target = apiProxyTarget()
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fileserver2.hub.edu.vn",
        pathname: "/**",
      },
      { protocol: "https", hostname: "hub.edu.vn", pathname: "/**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/api/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3002",
        pathname: "/api/uploads/**",
      },
    ],
  },
  transpilePackages: [
    "@workspace/admin-app",
    "@workspace/ui",
    "@workspace/api-client",
    "@workspace/query-client",
    "@workspace/logger",
    "@thangph2146/lexical-editor",
  ],
}

export default nextConfig
