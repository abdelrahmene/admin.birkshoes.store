/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/yalidine/:path*',
        destination: 'https://api.yalidine.app/v1/:path*',
      },
    ]
  },
}

module.exports = nextConfig
