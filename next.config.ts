import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "ruixen.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: '/about', destination: '/', permanent: true },
      { source: '/home-new', destination: '/', permanent: true },
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*', permanent: true },
      {
        source: '/BlogPost',
        has: [{ type: 'query', key: 'slug' }],
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/BlogPost',
        has: [{ type: 'query', key: 'id' }],
        destination: '/blog',
        permanent: true,
      },
      { source: '/blog/how-to-turn-your-website-into-your-1-salesperson', destination: '/blog', permanent: true },
      { source: '/blog/saas-marketing', destination: '/blog', permanent: true },
      { source: '/blog/the-power-of-content-marketing-in-saas', destination: '/blog', permanent: true },
      { source: '/blog/leveraging-seo-for-saas-success', destination: '/blog', permanent: true },
      { source: '/blog/small-business-ai-practical-tools-strategies-for-local-business-growth', destination: '/blog', permanent: true },
      { source: '/blog/5-key-trends-in-saas-growth-for-2025', destination: '/blog', permanent: true },
      { source: '/national-seo', destination: '/seo', permanent: true },
      { source: '/ecommerce-seo', destination: '/seo', permanent: true },
      { source: '/ppc-management', destination: '/ppc', permanent: true },
      { source: '/local-seo', destination: '/seo', permanent: true },
      { source: '/thank-you', destination: '/', permanent: true },
      { source: '/single-service', destination: '/services', permanent: true },
    ];
  },
};

export default nextConfig;
