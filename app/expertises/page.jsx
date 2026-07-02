import SiteShell from '@/components/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Expertises — Développement & Media Buying',
  description: 'Développement web, SaaS, logiciels métier, PWA et stratégies publicitaires.'
});

export default function ExpertisesPage() {
  return (
    <SiteShell activeNav="expertises">
      <section className="section page-hero">
        <div className="container">
          <span className="section-tag">Expertises</span>
          <h1>Développement & Media Buying</h1>
          <p>Deux domaines complémentaires pour votre croissance digitale.</p>
        </div>
      </section>
      <section className="section" id="developpement">
        <div className="container expertise-grid">
          <article className="expertise-card reveal">
            <h2>Développement</h2>
            <ul>
              <li>Sites web professionnels</li>
              <li>Applications web & SaaS</li>
              <li>Logiciels d&apos;entreprise & PWA</li>
            </ul>
          </article>
          <article className="expertise-card reveal" id="media-buying">
            <h2>Media Buying</h2>
            <ul>
              <li>Facebook & Instagram Ads</li>
              <li>Google Ads</li>
              <li>Stratégies d&apos;acquisition</li>
            </ul>
          </article>
        </div>
      </section>
    </SiteShell>
  );
}
