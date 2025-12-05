/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Optimizaciones para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    // Reducir caché en desarrollo
    experimental: {
      staleTimes: {
        dynamic: 0,
        static: 0,
      },
    },
  }),
};

export default nextConfig;