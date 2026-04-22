# ✦ SKIN AI — Backend API

> Serveur Node.js sécurisé pour l'application SKIN AI.
> La clé API Anthropic reste **uniquement côté serveur**, jamais exposée dans l'app mobile.

---

## 🚀 Lancement rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Édite `.env` et remplis :
- `ANTHROPIC_API_KEY` → ta clé depuis [console.anthropic.com](https://console.anthropic.com)
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` → depuis [supabase.com](https://supabase.com) *(optionnel)*

### 3. Lancer le serveur
```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📡 Endpoints API

### `POST /api/analyze`
Lance une analyse cutanée IA.

**Corps de la requête :**
```json
{
  "image": "<base64 sans préfixe data:>",
  "mediaType": "image/jpeg",
  "skinType": "Mixte",
  "concerns": ["Acné", "Taches"],
  "userId": "uuid-optionnel"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "score_global": 72,
    "type_peau_detecte": "Mixte",
    "resume": "...",
    "problemes": [...],
    "zones": [...],
    "recommandations_produits": [...],
    "conseils_quotidiens": [...],
    "routine_proposee": { "matin": [...], "soir": [...] }
  },
  "meta": {
    "duration_ms": 3420,
    "model": "claude-sonnet-4-20250514",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Limites :** 10 analyses / heure / IP

---

### `GET /api/analyze/health`
Vérifie que la clé API est configurée.

### `GET /api/history/:userId`
Historique des analyses d'un utilisateur (Supabase requis).

### `GET /api/history/detail/:id`
Détail complet d'une analyse.

### `GET /api/products`
Catalogue de produits avec filtres.
- `?categorie=Nettoyant`
- `?pour=Acné`
- `?search=karité`

### `GET /api/products/categories/list`
Liste des catégories disponibles.

---

## 🗄️ Configuration Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** et exécute le contenu de `config/supabase_schema.sql`
3. Copie ton **Project URL** et ta **service_role key** dans `.env`

---

## 🌍 Déploiement en production

### Option A — Railway (recommandé, gratuit)
```bash
# Installe Railway CLI
npm install -g @railway/cli

# Connexion et déploiement
railway login
railway init
railway up

# Ajoute les variables d'environnement dans le dashboard Railway
```

### Option B — Render
1. Crée un compte sur [render.com](https://render.com)
2. New → Web Service → connecte ton GitHub
3. Build command : `npm install`
4. Start command : `npm start`
5. Ajoute les variables d'environnement

### Option C — VPS (DigitalOcean, Contabo)
```bash
# Sur le serveur
git clone ton-repo
cd SkinAI-Backend
npm install
# Utilise PM2 pour garder le serveur en vie
npm install -g pm2
pm2 start server.js --name skinai-backend
pm2 startup
pm2 save
```

---

## 🔐 Sécurité

- ✅ Clé API Anthropic stockée uniquement côté serveur
- ✅ Rate limiting (10 analyses/heure, 100 requêtes/15min)
- ✅ Helmet.js (headers de sécurité HTTP)
- ✅ Validation stricte des entrées (Joi)
- ✅ Limite de taille des images (10 MB)
- ✅ Gestion centralisée des erreurs
- ✅ CORS configurable par environnement

---

## 📁 Structure

```
SkinAI-Backend/
├── server.js                  # Point d'entrée Express
├── routes/
│   ├── analyze.js             # POST /api/analyze
│   ├── history.js             # GET /api/history
│   └── products.js            # GET /api/products
├── services/
│   ├── aiService.js           # Appel Claude Vision API
│   └── dbService.js           # Opérations Supabase
├── middleware/
│   ├── validation.js          # Validation Joi
│   └── errorHandler.js        # Gestion erreurs centralisée
├── config/
│   ├── supabase.js            # Client Supabase
│   └── supabase_schema.sql    # Script SQL à exécuter une fois
├── .env.example               # Template variables d'environnement
└── README.md
```

---

## 🔗 Connecter l'app mobile au backend

Dans `SkinAI/services/skinAnalysis.js`, change :
```js
// Développement (même WiFi)
const BACKEND_URL = "http://192.168.1.XXX:3000"; // Ton IP locale

// Production
const BACKEND_URL = "https://ton-backend.railway.app";
```

Trouve ton IP locale avec :
- **Windows** : `ipconfig` → IPv4
- **Mac/Linux** : `ifconfig | grep inet`
