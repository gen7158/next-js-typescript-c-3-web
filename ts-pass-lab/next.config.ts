import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    '/api/typescript-run': ['./node_modules/typescript/lib/lib*.d.ts'],
  },
};

export default nextConfig;
