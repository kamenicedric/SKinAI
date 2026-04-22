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
const PORT = process.env.PORT || 3000;

// ── Sécurité ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS === "*"
  ? "*"
  : (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Logging ───────────────────────────────────────────────────
app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

// ── Body parsing (limite 15MB pour les images base64) ─────────
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// ── Rate limiter global ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_GENERAL) || 100,
  message: {
    success: false,
    error: "Trop de requêtes. Réessayez dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use("/api/analyze", analyzeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/products", productsRoutes);

// ── Health check général ──────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "✦ SKIN AI API",
    version: "1.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      analyze: "POST /api/analyze",
      analyzeHealth: "GET /api/analyze/health",
      history: "GET /api/history/:userId",
      historyDetail: "GET /api/history/detail/:id",
      historyStats: "GET /api/history/stats/global",
      products: "GET /api/products",
      productsById: "GET /api/products/:id",
      productCategories: "GET /api/products/categories/list",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── 404 & Error handlers ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("  ✦ SKIN AI Backend");
  console.log("  ─────────────────────────────────");
  console.log(`  🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`  🌍 Environnement : ${process.env.NODE_ENV || "development"}`);
  console.log(`  🤖 Anthropic API : ${process.env.ANTHROPIC_API_KEY ? "✓ Configurée" : "✗ Manquante"}`);
  console.log(`  🗄️  Supabase      : ${process.env.SUPABASE_URL ? "✓ Configuré" : "✗ Non configuré (optionnel)"}`);
  console.log("  ─────────────────────────────────");
  console.log("");
});

module.exports = app;
