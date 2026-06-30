const express = require('express');
const { getDb } = require('../db');

module.exports = function publicRoutes() {
  const router = express.Router();

  router.post('/contact', async (req, res) => {
    try {
      const db = getDb();
      const { name, company, phone, email, description, services } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Nom et email requis.' });
      }
      const servicesArr = Array.isArray(services) ? services : (services ? [services] : []);
      await db.prepare(`
        INSERT INTO contact_requests (services, name, company, phone, email, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(JSON.stringify(servicesArr), name, company || '', phone || '', email, description || '');
      res.json({ success: true, message: 'Votre demande a été envoyée avec succès.' });
    } catch (err) {
      console.error('Contact error:', err);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  return router;
};
