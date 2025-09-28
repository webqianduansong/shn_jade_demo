const createNextIntlPlugin = require('next-intl/plugin');

const nextConfig = {
  experimental: {
    externalDir: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);
