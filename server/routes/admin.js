const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { requireAuth, requireGuest } = require('../middleware/auth');
const upload = require('../middleware/upload');

const pub = (v) => !!v;

function fillLastDays(rows, days = 7) {
  const map = {};
  rows.forEach(r => { map[String(r.day).slice(0, 10)] = Number(r.count); });
  const labels = [];
  const values = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    values.push(map[key] || 0);
  }
  return { labels, values };
}

async function getTrafficCharts(db) {
  const isPg = !!process.env.DATABASE_URL;
  let dailyViews, dailyVisitors;
  if (isPg) {
    dailyViews = await db.prepare(`
      SELECT TO_CHAR(viewed_at, 'YYYY-MM-DD') as day, COUNT(*)::int as count
      FROM page_views WHERE viewed_at >= NOW() - INTERVAL '7 days'
      GROUP BY 1 ORDER BY 1
    `).all();
    dailyVisitors = await db.prepare(`
      SELECT TO_CHAR(first_visit, 'YYYY-MM-DD') as day, COUNT(*)::int as count
      FROM visitors WHERE first_visit >= NOW() - INTERVAL '7 days'
      GROUP BY 1 ORDER BY 1
    `).all();
  } else {
    dailyViews = await db.prepare(`
      SELECT date(viewed_at) as day, COUNT(*) as count FROM page_views
      WHERE viewed_at >= datetime('now', '-7 days') GROUP BY 1 ORDER BY 1
    `).all();
    dailyVisitors = await db.prepare(`
      SELECT date(first_visit) as day, COUNT(*) as count FROM visitors
      WHERE first_visit >= datetime('now', '-7 days') GROUP BY 1 ORDER BY 1
    `).all();
  }
  const views = fillLastDays(dailyViews);
  const visitors = fillLastDays(dailyVisitors);
  return { labels: views.labels, pageViews: views.values, visitors: visitors.values };
}

function chartRows(rows, labelKey, valueKey = 'count', limit = 8) {
  const slice = rows.slice(0, limit);
  return {
    labels: slice.map(r => r[labelKey]),
    values: slice.map(r => Number(r[valueKey]))
  };
}

