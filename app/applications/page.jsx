import SiteShell from '@/components/SiteShell';
import { getApplications } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Applications — Portfolio' });

export default async function ApplicationsPage() {
  const applications = await getApplications();
  return (
    <SiteShell activeNav="applications">
      <section className="section page-hero"><div className="container"><h1>Applications</h1></div></section>
      <section className="section"><div className="container project-grid">
        {applications.map((a) => (
          <article key={a.id} className="project-card reveal">
            {a.image && <img src={a.image} alt={a.title} />}
            <h3>{a.title}</h3><p>{a.description}</p>
          </article>
        ))}
        {!applications.length && <p>Contenu à venir.</p>}
      </div></section>
    </SiteShell>
  );
}
