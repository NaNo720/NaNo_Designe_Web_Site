-- ==============================================================================
-- NANO DESIGN STUDIO DAKAR — SCRIPT DE SYNCHRONISATION MULTI-APPAREILS
-- Exécutez ce script dans Supabase Dashboard > SQL Editor > New Query > RUN
-- Lien direct : https://supabase.com/dashboard/project/cdttbypmfpzqmwtmkqjk/sql/new
-- ==============================================================================

-- 1. Table des Réalisations du Studio (Portfolio)
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    description TEXT,
    tags TEXT,
    image_url TEXT,
    project_url TEXT
);

-- Index pour vitesse maximale d'affichage
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.portfolio_projects(created_at DESC);

-- 2. Sécurité RLS pour le Portfolio (Lecture publique + Gestion Studio)
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permettre lecture publique du portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre lecture publique du portfolio"
ON public.portfolio_projects FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permettre gestion du portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre gestion du portfolio"
ON public.portfolio_projects FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Table des Visites & Télémétrie d'Audience (Analytics Réel)
CREATE TABLE IF NOT EXISTS public.site_visits (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    section TEXT DEFAULT 'accueil',
    country TEXT DEFAULT 'Sénégal',
    is_conversion BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at DESC);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permettre insertion visites" ON public.site_visits;
CREATE POLICY "Permettre insertion visites"
ON public.site_visits FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Permettre lecture visites" ON public.site_visits;
CREATE POLICY "Permettre lecture visites"
ON public.site_visits FOR SELECT
USING (true);

-- 4. Publication Realtime pour synchronisation en direct PC / Mobile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'portfolio_projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_projects;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_visits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
  END IF;
END $$;
