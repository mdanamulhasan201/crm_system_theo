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
        hostname: 'korean-found-squad-cats.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'quotations-pierce-patrol-sur.trycloudflare.com',
      },
     
      {
        protocol: 'http',
        hostname: '192.168.7.12',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '1971',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rpg-happened-houston-national.trycloudflare.com',
      }
    ],
  },
};

export default nextConfig;
