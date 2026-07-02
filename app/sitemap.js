import { siteConfig } from '@/lib/config';
import { getBlogPosts } from '@/lib/data';

export default async function sitemap() {
  const posts = await getBlogPosts();
  const base = siteConfig.url;
  const staticRoutes = ['', '/expertises', '/a-propos', '/realisations', '/applications', '/campagnes', '/blog', '/contact'];
  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date()
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updated_at || p.created_at
    }))
  ];
}
