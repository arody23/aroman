import { siteConfig } from '@/lib/config';

export function buildMetadata({ title, description, canonical, ogImage }) {
  const fullTitle = title || siteConfig.name;
  const desc = description || 'Développeur web & Media Buyer — Aroman EMETSHU';
  const url = canonical || siteConfig.url;
  const image = ogImage || `${siteConfig.url}/assets/img/logo.png`;
  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: image }],
      locale: 'fr_FR',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image]
    }
  };
}
