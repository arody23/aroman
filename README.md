# Aroman EMETSHU — Portfolio Premium v2.0

Plateforme professionnelle combinant portfolio développeur logiciel et Media Buyer, avec administration complète, blog dynamique et statistiques visiteurs.

## Stack technique

- **Backend** : Node.js, Express
- **Base de données** : SQLite (better-sqlite3)
- **Vues** : EJS (server-side rendering pour le SEO)
- **Frontend** : CSS premium, JavaScript vanilla
- **Sécurité** : bcrypt, sessions sécurisées, helmet, rate limiting

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Initialiser la base de données et l'admin
npm run init-db

# Lancer le serveur
npm run dev
```

- **Site** : http://localhost:3000
- **Administration** : http://localhost:3000/gestion-interne-aroman

> L'URL d'administration est configurable via `ADMIN_PATH` dans `.env`. Aucun lien public ne pointe vers l'admin.

## Configuration (.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Port du serveur |
| `SESSION_SECRET` | Secret des sessions (à changer en production) |
| `ADMIN_PATH` | URL privée de l'administration |
| `ADMIN_USERNAME` | Identifiant admin |
| `ADMIN_PASSWORD` | Mot de passe admin |
| `SITE_URL` | URL canonique du site |
| `SITE_NAME` | Nom du site |

## Fonctionnalités

### Site public
- Page d'accueil premium (Hero, Présentation, Expertises, Réalisations, Campagnes, Blog, Témoignages, Contact)
- Formulaire de demande de projet (multi-services)
- Blog avec articles SEO
- Réalisations, applications et campagnes dynamiques
- SEO : JSON-LD, sitemap.xml, robots.txt, Open Graph, Twitter Cards

### Administration
- Gestion des projets web, applications, campagnes marketing
- Blog avec champs SEO
- Témoignages
- Demandes de contact reçues
- Statistiques visiteurs (IP, appareil, navigateur, source, pages vues)

## Structure

```
├── server/           # Backend Express
│   ├── app.js        # Point d'entrée
│   ├── db.js         # Schéma SQLite
│   ├── middleware/   # Auth, analytics, upload
│   └── routes/       # Pages, API, admin
├── views/            # Templates EJS
├── public/           # Assets statiques + uploads
├── data/             # Base SQLite
└── views/            # Templates EJS
```

## Production

### Vercel (recommandé pour ce repo)

Le domaine `aromanemetshu.com` doit pointer vers un déploiement Vercel connecté à ce dépôt GitHub.

**Important** : après chaque push, vérifiez que Vercel a bien redéployé. Le nouveau site répond sur `/health/env` (pas une page HTML statique).

### Diagnostic rapide

| URL | Ancien site (mauvais) | Nouveau site (bon) |
|-----|----------------------|-------------------|
| `/health/env` | 404 NOT_FOUND | `{"ok":true,...}` |
| `/deploy-check.txt` | 404 | `deploy=node-express-v2` |
| Page d'accueil | « Média Buyer & Consultant Meta Ads » | « Développeur & Media Buyer » |

### Si l'ancien site s'affiche encore sur Vercel

Le domaine pointe vers Vercel, mais le **projet Vercel** n'utilise pas le bon code. Vérifiez :

1. **Settings → Git** : repo = `arody23/aroman`, branche = `main`
2. **Settings → General → Root Directory** : **vide** (pas `legacy`)
3. **Settings → General → Framework Preset** : **Other**
4. **Settings → General → Output Directory** : **vide**
5. **Deployments** : ouvrir le dernier deploy → si **Build Failed**, lire les logs
6. **Domains** : `aromanemetshu.com` doit être sur **ce** projet (retirer du projet orbis ou autre)
7. Si rien ne change : **supprimer le projet Vercel** et le **réimporter** depuis `arody23/aroman`

1. Importer le repo `arody23/aroman` dans [Vercel](https://vercel.com) — Framework Preset : **Other**
2. Ne pas définir de « Output Directory » (laisser vide)
2. Ajouter les variables d'environnement (**pas besoin de DATABASE_URL**) :
   - `NODE_ENV=production`
   - `DATABASE_DRIVER=supabase`
   - `SUPABASE_URL` (ex: `https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (clé secrète du dashboard Supabase)
   - `SESSION_SECRET`
   - `ADMIN_PATH`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - `SITE_URL=https://aromanemetshu.com`
3. Déployer — l'app utilise l'API Supabase en HTTPS (compatible serverless)

### Serveur Node classique

1. Définir `NODE_ENV=production`
2. Changer `SESSION_SECRET`, `ADMIN_PASSWORD`
3. Configurer `SITE_URL` avec le domaine réel
4. Utiliser un reverse proxy (Nginx) avec HTTPS
5. `npm start`

## Contact

- Email : contact@aromanemetshu.com
- WhatsApp : +242 06 745 8011
- Site : https://aromanemetshu.com
