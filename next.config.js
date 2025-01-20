/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "api.slingacademy.com",
        port: "",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  transpilePackages: ["geist"],
};

module.exports = nextConfig;
