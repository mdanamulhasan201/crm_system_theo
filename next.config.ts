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
        hostname: 'chemistry-supplemental-vatican-fixed.trycloudflare.com',
      },
      {
        // local host
        protocol: 'http',
        hostname: '192.168.7.12',
        port: '3001',
        pathname: '/**',
<<<<<<< HEAD
      },
      {
        protocol: 'https',
        hostname: 'chemistry-supplemental-vatican-fixed.trycloudflare.com',
        port: '',
        pathname: '/**',
=======
>>>>>>> 35a1fbbc85c0c88de13509be691f5e689399b26f
      }
    ],
  },
};

export default nextConfig;
