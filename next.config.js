const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-maps',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-data',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permitir TODOS los dominios HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Permitir TODOS los dominios HTTP
      }
    ],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

module.exports = withPWA(nextConfig);
