import SiteShell from '@/components/SiteShell';
import { getCampaigns } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Campagnes — Portfolio' });

export default async function CampagnesPage() {
  const campaigns = await getCampaigns();
  return (
    <SiteShell activeNav="campagnes">
      <section className="section page-hero"><div className="container"><h1>Campagnes</h1></div></section>
      <section className="section"><div className="container project-grid">
        {campaigns.map((c) => (
          <article key={c.id} className="project-card reveal">
            <h3>{c.client_name}</h3><p>{c.objective}</p>
          </article>
        ))}
        {!campaigns.length && <p>Contenu à venir.</p>}
      </div></section>
    </SiteShell>
  );
}
