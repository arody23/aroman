import { notFound } from 'next/navigation';
import SiteShell from '@/components/SiteShell';
import { getBlogPost } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/config';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.title,
    canonical: `${siteConfig.url}/blog/${post.slug}`,
    ogImage: post.image
  });
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <SiteShell activeNav="blog">
      <article className="section">
        <div className="container article-content">
          <header className="article-header">
            <span className="section-tag">{post.category}</span>
            <h1>{post.title}</h1>
          </header>
          {post.image && <img src={post.image} alt={post.title} className="article-cover" />}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        </div>
      </article>
    </SiteShell>
  );
}
