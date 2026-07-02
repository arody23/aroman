import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Blog — Aroman EMETSHU' });

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <SiteShell activeNav="blog">
      <section className="section page-hero"><div className="container"><h1>Blog</h1></div></section>
      <section className="section"><div className="container blog-grid">
        {posts.map((post) => (
          <article key={post.id} className="blog-card reveal">
            <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
            <p>{post.meta_description}</p>
          </article>
        ))}
        {!posts.length && <p>Articles à venir.</p>}
      </div></section>
    </SiteShell>
  );
}
