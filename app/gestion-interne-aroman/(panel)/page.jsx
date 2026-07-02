import { getDashboardStats } from '@/lib/data';

export const metadata = { title: 'Dashboard — Admin' };

export default async function AdminDashboard() {
  let stats = { stats: {}, recentContacts: [], recentVisitors: [] };
  try {
    stats = await getDashboardStats();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="admin-page">
      <h1>Dashboard</h1>
      <div className="admin-stats-grid">
        <div className="admin-stat-card"><span>Projets</span><strong>{stats.stats.projects || 0}</strong></div>
        <div className="admin-stat-card"><span>Applications</span><strong>{stats.stats.applications || 0}</strong></div>
        <div className="admin-stat-card"><span>Campagnes</span><strong>{stats.stats.campaigns || 0}</strong></div>
        <div className="admin-stat-card"><span>Articles</span><strong>{stats.stats.blog_posts || 0}</strong></div>
        <div className="admin-stat-card"><span>Nouveaux contacts</span><strong>{stats.stats.newContacts || 0}</strong></div>
        <div className="admin-stat-card"><span>Visiteurs</span><strong>{stats.stats.visitors || 0}</strong></div>
      </div>
      <section className="admin-section">
        <h2>Derniers contacts</h2>
        <ul className="admin-list">
          {(stats.recentContacts || []).map((c) => (
            <li key={c.id}>{c.name} — {c.email} — {c.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
