const express = require("express");
const { getUserHistory, getAnalysisById, getGlobalStats } = require("../services/dbService");

const router = express.Router();

// ── GET /api/history/:userId ───────────────────────────────────
// Récupère l'historique des analyses d'un utilisateur
router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    if (!userId || userId.length < 5) {
      return res.status(400).json({ success: false, error: "userId invalide." });
    }

    const history = await getUserHistory(userId, limit);

    return res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/history/detail/:id ────────────────────────────────
// Récupère une analyse complète par son ID
router.get("/detail/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = await getAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({ success: false, error: "Analyse introuvable." });
    }

    return res.json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/history/stats/global ─────────────────────────────
// Statistiques globales (admin / dashboard)
router.get("/stats/global", async (req, res, next) => {
  try {
    const stats = await getGlobalStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
