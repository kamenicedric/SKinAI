const axios = require("axios");

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ── Prompt IA optimisé pour peaux africaines ─────────────────
function buildPrompt(skinType, concerns) {
  return `Tu es un expert dermatologue spécialisé dans les peaux africaines et métissées.
Analyse cette photo de visage et retourne UNIQUEMENT un objet JSON valide (pas de markdown, pas d'explication, pas de texte avant ou après).

Profil utilisateur :
- Type de peau déclaré : ${skinType}
- Préoccupations principales : ${concerns.join(", ")}

IMPORTANT : Tes recommandations de produits doivent être adaptées aux peaux noires et métissées (hyperpigmentation, kéloïdes, sécheresse, teint unifié). Cite des produits réels disponibles en Afrique ou en ligne.

Retourne exactement ce JSON :
{
  "score_global": <entier 0-100>,
  "type_peau_detecte": "<Grasse|Sèche|Mixte|Normale|Sensible>",
  "teint": "<description courte ex: Teint unifié avec légères taches>",
  "resume": "<résumé bienveillant et encourageant en 2 phrases>",
  "problemes": [
    {
      "nom": "<nom du problème>",
      "severite": "<faible|modérée|élevée>",
      "type": "<warning|alert|good|info>",
      "description": "<explication courte>"
    }
  ],
  "zones": [
    {"zone": "Front", "score": <0-100>, "observation": "<obs courte>"},
    {"zone": "Joues", "score": <0-100>, "observation": "<obs courte>"},
    {"zone": "Nez", "score": <0-100>, "observation": "<obs courte>"},
    {"zone": "Menton", "score": <0-100>, "observation": "<obs courte>"},
    {"zone": "Yeux", "score": <0-100>, "observation": "<obs courte>"}
  ],
  "recommandations_produits": [
    {
      "categorie": "<Nettoyant|Sérum|Hydratant|Protection|Traitement|Exfoliant>",
      "nom": "<nom produit réel>",
      "marque": "<marque>",
      "raison": "<raison adaptée peau africaine>",
      "emoji": "<emoji>",
      "priorite": "<Essentiel|Recommandé|Optionnel>",
      "prix_estime": "<ex: 5.000 FCFA - 15.000 FCFA>"
    }
  ],
  "conseils_quotidiens": [
    {"conseil": "<conseil pratique et précis>", "emoji": "<emoji>", "moment": "<Matin|Soir|Semaine>"}
  ],
  "routine_proposee": {
    "matin": ["<étape 1>", "<étape 2>", "<étape 3>"],
    "soir": ["<étape 1>", "<étape 2>", "<étape 3>"]
  }
}`;
}

// ── Appel à Claude Vision ─────────────────────────────────────
async function analyzeSkin({ base64Image, mediaType, skinType, concerns }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Anthropic non configurée sur le serveur.");
  }

  const prompt = buildPrompt(skinType, concerns);

  const response = await axios.post(
    ANTHROPIC_URL,
    {
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: base64Image,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      timeout: 45000, // 45 secondes max
    }
  );

  // Extraire et parser la réponse JSON
  const raw = response.data.content?.find((b) => b.type === "text")?.text || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("L'IA n'a pas retourné un JSON valide. Réessayez.");
  }

  // Validation basique du résultat
  if (
    typeof result.score_global !== "number" ||
    !result.type_peau_detecte ||
    !Array.isArray(result.zones)
  ) {
    throw new Error("Résultat IA incomplet. Réessayez avec une meilleure photo.");
  }

  return result;
}

module.exports = { analyzeSkin };
