/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any remote image host so user-provided Image URLs render.
    // Using unoptimized keeps things simple for free static-friendly hosting.
    unoptimized: true,
  },
};

export default nextConfig;
