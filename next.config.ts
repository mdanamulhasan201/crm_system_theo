import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.feetf1rst.tech',
      },
      {
        protocol: 'https',
        hostname: 'gif-sponsors-names-dealer.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'bennett-kodak-cabinets-atlanta.trycloudflare.com',
      },
      {
        // local host
        protocol: 'http',
        hostname: '192.168.7.12',
        port: '3001',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
