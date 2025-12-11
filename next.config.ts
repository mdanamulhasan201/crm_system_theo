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
<<<<<<< HEAD
        hostname: 'universal-atom-yale-sponsorship.trycloudflare.com',
=======
        hostname: 'quotations-pierce-patrol-sur.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'chips-owen-eligibility-baby.trycloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'rim-kiss-utilization-src.trycloudflare.com',
>>>>>>> 1dd817869e6cef3142b3b7c1e334edd5e61f5d93
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