module.exports = function adminRoutes(adminPath) {
  const router = express.Router();

  router.get('/login', requireGuest, (req, res) => {
    res.render('admin/login', { title: 'Connexion', error: null, adminPath });
  });

  router.post('/login', requireGuest, async (req, res) => {
    const db = getDb();
    const { username, password } = req.body;
    const admin = await db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.render('admin/login', { title: 'Connexion', error: 'Identifiants incorrects.', adminPath });
    }
    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    res.redirect(`/${adminPath}`);
  });

  router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy(() => res.redirect(`/${adminPath}/login`));
  });

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const db = getDb();
      const stats = {
        projects: (await db.prepare('SELECT COUNT(*) as c FROM projects').get()).c,
        applications: (await db.prepare('SELECT COUNT(*) as c FROM applications').get()).c,
        campaigns: (await db.prepare('SELECT COUNT(*) as c FROM campaigns').get()).c,
        posts: (await db.prepare('SELECT COUNT(*) as c FROM blog_posts').get()).c,
        contacts: (await db.prepare("SELECT COUNT(*) as c FROM contact_requests WHERE status = 'new'").get()).c,
        visitors: (await db.prepare('SELECT COUNT(*) as c FROM visitors').get()).c,
        pageViews: (await db.prepare('SELECT COUNT(*) as c FROM page_views').get()).c
      };
      const recentContacts = await db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 5').all();
      const recentVisitors = await db.prepare('SELECT * FROM visitors ORDER BY last_visit DESC LIMIT 5').all();
      const traffic = await getTrafficCharts(db);
      const chartData = {
        traffic,
        content: {
          labels: ['Projets', 'Applications', 'Campagnes', 'Articles'],
          values: [stats.projects, stats.applications, stats.campaigns, stats.posts]
        }
      };
      res.render('admin/dashboard', { title: 'Tableau de bord', adminPath, adminUsername: req.session.adminUsername, stats, recentContacts, recentVisitors, chartData });
    } catch (err) { next(err); }
  });

  router.get('/projects', requireAuth, async (req, res, next) => {
    try {
      const db = getDb();
      const items = await db.prepare('SELECT * FROM projects ORDER BY sort_order, created_at DESC').all();
      res.render('admin/projects/list', { title: 'Projets', adminPath, adminUsername: req.session.adminUsername, items, parseJson });
    } catch (err) { next(err); }
  });

  router.get('/projects/new', requireAuth, (req, res) => {
    res.render('admin/projects/form', { title: 'Nouveau projet', adminPath, adminUsername: req.session.adminUsername, item: null });
  });

  router.get('/projects/:id/edit', requireAuth, async (req, res, next) => {
    try {
      const db = getDb();
      const item = await db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
      if (!item) return res.status(404).send('Non trouvé');
      res.render('admin/projects/form', { title: 'Modifier projet', adminPath, adminUsername: req.session.adminUsername, item });
    } catch (err) { next(err); }
  });

  router.post('/projects', requireAuth, upload.single('cover_image'), async (req, res, next) => {
    try {
      const db = getDb();
      const { title, description, technologies, project_url, category, project_date, published, sort_order } = req.body;
      const cover = req.file ? `/uploads/${req.file.filename}` : req.body.existing_cover || '';
      await db.prepare(`INSERT INTO projects (title, description, cover_image, technologies, project_url, category, project_date, published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(title, description, cover, technologies || '[]', project_url, category, project_date, pub(published), sort_order || 0);
      res.redirect(`/${adminPath}/projects`);
    } catch (err) { next(err); }
  });

  router.post('/projects/:id', requireAuth, upload.single('cover_image'), async (req, res, next) => {
    try {
      const db = getDb();
      const { title, description, technologies, project_url, category, project_date, published, sort_order } = req.body;
      const cover = req.file ? `/uploads/${req.file.filename}` : req.body.existing_cover || '';
      await db.prepare(`UPDATE projects SET title=?, description=?, cover_image=?, technologies=?, project_url=?, category=?, project_date=?, published=?, sort_order=?, updated_at=datetime('now') WHERE id=?`)
        .run(title, description, cover, technologies || '[]', project_url, category, project_date, pub(published), sort_order || 0, req.params.id);
      res.redirect(`/${adminPath}/projects`);
    } catch (err) { next(err); }
  });

  router.post('/projects/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/projects`);
    } catch (err) { next(err); }
  });

  router.get('/applications', requireAuth, async (req, res, next) => {
    try {
      const items = await getDb().prepare('SELECT * FROM applications ORDER BY sort_order, created_at DESC').all();
      res.render('admin/applications/list', { title: 'Applications', adminPath, adminUsername: req.session.adminUsername, items });
    } catch (err) { next(err); }
  });

  router.get('/applications/new', requireAuth, (req, res) => {
    res.render('admin/applications/form', { title: 'Nouvelle application', adminPath, adminUsername: req.session.adminUsername, item: null });
  });

  router.get('/applications/:id/edit', requireAuth, async (req, res, next) => {
    try {
      const item = await getDb().prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!item) return res.status(404).send('Non trouvé');
      res.render('admin/applications/form', { title: 'Modifier application', adminPath, adminUsername: req.session.adminUsername, item });
    } catch (err) { next(err); }
  });

  router.post('/applications', requireAuth, upload.single('image'), async (req, res, next) => {
    try {
      const { title, description, technologies, app_url, platform, published, sort_order } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : '';
      await getDb().prepare(`INSERT INTO applications (title, description, image, technologies, app_url, platform, published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(title, description, image, technologies || '[]', app_url, platform, pub(published), sort_order || 0);
      res.redirect(`/${adminPath}/applications`);
    } catch (err) { next(err); }
  });

  router.post('/applications/:id', requireAuth, upload.single('image'), async (req, res, next) => {
    try {
      const { title, description, technologies, app_url, platform, published, sort_order } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image || '';
      await getDb().prepare(`UPDATE applications SET title=?, description=?, image=?, technologies=?, app_url=?, platform=?, published=?, sort_order=?, updated_at=datetime('now') WHERE id=?`)
        .run(title, description, image, technologies || '[]', app_url, platform, pub(published), sort_order || 0, req.params.id);
      res.redirect(`/${adminPath}/applications`);
    } catch (err) { next(err); }
  });

  router.post('/applications/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/applications`);
    } catch (err) { next(err); }
  });

  router.get('/campaigns', requireAuth, async (req, res, next) => {
    try {
      const items = await getDb().prepare('SELECT * FROM campaigns ORDER BY sort_order, created_at DESC').all();
      res.render('admin/campaigns/list', { title: 'Campagnes', adminPath, adminUsername: req.session.adminUsername, items, parseJson });
    } catch (err) { next(err); }
  });

  router.get('/campaigns/new', requireAuth, (req, res) => {
    res.render('admin/campaigns/form', { title: 'Nouvelle campagne', adminPath, adminUsername: req.session.adminUsername, item: null });
  });

  router.get('/campaigns/:id/edit', requireAuth, async (req, res, next) => {
    try {
      const item = await getDb().prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
      if (!item) return res.status(404).send('Non trouvé');
      res.render('admin/campaigns/form', { title: 'Modifier campagne', adminPath, adminUsername: req.session.adminUsername, item });
    } catch (err) { next(err); }
  });

  router.post('/campaigns', requireAuth, upload.array('screenshots', 10), async (req, res, next) => {
    try {
      const { client_name, objective, platform, strategy, results, description, statistics, comments, published, sort_order } = req.body;
      const screenshots = (req.files || []).map(f => `/uploads/${f.filename}`);
      await getDb().prepare(`INSERT INTO campaigns (client_name, objective, platform, strategy, results, description, screenshots, statistics, comments, published, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(client_name, objective, platform, strategy, results, description, JSON.stringify(screenshots), statistics || '{}', comments, pub(published), sort_order || 0);
      res.redirect(`/${adminPath}/campaigns`);
    } catch (err) { next(err); }
  });

  router.post('/campaigns/:id', requireAuth, upload.array('screenshots', 10), async (req, res, next) => {
    try {
      const { client_name, objective, platform, strategy, results, description, statistics, comments, published, sort_order } = req.body;
      let screenshots = parseJson(req.body.existing_screenshots, []);
      if (req.files?.length) screenshots = screenshots.concat(req.files.map(f => `/uploads/${f.filename}`));
      await getDb().prepare(`UPDATE campaigns SET client_name=?, objective=?, platform=?, strategy=?, results=?, description=?, screenshots=?, statistics=?, comments=?, published=?, sort_order=?, updated_at=datetime('now') WHERE id=?`)
        .run(client_name, objective, platform, strategy, results, description, JSON.stringify(screenshots), statistics || '{}', comments, pub(published), sort_order || 0, req.params.id);
      res.redirect(`/${adminPath}/campaigns`);
    } catch (err) { next(err); }
  });

  router.post('/campaigns/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/campaigns`);
    } catch (err) { next(err); }
  });

  router.get('/blog', requireAuth, async (req, res, next) => {
    try {
      const items = await getDb().prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
      res.render('admin/blog/list', { title: 'Blog', adminPath, adminUsername: req.session.adminUsername, items });
    } catch (err) { next(err); }
  });

  router.get('/blog/new', requireAuth, (req, res) => {
    res.render('admin/blog/form', { title: 'Nouvel article', adminPath, adminUsername: req.session.adminUsername, item: null });
  });

  router.get('/blog/:id/edit', requireAuth, async (req, res, next) => {
    try {
      const item = await getDb().prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
      if (!item) return res.status(404).send('Non trouvé');
      res.render('admin/blog/form', { title: 'Modifier article', adminPath, adminUsername: req.session.adminUsername, item });
    } catch (err) { next(err); }
  });

  router.post('/blog', requireAuth, upload.single('image'), async (req, res, next) => {
    try {
      const slugify = require('slugify');
      const { title, content, category, author, meta_title, meta_description, published, slug } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : '';
      const finalSlug = slug || slugify(title, { lower: true, strict: true, locale: 'fr' });
      await getDb().prepare(`INSERT INTO blog_posts (title, slug, content, image, category, author, meta_title, meta_description, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(title, finalSlug, content, image, category, author || 'Aroman EMETSHU', meta_title, meta_description, pub(published));
      res.redirect(`/${adminPath}/blog`);
    } catch (err) { next(err); }
  });

  router.post('/blog/:id', requireAuth, upload.single('image'), async (req, res, next) => {
    try {
      const slugify = require('slugify');
      const { title, content, category, author, meta_title, meta_description, published, slug } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : req.body.existing_image || '';
      const finalSlug = slug || slugify(title, { lower: true, strict: true, locale: 'fr' });
      await getDb().prepare(`UPDATE blog_posts SET title=?, slug=?, content=?, image=?, category=?, author=?, meta_title=?, meta_description=?, published=?, updated_at=datetime('now') WHERE id=?`)
        .run(title, finalSlug, content, image, category, author, meta_title, meta_description, pub(published), req.params.id);
      res.redirect(`/${adminPath}/blog`);
    } catch (err) { next(err); }
  });

  router.post('/blog/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/blog`);
    } catch (err) { next(err); }
  });

  router.get('/contacts', requireAuth, async (req, res, next) => {
    try {
      const items = await getDb().prepare('SELECT * FROM contact_requests ORDER BY created_at DESC').all();
      res.render('admin/contacts/list', { title: 'Demandes', adminPath, adminUsername: req.session.adminUsername, items, parseJson });
    } catch (err) { next(err); }
  });

  router.post('/contacts/:id/status', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('UPDATE contact_requests SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
      res.redirect(`/${adminPath}/contacts`);
    } catch (err) { next(err); }
  });

  router.post('/contacts/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM contact_requests WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/contacts`);
    } catch (err) { next(err); }
  });

  router.get('/analytics', requireAuth, async (req, res, next) => {
    try {
      const db = getDb();
      const visitors = (await db.prepare('SELECT COUNT(*) as c FROM visitors').get()).c;
      const pageViews = (await db.prepare('SELECT COUNT(*) as c FROM page_views').get()).c;
      const bySource = await db.prepare('SELECT source, COUNT(*) as count FROM visitors GROUP BY source ORDER BY count DESC').all();
      const byDevice = await db.prepare('SELECT device, COUNT(*) as count FROM visitors GROUP BY device ORDER BY count DESC').all();
      const byBrowser = await db.prepare('SELECT browser, COUNT(*) as count FROM visitors GROUP BY browser ORDER BY count DESC LIMIT 10').all();
      const topPages = await db.prepare('SELECT page_path, COUNT(*) as count FROM page_views GROUP BY page_path ORDER BY count DESC LIMIT 15').all();
      const recentVisitors = await db.prepare('SELECT * FROM visitors ORDER BY last_visit DESC LIMIT 50').all();
      const traffic = await getTrafficCharts(db);
      const chartData = {
        traffic,
        sources: chartRows(bySource, 'source'),
        devices: chartRows(byDevice, 'device'),
        browsers: chartRows(byBrowser, 'browser', 'count', 6),
        pages: chartRows(topPages, 'page_path', 'count', 8)
      };
      res.render('admin/analytics', { title: 'Statistiques', adminPath, adminUsername: req.session.adminUsername, visitors, pageViews, bySource, byDevice, byBrowser, topPages, recentVisitors, chartData });
    } catch (err) { next(err); }
  });

  router.get('/testimonials', requireAuth, async (req, res, next) => {
    try {
      const items = await getDb().prepare('SELECT * FROM testimonials ORDER BY sort_order').all();
      res.render('admin/testimonials/list', { title: 'Témoignages', adminPath, adminUsername: req.session.adminUsername, items });
    } catch (err) { next(err); }
  });

  router.get('/testimonials/new', requireAuth, (req, res) => {
    res.render('admin/testimonials/form', { title: 'Nouveau témoignage', adminPath, adminUsername: req.session.adminUsername, item: null });
  });

  router.get('/testimonials/:id/edit', requireAuth, async (req, res, next) => {
    try {
      const item = await getDb().prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
      if (!item) return res.status(404).send('Non trouvé');
      res.render('admin/testimonials/form', { title: 'Modifier témoignage', adminPath, adminUsername: req.session.adminUsername, item });
    } catch (err) { next(err); }
  });

  router.post('/testimonials', requireAuth, async (req, res, next) => {
    try {
      const { name, role, company, content, published, sort_order } = req.body;
      await getDb().prepare('INSERT INTO testimonials (name, role, company, content, published, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
        .run(name, role, company, content, pub(published), sort_order || 0);
      res.redirect(`/${adminPath}/testimonials`);
    } catch (err) { next(err); }
  });

  router.post('/testimonials/:id', requireAuth, async (req, res, next) => {
    try {
      const { name, role, company, content, published, sort_order } = req.body;
      await getDb().prepare('UPDATE testimonials SET name=?, role=?, company=?, content=?, published=?, sort_order=? WHERE id=?')
        .run(name, role, company, content, pub(published), sort_order || 0, req.params.id);
      res.redirect(`/${adminPath}/testimonials`);
    } catch (err) { next(err); }
  });

  router.post('/testimonials/:id/delete', requireAuth, async (req, res, next) => {
    try {
      await getDb().prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
      res.redirect(`/${adminPath}/testimonials`);
    } catch (err) { next(err); }
  });

  return router;
};

function parseJson(str, fallback = []) {
  if (str && typeof str === 'object') return str;
  try { return JSON.parse(str || ''); } catch { return fallback; }
}
