'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const links = [
  { href: '/', label: 'Accueil', key: 'home' },
  { href: '/a-propos', label: 'À propos', key: 'about' },
  { href: '/expertises', label: 'Expertises', key: 'expertises' },
  { href: '/realisations', label: 'Réalisations', key: 'realisations' },
  { href: '/campagnes', label: 'Campagnes', key: 'campagnes' },
  { href: '/blog', label: 'Blog', key: 'blog' }
];

export default function Header({ activeNav }) {
  const pathname = usePathname();

  useEffect(() => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    const header = document.getElementById('site-header');
    if (!toggle || !nav) return;

    const onToggle = () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', onToggle);

    const onScroll = () => {
      if (!header) return;
      header.style.boxShadow = window.scrollY > 50
        ? '0 4px 30px rgba(0,0,0,0.5)'
        : '0 2px 20px rgba(0, 0, 0, 0.35)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (els.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
      els.forEach((el) => observer.observe(el));
    } else {
      els.forEach((el) => el.classList.add('visible'));
    }

    return () => {
      toggle.removeEventListener('click', onToggle);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  const isActive = (href, key) => {
    if (activeNav) return activeNav === key;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <header className="site-header" id="site-header">
        <div className="container header-inner">
          <Link href="/" className="logo" aria-label="Aroman EMETSHU — Accueil">
            <img src="/assets/img/logo.png" alt="Aroman EMETSHU" width={50} height={50} />
          </Link>
          <button className="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="main-nav" type="button">
            <span /><span /><span />
          </button>
          <nav id="main-nav" className="main-nav" aria-label="Navigation principale">
            <ul>
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={isActive(l.href, l.key) ? 'active' : ''}>{l.label}</Link>
                </li>
              ))}
              <li><Link href="/contact" className="nav-cta">Projet</Link></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
