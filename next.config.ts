import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_BASE_URL
  ? new URL(process.env.R2_PUBLIC_BASE_URL)
  : null;
const r2Path = r2PublicUrl?.pathname.replace(/\/+$/, "") ?? "";

if (r2PublicUrl && !["https:", "http:"].includes(r2PublicUrl.protocol)) {
  throw new Error("R2_PUBLIC_BASE_URL must use HTTP or HTTPS.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(r2PublicUrl
        ? [
            {
              protocol: r2PublicUrl.protocol.slice(0, -1) as "http" | "https",
              hostname: r2PublicUrl.hostname,
              port: r2PublicUrl.port,
              pathname: `${r2Path}/**`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
