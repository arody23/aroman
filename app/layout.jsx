import { siteConfig } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Développeur Web & Media Buyer`,
    template: `%s | ${siteConfig.name}`
  },
  description: 'Développeur web, logiciels, SaaS, PWA et expert Media Buying. Portfolio premium à Kinshasa et Brazzaville.',
  icons: { icon: '/assets/img/logo.png' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/main.css" />
        <link rel="stylesheet" href="/css/admin.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
