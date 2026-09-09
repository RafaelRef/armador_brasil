import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.DEPLOY_TARGET === 'node' || process.env.RENDER === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
