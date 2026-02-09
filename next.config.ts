import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@prisma/adapter-better-sqlite3", "better-sqlite3"],
  experimental: {
    optimizePackageImports: [
      "@ant-design/x",
      "antd",
      "lucide-react",
      "@tanstack/react-query",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    return [
      {
        source: "/:all*\\.(svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
