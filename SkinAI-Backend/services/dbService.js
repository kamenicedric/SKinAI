const supabase = require("../config/supabase");

// ── Sauvegarder une analyse ────────────────────────────────────
async function saveAnalysis({ userId, result, skinType, concerns }) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userId || null,
      score_global: result.score_global,
      type_peau: result.type_peau_detecte,
      resume: result.resume,
      skin_type_declared: skinType,
      concerns: concerns,
      result_json: result,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase saveAnalysis error:", error.message);
    return null;
  }

  return data;
}

// ── Récupérer l'historique d'un utilisateur ────────────────────
async function getUserHistory(userId, limit = 20) {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("analyses")
    .select("id, score_global, type_peau, resume, created_at, skin_type_declared, concerns")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase getUserHistory error:", error.message);
    return [];
  }

  return data || [];
}

// ── Récupérer une analyse par ID ────────────────────────────────
async function getAnalysisById(id) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ── Statistiques globales ──────────────────────────────────────
async function getGlobalStats() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("analyses")
    .select("score_global, type_peau, created_at");

  if (error) return null;

  const total = data.length;
  const avgScore = total
    ? Math.round(data.reduce((a, b) => a + b.score_global, 0) / total)
    : 0;

  const typeCounts = data.reduce((acc, a) => {
    acc[a.type_peau] = (acc[a.type_peau] || 0) + 1;
    return acc;
  }, {});

  return { total, avgScore, typeCounts };
}

module.exports = {
  saveAnalysis,
  getUserHistory,
  getAnalysisById,
  getGlobalStats,
};
