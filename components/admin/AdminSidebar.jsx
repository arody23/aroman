import Link from 'next/link';
import { siteConfig } from '@/lib/config';

const links = [
  { href: '', label: 'Dashboard' },
  { href: '/projects', label: 'Projets' },
  { href: '/applications', label: 'Applications' },
  { href: '/campaigns', label: 'Campagnes' },
  { href: '/blog', label: 'Blog' },
  { href: '/testimonials', label: 'Témoignages' },
  { href: '/contacts', label: 'Contacts' }
];

export default function AdminSidebar() {
  const base = `/${siteConfig.adminPath}`;
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img src="/assets/img/logo.png" alt="" width={40} height={40} />
        <span>Admin</span>
      </div>
      <nav>
        <ul>
          {links.map((l) => (
            <li key={l.href}><Link href={`${base}${l.href}`}>{l.label}</Link></li>
          ))}
        </ul>
      </nav>
      <form action="/api/admin/logout" method="POST">
        <button type="submit" className="btn btn-outline btn-sm">Déconnexion</button>
      </form>
    </aside>
  );
}
