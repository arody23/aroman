(function () {
  'use strict';

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 50
        ? '0 4px 30px rgba(0,0,0,0.5)'
        : '0 2px 20px rgba(0,0, 0, 0.35)';
    }, { passive: true });
  }

  const animatedSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const animatedEls = document.querySelectorAll(animatedSelectors);

  if (animatedEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const grid = el.closest('.expertise-grid, .why-grid, .project-grid, .testimonial-grid, .blog-grid, .campaign-grid');
        if (grid) {
          const siblings = Array.from(grid.children);
          const index = siblings.indexOf(el);
          el.style.transitionDelay = `${index * 0.12}s`;
        }
        el.classList.add('visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    animatedEls.forEach(el => observer.observe(el));
  } else {
    animatedEls.forEach(el => el.classList.add('visible'));
  }
})();
