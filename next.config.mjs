/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  agentRules: false,
};
export default nextConfig;
