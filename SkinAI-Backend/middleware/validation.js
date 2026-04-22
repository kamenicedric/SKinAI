const Joi = require("joi");

// ── Schéma de validation pour /analyze ────────────────────────
const analyzeSchema = Joi.object({
  image: Joi.string()
    .pattern(/^[A-Za-z0-9+/=]+$/)
    .min(100)
    .required()
    .messages({
      "string.pattern.base": "L'image doit être en base64 valide.",
      "string.min": "L'image est trop petite ou corrompue.",
      "any.required": "Le champ 'image' est obligatoire.",
    }),
  mediaType: Joi.string()
    .valid("image/jpeg", "image/jpg", "image/png", "image/webp")
    .default("image/jpeg"),
  skinType: Joi.string()
    .valid("Grasse", "Sèche", "Mixte", "Normale", "Sensible")
    .default("Mixte"),
  concerns: Joi.array()
    .items(
      Joi.string().valid(
        "Acné", "Taches", "Rides", "Pores", "Éclat",
        "Cernes", "Teint terne", "Hyperpigmentation", "Sécheresse"
      )
    )
    .max(5)
    .default([]),
  userId: Joi.string().uuid().optional(),
});

// ── Middleware de validation ───────────────────────────────────
function validateAnalyze(req, res, next) {
  const { error, value } = analyzeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: "Données invalides",
      details: error.details.map((d) => d.message),
    });
  }

  req.body = value;
  next();
}

// ── Middleware de vérification de la taille de l'image ─────────
function checkImageSize(req, res, next) {
  const { image } = req.body;
  if (!image) return next();

  // Base64 ~ 1.37x la taille originale
  const sizeBytes = (image.length * 3) / 4;
  const sizeMB = sizeBytes / (1024 * 1024);

  if (sizeMB > 10) {
    return res.status(413).json({
      success: false,
      error: "Image trop lourde. Taille maximum : 10 MB.",
    });
  }

  next();
}

module.exports = { validateAnalyze, checkImageSize };
