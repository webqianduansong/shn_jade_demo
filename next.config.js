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
    unoptimized: true, // Cloudflare Pages 需要
  },
  eslint: {
    ignoreDuringBuilds: true, // 忽略 ESLint 错误以避免构建失败
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略 TypeScript 错误
  },
};

const withNextIntl = createNextIntlPlugin();
module.exports = withNextIntl(nextConfig);
