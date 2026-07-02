import SiteShell from '@/components/SiteShell';
import Link from 'next/link';
import { getProjects } from '@/lib/data';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Réalisations Web — Portfolio' });

export default async function RealisationsPage() {
  const projects = await getProjects();
  return (
    <SiteShell activeNav="realisations">
      <section className="section page-hero"><div className="container"><h1>Réalisations</h1></div></section>
      <section className="section"><div className="container project-grid">
        {projects.map((p) => (
          <article key={p.id} className="project-card reveal">
            {p.cover_image && <img src={p.cover_image} alt={p.title} />}
            <h3>{p.title}</h3><p>{p.description}</p>
          </article>
        ))}
        {!projects.length && <p>Contenu à venir.</p>}
      </div></section>
    </SiteShell>
  );
}
