import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "api.palestinetv.ps"],
    unoptimized: process.env.NODE_ENV === "development",
  },
  i18n: {
    locales: ["ar", "en"],
    defaultLocale: "ar",
    localeDetection: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
