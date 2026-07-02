import SiteShell from '@/components/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'À propos — Aroman EMETSHU',
  description: 'Parcours, vision et valeurs d\'Aroman EMETSHU, développeur web et Media Buyer.'
});

export default function AboutPage() {
  return (
    <SiteShell activeNav="about">
      <section className="section page-hero">
        <div className="container">
          <span className="section-tag">À propos</span>
          <h1>Aroman EMETSHU</h1>
          <p>Développeur web & Media Buyer basé à Brazzaville et Kinshasa.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split-layout">
          <div className="split-content">
            <h2>Mon parcours</h2>
            <p>Plus de cinq ans d&apos;expérience dans le développement de solutions digitales et l&apos;optimisation de campagnes publicitaires multi-plateformes.</p>
            <p>Je combine rigueur technique et vision marketing pour livrer des résultats mesurables.</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
