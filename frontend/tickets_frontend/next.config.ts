import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // El túnel de Cloudflare usa un host aleatorio (*.trycloudflare.com) en desarrollo.
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    agentFeedback: true,
    serverActions: {
      allowedOrigins: ["*.trycloudflare.com"],
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
