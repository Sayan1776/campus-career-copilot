/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    serverComponentsExternalPackages: ['firebase-admin', 'pdf-parse'],
  },
};

module.exports = nextConfig;
