import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    NOTA CRÍTICA PARA VERCEL:
    - NO usar output: "standalone" (rompe el CDN de Vercel)
    - eslint y typescript se omiten en build (se validan con bun run lint localmente)
    - Vercel usa su propio sistema de optimización
  */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;