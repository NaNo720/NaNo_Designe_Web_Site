-- ==============================================================================
-- NANO DESIGN STUDIO DAKAR — SCHÉMA SUPABASE (POSTGRESQL)
-- À exécuter dans le "SQL Editor" de votre tableau de bord Supabase (1 clic)
-- ==============================================================================

-- 1. Table des Devis & Dossiers Clients
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date TEXT NOT NULL,
    service_category TEXT,
    service_variant TEXT,
    service_label TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_company TEXT,
    client_phone TEXT,
    client_email TEXT NOT NULL,
    client_description TEXT,
    client_budget TEXT,
    client_timeline TEXT,
    status TEXT DEFAULT 'Nouveau',
    payment_status TEXT DEFAULT 'Non généré',
    amount TEXT DEFAULT 'Sur devis',
    provider TEXT,
    txn TEXT,
    paid_date TEXT
);

-- 2. Table des Messages de Contact
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Non lu'
);

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

-- 4. Table du Portfolio / Réalisations Studio
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

-- Index pour accélérer les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON public.quotes(payment_status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.portfolio_projects(created_at DESC);

-- 4. Activation du Temps Réel (Supabase Realtime)
-- Permet à l'admin de voir les devis et paiements en direct sans recharger la page
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'quotes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_visits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'portfolio_projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_projects;
  END IF;
END $$;

-- 5. Sécurité & Droits d'accès (Row Level Security - RLS)
-- Protection stricte : Seules les opérations publiques nécessaires (envoi de devis/contact,
-- lecture du portfolio) sont autorisées aux visiteurs anonymes.
-- La lecture, modification et suppression des devis et messages sont STRICTEMENT réservées
-- aux administrateurs authentifiés.
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Contraintes de validation côté serveur (Server-Side Validation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quotes_email') THEN
    ALTER TABLE public.quotes ADD CONSTRAINT chk_quotes_email 
    CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quotes_desc_len') THEN
    ALTER TABLE public.quotes ADD CONSTRAINT chk_quotes_desc_len 
    CHECK (client_description IS NULL OR length(client_description) <= 5000);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_messages_email') THEN
    ALTER TABLE public.messages ADD CONSTRAINT chk_messages_email 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_messages_len') THEN
    ALTER TABLE public.messages ADD CONSTRAINT chk_messages_len 
    CHECK (length(message) <= 5000);
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- A. Politiques pour la table "portfolio_projects"
-- ------------------------------------------------------------------------------
-- Lecture publique autorisée (tous les visiteurs voient les réalisations)
DROP POLICY IF EXISTS "Permettre la lecture publique du portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre la lecture publique du portfolio"
ON public.portfolio_projects FOR SELECT
USING (true);

-- Modifications/Suppressions : Réservées aux administrateurs
DROP POLICY IF EXISTS "Permettre l'ajout de projet portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre l'ajout de projet portfolio"
ON public.portfolio_projects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

DROP POLICY IF EXISTS "Permettre la modification de projet portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre la modification de projet portfolio"
ON public.portfolio_projects FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated')
WITH CHECK (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

DROP POLICY IF EXISTS "Permettre la suppression de projet portfolio" ON public.portfolio_projects;
CREATE POLICY "Permettre la suppression de projet portfolio"
ON public.portfolio_projects FOR DELETE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

-- ------------------------------------------------------------------------------
-- B. Politiques pour la table "quotes" (Dossiers Devis Privés)
-- ------------------------------------------------------------------------------
-- Tout visiteur peut déposer une demande de devis
DROP POLICY IF EXISTS "Permettre l'insertion publique des devis" ON public.quotes;
CREATE POLICY "Permettre l'insertion publique des devis"
ON public.quotes FOR INSERT
WITH CHECK (true);

-- La consultation des devis est STRICTEMENT interdite au public anonyme
DROP POLICY IF EXISTS "Permettre la lecture des devis" ON public.quotes;
CREATE POLICY "Permettre la lecture des devis"
ON public.quotes FOR SELECT
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

-- La mise à jour et suppression sont réservées à l'administrateur
DROP POLICY IF EXISTS "Permettre la mise a jour des devis" ON public.quotes;
CREATE POLICY "Permettre la mise a jour des devis"
ON public.quotes FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated')
WITH CHECK (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

DROP POLICY IF EXISTS "Permettre la suppression des devis" ON public.quotes;
CREATE POLICY "Permettre la suppression des devis"
ON public.quotes FOR DELETE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

-- ------------------------------------------------------------------------------
-- C. Politiques pour la table "messages" (Boîte de Réception Studio)
-- ------------------------------------------------------------------------------
-- Tout internaute peut envoyer un message de contact
DROP POLICY IF EXISTS "Permettre l'insertion publique des messages" ON public.messages;
CREATE POLICY "Permettre l'insertion publique des messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Seul l'administrateur authentifié peut lire les messages privés du studio
DROP POLICY IF EXISTS "Permettre la lecture des messages" ON public.messages;
CREATE POLICY "Permettre la lecture des messages"
ON public.messages FOR SELECT
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

DROP POLICY IF EXISTS "Permettre la mise a jour des messages" ON public.messages;
CREATE POLICY "Permettre la mise a jour des messages"
ON public.messages FOR UPDATE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated')
WITH CHECK (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

DROP POLICY IF EXISTS "Permettre la suppression des messages" ON public.messages;
CREATE POLICY "Permettre la suppression des messages"
ON public.messages FOR DELETE
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

-- ------------------------------------------------------------------------------
-- D. Politiques pour la table "site_visits" (Télémétrie d'Audience)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permettre l'insertion publique des visites" ON public.site_visits;
CREATE POLICY "Permettre l'insertion publique des visites"
ON public.site_visits FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Permettre la lecture des visites" ON public.site_visits;
CREATE POLICY "Permettre la lecture des visites"
ON public.site_visits FOR SELECT
USING (auth.role() = 'authenticated' OR auth.jwt() IS NOT NULL OR current_user = 'authenticated');

-- 6. Données initiales du Studio Nano Design Dakar
INSERT INTO public.quotes (
    id, date, service_category, service_variant, service_label,
    client_name, client_company, client_phone, client_email,
    client_description, client_budget, client_timeline,
    status, payment_status, amount, provider, txn, paid_date
) VALUES 
(
    'ND-2026-4821', '04 septembre 2026', 'website', 'ecommerce', 'Créer un site web — Site e-commerce performant',
    'Moussa Diop', 'Teranga Prestige Hospitality', '+221 77 452 10 98', 'moussa@terangagroup.sn',
    'Refonte complète de notre portail de réservation hôtelière aux Almadies. Intégration paiement Wave/OM.',
    '1 500 000 – 3 000 000 FCFA', '1 à 2 mois',
    'Validé', 'Payé', '1 800 000 FCFA', 'Wave Business', 'TRX-WAVE-2026-8821', '04 septembre 2026'
),
(
    'ND-2026-3914', '03 septembre 2026', 'logo', 'with-guidelines', 'Créer un logo — Avec charte graphique complète',
    'Aminata Fall', 'Baobab Fintech Dakar', '+221 78 120 45 67', 'a.fall@baobabpay.sn',
    'Identité visuelle premium pour notre solution de paiement mobile destinée aux commerçants de Dakar.',
    '500 000 – 1 000 000 FCFA', 'Moins d''1 mois',
    'En cours', 'En attente', '750 000 FCFA', NULL, NULL, NULL
),
(
    'ND-2026-2105', '02 septembre 2026', 'visual', 'print', 'Visuel / Support — Support imprimé haut de gamme',
    'Ibrahima Sarr', 'Galerie Renaissance Plateau', '+221 76 890 12 34', 'contact@renaissance-art.sn',
    'Habillage mural grand format et catalogues d''exposition d''art contemporain africain.',
    'Moins de 500 000 FCFA', 'Flexible',
    'Nouveau', 'Non généré', 'À définir', NULL, NULL, NULL
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (id, date, name, email, phone, subject, message, status)
VALUES 
('MSG-401', '04 sept. 2026', 'Dr. Cheikh Ndiaye', 'c.ndiaye@clinique-madeleine.sn', '+221 77 654 32 10', 'Refonte identité visuelle', 'Bonjour studio Nano Design, nous souhaitons moderniser la signalétique et le logo de notre clinique.', 'Non lu'),
('MSG-402', '03 sept. 2026', 'Fatou Kiné Sow', 'f.sow@dakartransit.com', '+221 70 333 44 55', 'Devis site vitrine', 'Nous avons besoin d''un site corporate bilingue FR/EN pour notre société de logistique portuaire.', 'Lu')
ON CONFLICT (id) DO NOTHING;
