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

// Railway injecte le PORT automatiquement — NE PAS le fixer en dur
const PORT = process.env.PORT || 3000;

// ── Sécurité ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS === "*"
  ? "*"
  : (process.env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Logging ───────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body parsing (15MB max pour images base64) ────────────────
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ── Rate limiter global ───────────────────────────────────────
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

// ── Health check Railway ──────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    name: "✦ SKIN AI API",
    version: "1.0.0",
    status: "running ✓",
    environment: process.env.NODE_ENV || "production",
    anthropic_configured: !!process.env.ANTHROPIC_API_KEY,
    supabase_configured: !!process.env.SUPABASE_URL,
    endpoints: {
      "POST /api/analyze":              "Lancer une analyse cutanée IA",
      "GET  /api/analyze/health":       "Statut de la clé API",
      "GET  /api/history/:userId":      "Historique d'un utilisateur",
      "GET  /api/history/detail/:id":   "Détail d'une analyse",
      "GET  /api/products":             "Catalogue produits",
      "GET  /api/products/categories/list": "Catégories disponibles",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── 404 & Error handlers ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("  ✦ ─────────────────────────────── ✦");
  console.log("         SKIN AI Backend démarré");
  console.log("  ✦ ─────────────────────────────── ✦");
  console.log(`  🚀  Port         : ${PORT}`);
  console.log(`  🌍  Environnement: ${process.env.NODE_ENV || "production"}`);
  console.log(`  🤖  Anthropic    : ${process.env.ANTHROPIC_API_KEY ? "✓ OK" : "✗ MANQUANTE — configurer dans Railway"}`);
  console.log(`  🗄️   Supabase    : ${process.env.SUPABASE_URL ? "✓ OK" : "○ Non configuré (optionnel)"}`);
  console.log("  ✦ ─────────────────────────────── ✦");
  console.log("");
});

module.exports = app;
