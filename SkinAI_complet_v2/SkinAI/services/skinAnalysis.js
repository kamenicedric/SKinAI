import axios from "axios";

// ── URL de ton backend ────────────────────────────────────────
// En développement : trouve ton IP avec `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
// Assure-toi que ton téléphone et PC sont sur le même réseau WiFi
// Ex: http://192.168.1.100:3000
// En production : https://skinai-backend.railway.app
const BACKEND_URL = "https://s-kin-ai.vercel.app"; // ← À changer

// ── Appel au backend sécurisé (clé API cachée côté serveur) ───
export async function analyzeSkin(base64Image, mediaType, skinType, concerns, userId = null) {
  const response = await axios.post(
    `${BACKEND_URL}/api/analyze`,
    {
      image: base64Image,
      mediaType: mediaType || "image/jpeg",
      skinType,
      concerns,
      userId,
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 60000,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Erreur inconnue.");
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
