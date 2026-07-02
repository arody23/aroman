import AdminSidebar from '@/components/admin/AdminSidebar';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/lib/config';

export default async function AdminPanelLayout({ children }) {
  const session = await requireAdmin();
  if (!session) redirect(`/${siteConfig.adminPath}/login`);

  return (
    <div className="admin-body">
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
