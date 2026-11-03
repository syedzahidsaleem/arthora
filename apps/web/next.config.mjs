/** @type {import('next').NextConfig} */
const isStaticExport = process.env.EXPORT_STATIC === 'true' || process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  ...(isStaticExport ? { output: 'export', distDir: 'out' } : {}),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: isStaticExport,
};

export default nextConfig;
