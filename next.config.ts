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
        hostname: 'native-rep-framing-harry.trycloudflare.com',
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
