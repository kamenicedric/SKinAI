const express = require("express");

const router = express.Router();

// ── Catalogue de produits statique (en attendant Supabase) ─────
// Ces produits sont adaptés aux peaux africaines / disponibles en Afrique
const PRODUCTS_CATALOG = [
  // Nettoyants
  {
    id: "p001",
    categorie: "Nettoyant",
    nom: "CeraVe Mousse Nettoyante",
    marque: "CeraVe",
    emoji: "🧴",
    pour: ["Grasse", "Mixte", "Acné"],
    description: "Nettoyant doux avec céramides. Idéal pour peau acnéique.",
    prix: "8.000 - 15.000 FCFA",
    disponible: ["Pharmacie", "Jumia"],
    note: 4.8,
  },
  {
    id: "p002",
    categorie: "Nettoyant",
    nom: "Black Soap (Savon Noir Africain)",
    marque: "Dudu-Osun",
    emoji: "🪨",
    pour: ["Grasse", "Acné", "Taches"],
    description: "Savon traditionnel africain au karité et à l'huile de palme. Purifiant naturel.",
    prix: "1.500 - 4.000 FCFA",
    disponible: ["Marché", "Pharmacie", "Jumia"],
    note: 4.6,
  },
  {
    id: "p003",
    categorie: "Nettoyant",
    nom: "La Roche-Posay Toleriane Hydrating Gentle",
    marque: "La Roche-Posay",
    emoji: "💧",
    pour: ["Sèche", "Sensible", "Normale"],
    description: "Nettoyant ultra-doux pour peaux sensibles et sèches.",
    prix: "10.000 - 18.000 FCFA",
    disponible: ["Pharmacie", "Amazon"],
    note: 4.9,
  },
  // Sérums
  {
    id: "p004",
    categorie: "Sérum",
    nom: "Sérum Vitamine C 20%",
    marque: "TruSkin",
    emoji: "✨",
    pour: ["Taches", "Teint terne", "Rides"],
    description: "Éclaircit les taches d'hyperpigmentation. Parfait pour peaux africaines.",
    prix: "12.000 - 20.000 FCFA",
    disponible: ["Amazon", "Jumia"],
    note: 4.7,
  },
  {
    id: "p005",
    categorie: "Sérum",
    nom: "Niacinamide 10% + Zinc 1%",
    marque: "The Ordinary",
    emoji: "🔬",
    pour: ["Acné", "Pores", "Grasse"],
    description: "Réduit les pores et contrôle le sébum. Excellent rapport qualité/prix.",
    prix: "5.000 - 10.000 FCFA",
    disponible: ["Sephora", "Amazon", "Jumia"],
    note: 4.8,
  },
  {
    id: "p006",
    categorie: "Sérum",
    nom: "Hyaluronic Acid 2% + B5",
    marque: "The Ordinary",
    emoji: "💦",
    pour: ["Sèche", "Sensible", "Rides"],
    description: "Hydratation intense en profondeur. Repulpe et lisse les ridules.",
    prix: "5.000 - 9.000 FCFA",
    disponible: ["Sephora", "Amazon"],
    note: 4.7,
  },
  // Hydratants
  {
    id: "p007",
    categorie: "Hydratant",
    nom: "Beurre de Karité Pur",
    marque: "Naturel",
    emoji: "🥜",
    pour: ["Sèche", "Sensible", "Normale"],
    description: "Hydratant naturel africain par excellence. Nourrit et protège.",
    prix: "2.000 - 6.000 FCFA",
    disponible: ["Marché", "Pharmacie"],
    note: 4.9,
  },
  {
    id: "p008",
    categorie: "Hydratant",
    nom: "Neutrogena Hydro Boost Gel",
    marque: "Neutrogena",
    emoji: "🫙",
    pour: ["Grasse", "Mixte", "Normale"],
    description: "Gel-crème léger non gras. Hydrate sans obstruer les pores.",
    prix: "8.000 - 14.000 FCFA",
    disponible: ["Pharmacie", "Jumia"],
    note: 4.6,
  },
  // Protections solaires
  {
    id: "p009",
    categorie: "Protection",
    nom: "Black Girl Sunscreen SPF 30",
    marque: "BGS",
    emoji: "☀️",
    pour: ["Taches", "Teint terne", "Toutes"],
    description: "SPF 30 sans effet blanc. Formulé spécialement pour peaux foncées.",
    prix: "15.000 - 25.000 FCFA",
    disponible: ["Amazon", "Site officiel"],
    note: 4.8,
  },
  {
    id: "p010",
    categorie: "Protection",
    nom: "La Roche-Posay Anthelios Fluide SPF 50+",
    marque: "La Roche-Posay",
    emoji: "🌞",
    pour: ["Sensible", "Acné", "Toutes"],
    description: "Haute protection solaire, texture légère. Convient aux peaux sensibles.",
    prix: "18.000 - 30.000 FCFA",
    disponible: ["Pharmacie"],
    note: 4.9,
  },
  // Traitements
  {
    id: "p011",
    categorie: "Traitement",
    nom: "Huile de Nigelle (Cumin Noir)",
    marque: "Naturel",
    emoji: "🌿",
    pour: ["Acné", "Taches", "Sensible"],
    description: "Antibactérienne naturelle. Réduit l'acné et unifie le teint.",
    prix: "2.500 - 8.000 FCFA",
    disponible: ["Marché", "Pharmacie"],
    note: 4.7,
  },
  {
    id: "p012",
    categorie: "Traitement",
    nom: "Differin Gel (Adapalène 0.1%)",
    marque: "Differin",
    emoji: "💊",
    pour: ["Acné", "Rides", "Pores"],
    description: "Rétinoïde topique. Traite l'acné et lisse les imperfections.",
    prix: "12.000 - 20.000 FCFA",
    disponible: ["Pharmacie"],
    note: 4.8,
  },
];

// ── GET /api/products ──────────────────────────────────────────
// Tous les produits avec filtres optionnels
router.get("/", (req, res) => {
  const { categorie, pour, search } = req.query;

  let products = [...PRODUCTS_CATALOG];

  if (categorie) {
    products = products.filter(
      (p) => p.categorie.toLowerCase() === categorie.toLowerCase()
    );
  }

  if (pour) {
    products = products.filter(
      (p) =>
        p.pour.some((tag) => tag.toLowerCase().includes(pour.toLowerCase())) ||
        p.pour.includes("Toutes")
    );
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        p.marque.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    data: products,
    count: products.length,
  });
});

// ── GET /api/products/:id ──────────────────────────────────────
router.get("/:id", (req, res) => {
  const product = PRODUCTS_CATALOG.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, error: "Produit introuvable." });
  }

  return res.json({ success: true, data: product });
});

// ── GET /api/products/categories/list ─────────────────────────
router.get("/categories/list", (req, res) => {
  const categories = [...new Set(PRODUCTS_CATALOG.map((p) => p.categorie))];
  return res.json({ success: true, data: categories });
});

module.exports = router;
