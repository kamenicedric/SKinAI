require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const analyzeRoutes = require("./routes/analyze");
const historyRoutes = require("./routes/history");
const productsRoutes = require("./routes/products");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// ── Sécurité ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || "*",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Logging ───────────────────────────────────────────────────
app.use(morgan("dev"));

// ── Body parsing (15MB pour images base64) ────────────────────
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ── Rate limiter ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_GENERAL) || 100,
  message: { success: false, error: "Trop de requêtes. Réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use("/api/analyze", analyzeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/products", productsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    name: "✦ SKIN AI API",
    version: "1.0.0",
    status: "running ✓",
    platform: "Vercel Serverless",
    anthropic_configured: !!process.env.ANTHROPIC_API_KEY,
    supabase_configured: !!process.env.SUPABASE_URL,
    endpoints: {
      "POST /api/analyze":             "Analyse cutanée IA",
      "GET  /api/analyze/health":      "Statut clé API",
      "GET  /api/history/:userId":     "Historique utilisateur",
      "GET  /api/products":            "Catalogue produits",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── 404 & Errors ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Dev local uniquement ──────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n  ✦ SKIN AI Backend → http://localhost:${PORT}\n`);
  });
}

// ── Export pour Vercel Serverless ─────────────────────────────
module.exports = app;
