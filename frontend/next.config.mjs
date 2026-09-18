/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:3000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
