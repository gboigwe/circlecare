/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Fix multiple lockfiles warning by setting trace root to monorepo root
  outputFileTracingRoot: path.join(__dirname, '../'),

  experimental: {
    // Optimize package imports for better tree-shaking and bundle size reduction
    // These packages will have unused exports stripped automatically
    optimizePackageImports: [
      'lucide-react',           // Icon library - reduces bundle by ~60%
      '@stacks/transactions',   // Stacks blockchain transactions
      '@stacks/connect',        // Stacks wallet connection
      '@tanstack/react-query'   // Data fetching library
    ]
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Further bundle optimizations
  swcMinify: true, // Use SWC for minification (faster)

  // Optimize React in production
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.stacks.co',
      },
    ],
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
}

module.exports = nextConfig