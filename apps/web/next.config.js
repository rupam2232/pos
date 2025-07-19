/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    images: {
       remotePatterns: [new URL('https://res.cloudinary.com/rupam-mondal/**')],
  },
};

export default nextConfig;
