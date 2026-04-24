import axios from "axios";

// ── URL de ton backend ────────────────────────────────────────
// En développement : trouve ton IP avec `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
// Assure-toi que ton téléphone et PC sont sur le même réseau WiFi
// Ex: http://192.168.1.100:3000
// En production : https://skinai-backend.railway.app
const BACKEND_URL = "https://s-kin-ai.vercel.app"; // ← À changer

function normalizeBase64Image(input) {
  if (!input || typeof input !== "string") return input;
  // Retire un éventuel préfixe data URI et les retours à la ligne.
  return input.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").replace(/\s/g, "");
}

// ── Appel au backend sécurisé (clé API cachée côté serveur) ───
export async function analyzeSkin(base64Image, mediaType, skinType, concerns, userId = null) {
  const payload = {
    image: normalizeBase64Image(base64Image),
    mediaType: mediaType || "image/jpeg",
    skinType,
    concerns,
  };
  if (typeof userId === "string" && userId.trim().length > 0) {
    payload.userId = userId.trim();
  }
  const requestConfig = {
    headers: { "Content-Type": "application/json" },
    timeout: 60000,
  };
  let response;

  try {
    response = await axios.post(`${BACKEND_URL}/api/analyze`, payload, requestConfig);
  } catch (error) {
    // Compat temporaire: certains déploiements exposent encore /api/analyze/analyze.
    if (error?.response?.status === 404) {
      response = await axios.post(`${BACKEND_URL}/api/analyze/analyze`, payload, requestConfig);
    } else {
      throw error;
    }
  }

  if (!response?.data?.success) {
    const details = response?.data?.details;
    const detailMsg = Array.isArray(details) && details.length > 0 ? details[0] : null;
    throw new Error(detailMsg || response?.data?.error || "Erreur inconnue.");
  }

  return response.data.data;
}

// ── Récupérer les produits du catalogue ───────────────────────
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.categorie) params.append("categorie", filters.categorie);
  if (filters.pour) params.append("pour", filters.pour);
  if (filters.search) params.append("search", filters.search);

  const response = await axios.get(
    `${BACKEND_URL}/api/products?${params.toString()}`
  );
  return response.data.data || [];
}

// ── Récupérer l'historique cloud ──────────────────────────────
export async function getCloudHistory(userId) {
  if (!userId) return [];
  const response = await axios.get(`${BACKEND_URL}/api/history/${userId}`);
  return response.data.data || [];
}

// ── Vérifier que le backend répond ────────────────────────────
export async function checkBackendHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/analyze/health`, { timeout: 5000 });
    return response.data;
  } catch {
    return { success: false, api_configured: false };
  }
}
