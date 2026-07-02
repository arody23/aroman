export const siteConfig = {
  name: process.env.SITE_NAME || 'Aroman EMETSHU',
  url: process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  adminPath: process.env.ADMIN_PATH || 'gestion-interne-aroman',
  email: 'contact@aromanemetshu.com',
  phone: '+242 06 745 8011'
};

export function parseJson(value, fallback = []) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}
