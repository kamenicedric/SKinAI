const express = require("express");
const rateLimit = require("express-rate-limit");
const { analyzeSkin } = require("../services/aiService");
const { saveAnalysis } = require("../services/dbService");
const { validateAnalyze, checkImageSize } = require("../middleware/validation");

const router = express.Router();

// ── Rate limiter spécifique pour l'analyse (coûteuse) ─────────
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: parseInt(process.env.RATE_LIMIT_ANALYZE) || 10,
  message: {
    success: false,
    error: "Trop d'analyses. Vous pouvez effectuer 10 analyses par heure maximum.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // limiter par IP
});

// ── POST /api/analyze ─────────────────────────────────────────
// Corps attendu :
//   image      : string (base64, sans data:image/...;base64,)
//   mediaType  : "image/jpeg" | "image/png" | "image/webp"
//   skinType   : "Grasse" | "Sèche" | "Mixte" | "Normale" | "Sensible"
//   concerns   : string[]  (ex: ["Acné", "Taches"])
//   userId     : string? (UUID Supabase optionnel)
router.post(
  "/",
  analyzeLimiter,
  validateAnalyze,
  checkImageSize,
  async (req, res, next) => {
    const { image, mediaType, skinType, concerns, userId } = req.body;
    const startTime = Date.now();

    try {
      console.log(
        `[ANALYZE] skinType=${skinType} concerns=${concerns.join(",")} userId=${userId || "anonymous"}`
      );

      // Analyse IA
      const result = await analyzeSkin({
        base64Image: image,
        mediaType,
        skinType,
        concerns,
      });

      const duration = Date.now() - startTime;
      console.log(`[ANALYZE] ✓ score=${result.score_global} durée=${duration}ms`);

      // Sauvegarde en base (Supabase) — non bloquant
      saveAnalysis({ userId, result, skinType, concerns }).catch((e) =>
        console.error("[DB] Erreur saveAnalysis:", e.message)
      );

      return res.status(200).json({
        success: true,
        data: result,
        meta: {
          duration_ms: duration,
          model: "claude-sonnet-4-20250514",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/analyze/health ───────────────────────────────────
// Vérifie que la clé API Anthropic est configurée
router.get("/health", (req, res) => {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    success: true,
    api_configured: hasKey,
    model: "claude-sonnet-4-20250514",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
