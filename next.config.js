/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Railway 백엔드 디렉토리를 빌드에서 제외
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Turbopack 설정 (Next.js 16 기본)
  turbopack: {
    root: __dirname,
  },
  // TypeScript 빌드에서 railway-backend 제외
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
