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
        hostname: 'shower-injuries-finished-slip.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'quotations-pierce-patrol-sur.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'chips-owen-eligibility-baby.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'korean-found-squad-cats.trycloudflare.com',
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
