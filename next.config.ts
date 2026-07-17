import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
  typedRoutes: true,
  turbopack: {
    resolveAlias: {
      "tw-animate-css": "tw-animate-css/dist/tw-animate.css",
    },
  },
  
  async rewrites() {
    return [
      {
        source: "/ai-service/:path*",
        destination: `${process.env.AI_SERVICE_URL ?? "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;