/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ✅ Expose cloned files as static
  async rewrites() {
    return [
      {
        source: "/clones/:path*",
        destination: "/api/static/:path*", // will serve files from clones
      },
    ];
  },
};

export default nextConfig;
