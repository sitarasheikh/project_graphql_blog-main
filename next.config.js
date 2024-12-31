/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: Ignoring ESLint errors can lead to code quality issues.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
