/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'select-sports-public.s3.ap-south-1.amazonaws.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'venues-images.s3.ap-south-1.amazonaws.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'media.hudle.in',
        port: ''
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
