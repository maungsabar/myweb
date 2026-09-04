/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Allow local uploaded images from public/uploads/
    localPatterns: [
      {
        pathname: '/uploads/**',
      },
    ],
  },
  // Allow API route body up to 4MB for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
