const express = require('express');
const path = require('path');
const pageRoutes = require('./routes/pages');

const app = express();
const SITE_URL = process.env.SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const SITE_NAME = process.env.SITE_NAME || 'Aroman EMETSHU';

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.locals.adminPath = process.env.ADMIN_PATH || 'gestion-interne-aroman';
app.locals.siteUrl = SITE_URL;
app.locals.siteName = SITE_NAME;

app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }));
app.use('/', pageRoutes({ siteUrl: SITE_URL, siteName: SITE_NAME }));

app.use((_req, res) => {
  res.status(404).render('pages/404', {
    siteUrl: SITE_URL,
    siteName: SITE_NAME,
    title: 'Page introuvable',
    description: 'La page demandée n\'existe pas.',
    canonical: SITE_URL
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (!res.headersSent) res.status(500).send('Erreur serveur');
});

module.exports = app;
