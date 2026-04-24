// ── Gestion centralisée des erreurs ───────────────────────────

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);

  // Erreur Axios (appel API Anthropic)
  if (err.isAxiosError) {
    const status = err.response?.status;
    const msg = err.response?.data?.error?.message;
    const normalizedMsg = (msg || "").toLowerCase();

    if (status === 401) {
      return res.status(401).json({
        success: false,
        error: "Clé API Anthropic invalide ou expirée.",
      });
    }
    if (
      status === 400 &&
      (normalizedMsg.includes("credit balance is too low") || normalizedMsg.includes("insufficient"))
    ) {
      return res.status(402).json({
        success: false,
        error: "Crédits IA insuffisants. Rechargez votre compte",
      });
    }
    if (status === 429) {
      return res.status(429).json({
        success: false,
        error: "Quota API Anthropic dépassé. Réessayez dans quelques minutes.",
      });
    }
    if (status === 400 && msg?.includes("image")) {
      return res.status(400).json({
        success: false,
        error: "Image non reconnue. Vérifiez le format (JPEG, PNG, WebP).",
      });
    }
    return res.status(502).json({
      success: false,
      error: msg || "Erreur lors de l'appel à l'IA. Réessayez.",
    });
  }

  // Timeout
  if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
    return res.status(504).json({
      success: false,
      error: "L'analyse a pris trop de temps. Réessayez avec une photo plus légère.",
    });
  }

  // Erreur JSON parse
  if (err.message?.includes("JSON")) {
    return res.status(422).json({
      success: false,
      error: "L'IA n'a pas pu analyser cette photo. Essayez avec une meilleure lumière.",
    });
  }

  // Erreur générique
  return res.status(500).json({
    success: false,
    error: err.message || "Erreur interne du serveur.",
  });
}

// ── Route non trouvée ──────────────────────────────────────────
function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Route introuvable : ${req.method} ${req.path}`,
  });
}

module.exports = { errorHandler, notFound };
