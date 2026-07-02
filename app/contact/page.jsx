import SiteShell from '@/components/SiteShell';
import ContactForm from '@/components/ContactForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Contact — Aroman EMETSHU',
  description: 'Contactez Aroman EMETSHU pour votre projet web ou campagne publicitaire.',
  canonical: undefined
});

export default function ContactPage() {
  return (
    <SiteShell activeNav="contact">
      <section className="section page-hero">
        <div className="container">
          <span className="section-tag">Contact</span>
          <h1>Démarrons votre projet</h1>
          <p>Décrivez votre besoin — je vous réponds sous 24h.</p>
        </div>
      </section>
      <section className="section">
        <div className="container contact-layout">
          <ContactForm />
        </div>
      </section>
    </SiteShell>
  );
}
