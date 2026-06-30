-- Schéma Supabase pour le portfolio Aroman EMETSHU
-- Exécuter dans : Supabase Dashboard → SQL Editor → New query → Run

-- Projets web
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  technologies JSONB DEFAULT '[]',
  project_url TEXT,
  category TEXT,
  project_date TEXT,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  technologies JSONB DEFAULT '[]',
  app_url TEXT,
  platform TEXT,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campagnes marketing
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  objective TEXT,
  platform TEXT,
  strategy TEXT,
  results TEXT,
  description TEXT,
  screenshots JSONB DEFAULT '[]',
  statistics JSONB DEFAULT '{}',
  comments TEXT,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  image TEXT,
  category TEXT,
  author TEXT DEFAULT 'Aroman EMETSHU',
  meta_title TEXT,
  meta_description TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demandes de contact
CREATE TABLE IF NOT EXISTS contact_requests (
  id BIGSERIAL PRIMARY KEY,
  services JSONB DEFAULT '[]',
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visiteurs
CREATE TABLE IF NOT EXISTS visitors (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  source TEXT,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW()
);

-- Pages vues
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  visitor_id BIGINT REFERENCES visitors(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Témoignages
CREATE TABLE IF NOT EXISTS testimonials (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Administrateurs
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_visitors_session ON visitors(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);

-- Activer Row Level Security (recommandé)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Lecture publique (contenu publié uniquement)
CREATE POLICY "public_read_projects" ON projects FOR SELECT USING (published = true);
CREATE POLICY "public_read_applications" ON applications FOR SELECT USING (published = true);
CREATE POLICY "public_read_campaigns" ON campaigns FOR SELECT USING (published = true);
CREATE POLICY "public_read_blog" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (published = true);

-- Insertion contact (visiteurs anonymes)
CREATE POLICY "public_insert_contact" ON contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_visitors" ON visitors FOR UPDATE USING (true);
CREATE POLICY "public_insert_page_views" ON page_views FOR INSERT WITH CHECK (true);

-- Le service_role (backend) contourne RLS — ne jamais exposer cette clé côté client
