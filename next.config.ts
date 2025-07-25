/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hfiles.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'test.testhfiles.in',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd7cop3y0lcg80.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  experimental: {
    esmExternals: false,
  },


  

  webpack: (config: { resolve: { fallback: any; }; }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
