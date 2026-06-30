# Configuration Supabase

Ce guide explique comment connecter votre portfolio à Supabase pour une sauvegarde cloud fiable.

## Étape 1 — Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com) et créez un compte
2. Cliquez **New project**
3. Choisissez un nom (ex. `aroman-portfolio`), un mot de passe base de données, et une région proche (ex. `eu-west-1`)

## Étape 2 — Créer les tables

1. Dans le dashboard Supabase, ouvrez **SQL Editor**
2. Cliquez **New query**
3. Copiez-collez tout le contenu du fichier `supabase/schema.sql`
4. Cliquez **Run**

## Étape 3 — Récupérer vos clés

1. Allez dans **Project Settings** → **API**
2. Notez ces deux valeurs :

| Champ | Où le trouver |
|-------|---------------|
| **Project URL** | `https://xxxxx.supabase.co` |
| **service_role key** | Section *Project API keys* → `service_role` (secret) |

> **Important** : utilisez uniquement la clé `service_role` côté serveur (fichier `.env`). Ne la mettez jamais dans le code frontend ni dans Git.

## Étape 4 — Configurer le fichier `.env`

Ajoutez ces lignes à votre fichier `.env` :

```env
DATABASE_DRIVER=supabase
SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sans ces variables, le site utilise SQLite local (`data/portfolio.db`).

## Étape 5 — Installer la dépendance et tester

```bash
npm install @supabase/supabase-js
npm run test-supabase
```

Si la connexion réussit, vous verrez : `✓ Connexion Supabase OK`.

## Étape 6 — Redémarrer le serveur

```bash
npm run dev
```

---

## Récapitulatif des variables

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_DRIVER` | Non | `sqlite` (défaut) ou `supabase` |
| `SUPABASE_URL` | Si supabase | URL du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | Si supabase | Clé secrète serveur |

## Sauvegarde des données

Avec Supabase, vos données sont automatiquement sauvegardées dans le cloud. Vous pouvez aussi :

- **Exporter** : Dashboard → Database → Backups (plan payant) ou SQL dump
- **Importer** : SQL Editor pour insérer des données manuellement

## Sécurité

- Ne commitez jamais le fichier `.env`
- La clé `anon` (publique) ne suffit pas pour l'admin — le backend utilise `service_role`
- Changez `ADMIN_PASSWORD` et `SESSION_SECRET` en production
