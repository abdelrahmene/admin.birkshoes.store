/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.birkshoes.store'], // <--- remplacer localhost par domaine API
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.birkshoes.store',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.birkshoes.store/api/:path*', // en prod, proxy vers API publique
      },
    ];
  },
};

module.exports = nextConfig;

