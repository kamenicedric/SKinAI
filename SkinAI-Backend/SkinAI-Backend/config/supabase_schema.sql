-- ============================================================
-- SKIN AI — Script SQL Supabase
-- Exécute ce script dans l'éditeur SQL de Supabase
-- ============================================================

-- ── Table des analyses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  score_global INTEGER NOT NULL CHECK (score_global >= 0 AND score_global <= 100),
  type_peau TEXT NOT NULL,
  resume TEXT,
  skin_type_declared TEXT,
  concerns TEXT[],
  result_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour accélérer les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- ── Table des produits (optionnel — en complément du catalogue statique) ──
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categorie TEXT NOT NULL,
  nom TEXT NOT NULL,
  marque TEXT,
  emoji TEXT,
  pour TEXT[],
  description TEXT,
  prix TEXT,
  disponible TEXT[],
  note DECIMAL(2,1),
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Table des utilisateurs (profil étendu) ────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  skin_type TEXT,
  concerns TEXT[],
  nombre_analyses INTEGER DEFAULT 0,
  score_moyen DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Policies RLS (Row Level Security) ────────────────────────
-- Activer RLS sur les tables
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir uniquement leurs propres analyses
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Le service backend (service_role) peut tout faire
CREATE POLICY "Service role full access analyses"
  ON analyses FOR ALL
  USING (true)
  WITH CHECK (true);

-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les produits sont publics en lecture
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (actif = true);

-- ── Vue : statistiques par utilisateur ───────────────────────
CREATE OR REPLACE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) AS total_analyses,
  ROUND(AVG(score_global), 1) AS score_moyen,
  MAX(score_global) AS meilleur_score,
  MIN(score_global) AS score_min,
  MAX(created_at) AS derniere_analyse
FROM analyses
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- ── Fonction trigger : mettre à jour le profil après chaque analyse ──
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nombre_analyses, score_moyen, updated_at)
  VALUES (
    NEW.user_id,
    1,
    NEW.score_global,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre_analyses = profiles.nombre_analyses + 1,
    score_moyen = (profiles.score_moyen * profiles.nombre_analyses + NEW.score_global) / (profiles.nombre_analyses + 1),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger déclenché après chaque analyse avec un user_id
CREATE OR REPLACE TRIGGER trigger_update_profile_stats
  AFTER INSERT ON analyses
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION update_profile_stats();
