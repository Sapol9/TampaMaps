import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Redirects for alternate domain
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tampabaymaps.com",
          },
        ],
        destination: "https://tampabaymaps.com/:path*",
        permanent: true,
      },
      // Redirect tbmaps.com to tampabaymaps.com
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "tbmaps.com",
          },
        ],
        destination: "https://tampabaymaps.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tbmaps.com",
          },
        ],
        destination: "https://tampabaymaps.com/:path*",
        permanent: true,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
