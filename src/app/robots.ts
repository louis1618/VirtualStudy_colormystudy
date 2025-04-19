import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/lib',
    },
    sitemap: 'http://study.louis1618.shop/sitemap.xml',
  };
}