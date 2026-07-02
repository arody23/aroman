import Link from 'next/link';
import { siteConfig } from '@/lib/config';
import { adminList } from '@/lib/data';

const resources = {
  projects: { title: 'Projets', table: 'projects', fields: ['title', 'category', 'published'] },
  applications: { title: 'Applications', table: 'applications', fields: ['title', 'platform', 'published'] },
  campaigns: { title: 'Campagnes', table: 'campaigns', fields: ['client_name', 'platform', 'published'] },
  blog: { title: 'Blog', table: 'blog_posts', fields: ['title', 'slug', 'published'] },
  testimonials: { title: 'Témoignages', table: 'testimonials', fields: ['name', 'company', 'published'] },
  contacts: { title: 'Contacts', table: 'contact_requests', fields: ['name', 'email', 'status'] }
};

export async function generateMetadata({ params }) {
  const { resource } = await params;
  const cfg = resources[resource];
  return { title: `${cfg?.title || 'Admin'} — Admin` };
}

export default async function AdminResourcePage({ params }) {
  const { resource } = await params;
  const cfg = resources[resource];
  if (!cfg) return <p>Ressource inconnue</p>;

  let rows = [];
  try {
    rows = await adminList(cfg.table);
  } catch (e) {
    return <p className="admin-error">Erreur DB: {e.message}</p>;
  }

  const base = `/${siteConfig.adminPath}/${resource}`;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{cfg.title}</h1>
        {resource !== 'contacts' && (
          <Link href={`${base}/new`} className="btn btn-primary btn-sm">Ajouter</Link>
        )}
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            {cfg.fields.map((f) => <th key={f}>{f}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {cfg.fields.map((f) => (
                <td key={f}>{String(row[f] ?? '')}</td>
              ))}
              <td>
                {resource !== 'contacts' && (
                  <Link href={`${base}/${row.id}`}>Modifier</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
