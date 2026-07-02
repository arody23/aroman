# Aroman EMETSHU — Portfolio v3 (Next.js)

Site portfolio dynamique avec **admin**, **blog**, **contact** et **Supabase**.

> Ancien code Express archivé dans `_legacy-express/`

## Stack

- **Next.js 15** (App Router) — déploiement natif Vercel, sans timeout Express
- **Supabase** — base de données
- **React** — pages et admin

## Démarrage local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Variables d'environnement

Copier `.env.example` vers `.env` :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `SUPABASE_URL` | Oui | URL projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | Clé service_role (dashboard Supabase → API) |
| `SESSION_SECRET` | Recommandé | 32+ caractères (sessions admin) |
| `ADMIN_PATH` | Non | Défaut : `gestion-interne-aroman` |
| `SITE_URL` | Non | Défaut auto sur Vercel |

## Admin

- URL : `/gestion-interne-aroman/login`
- Connexion avec le compte dans la table `admins` (Supabase)

## Déploiement Vercel

1. Importer le repo **arody23/aroman**
2. Framework : **Next.js** (détecté automatiquement)
3. Ajouter les variables :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
4. Deploy

Test : `https://votre-site.vercel.app/api/health/env` → `{"ok":true,"stack":"nextjs"}`

## Pages publiques

- `/` Accueil
- `/expertises`, `/a-propos`, `/contact`
- `/realisations`, `/applications`, `/campagnes`
- `/blog`, `/blog/[slug]`

## Repo

https://github.com/arody23/aroman
