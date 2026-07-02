import { siteConfig } from '@/lib/config';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [`/${siteConfig.adminPath}/`, '/api/']
    },
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
