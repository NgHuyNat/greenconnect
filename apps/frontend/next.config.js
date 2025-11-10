/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "greenconnect.hynat.io.vn"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
    NEXT_PUBLIC_SOCKET_URL:
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
};

module.exports = nextConfig;
