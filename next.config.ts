import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Permitir ngrok
  allowedDevOrigins: [
    'localhost',
    '*.ngrok-free.app',
    process.env.NEXT_PUBLIC_SITE_URL || ''
  ],
};

export default nextConfig;