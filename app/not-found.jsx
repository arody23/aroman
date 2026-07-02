import Link from 'next/link';
import SiteShell from '@/components/SiteShell';

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section page-hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1>404</h1>
          <p>Page introuvable.</p>
          <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
        </div>
      </section>
    </SiteShell>
  );
}
