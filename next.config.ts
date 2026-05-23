import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      { source: '/Home', destination: '/', permanent: true },
      { source: '/About', destination: '/about', permanent: true },
      { source: '/Contact', destination: '/contact', permanent: true },
      { source: '/Services', destination: '/services', permanent: true },
      { source: '/Blog', destination: '/blog', permanent: true },
      { source: '/SEO', destination: '/seo', permanent: true },
      { source: '/PPC', destination: '/ppc', permanent: true },
      { source: '/WebDesign', destination: '/web-design', permanent: true },
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
