import Link from 'next/link';
import SiteShell from '@/components/SiteShell';
import { getHomeData } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Aroman EMETSHU — Développeur Web & Media Buyer | Kinshasa, Brazzaville',
  description: 'Développeur web, logiciels, SaaS, PWA et expert Media Buying (Facebook Ads, Google Ads). Création de solutions digitales premium.',
  canonical: undefined
});

export default async function HomePage() {
  const { projects, campaigns, posts, testimonials } = await getHomeData();

  return (
    <SiteShell activeNav="home">
      <section className="hero" id="accueil">
        <div className="hero-bg" />
        <div className="container hero-content">
          <p className="hero-eyebrow">Développeur & Media Buyer</p>
          <h1>Aroman EMETSHU</h1>
          <p className="hero-lead">Je conçois des solutions digitales performantes et pilote des campagnes publicitaires à fort impact. Développement web, logiciels, SaaS et Media Buying — avec la même exigence de qualité.</p>
          <div className="hero-actions">
            <Link href="/contact" className="btn btn-primary">Démarrer un projet</Link>
            <Link href="/realisations" className="btn btn-outline">Voir mes réalisations</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-value">5+</span><span className="stat-label">ans d&apos;expérience</span></div>
            <div className="stat"><span className="stat-value">50+</span><span className="stat-label">projets livrés</span></div>
            <div className="stat"><span className="stat-value">2</span><span className="stat-label">expertises majeures</span></div>
          </div>
        </div>
      </section>

      <section className="section section-presentation">
        <div className="container split-layout">
          <div className="split-content reveal-left">
            <span className="section-tag">Présentation</span>
            <h2>Développement logiciel & acquisition digitale</h2>
            <p>Fort de plus de cinq ans d&apos;expérience, j&apos;accompagne entreprises et entrepreneurs dans la création de solutions digitales sur mesure.</p>
            <Link href="/a-propos" className="link-arrow">En savoir plus</Link>
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="section bg-subtle">
          <div className="container">
            <div className="section-header reveal">
              <span className="section-tag">Réalisations</span>
              <h2>Projets récents</h2>
            </div>
            <div className="project-grid">
              {projects.map((p) => (
                <article key={p.id} className="project-card reveal">
                  {p.cover_image && <img src={p.cover_image} alt={p.title} />}
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </article>
              ))}
            </div>
            <Link href="/realisations" className="link-arrow">Toutes les réalisations</Link>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section section-testimonials">
          <div className="container">
            <div className="section-header reveal"><h2>Témoignages</h2></div>
            <div className="testimonial-grid">
              {testimonials.map((t) => (
                <blockquote key={t.id} className="testimonial-card reveal">
                  <p>&ldquo;{t.content}&rdquo;</p>
                  <footer><strong>{t.name}</strong>{t.role && ` — ${t.role}`}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="section bg-subtle">
          <div className="container">
            <div className="section-header reveal"><h2>Blog</h2></div>
            <div className="blog-grid">
              {posts.map((post) => (
                <article key={post.id} className="blog-card reveal">
                  <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                  <p>{post.meta_description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
