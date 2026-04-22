# ✦ SKIN AI — Analyse Cutanée par Intelligence Artificielle

> Application mobile d'analyse de peau par IA, pensée pour les **peaux africaines et métissées**, accompagnée d'un backend Node.js sécurisé.

---

## 📦 Structure du monorepo

```
SKinAI/
├── SkinAI-Backend/            # API Node.js / Express (Claude Vision + Supabase)
│   ├── server.js
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── config/
│
└── SkinAI_complet_v2/
    └── SkinAI/                # Application mobile Expo / React Native
        ├── App.js
        ├── app/
        ├── components/
        ├── services/
        └── constants/
```

---

## 🚀 Démarrage rapide

### 1. Backend (API)
```bash
cd SkinAI-Backend
npm install
cp .env.example .env   # puis renseigner ANTHROPIC_API_KEY, SUPABASE_*
npm run dev
```
Le serveur démarre sur `http://localhost:3000`.

### 2. Application mobile
```bash
cd SkinAI_complet_v2/SkinAI
npm install
npx expo start
```
Puis scanner le QR code avec **Expo Go**.

---

## ✨ Fonctionnalités

- 📷 Capture photo (caméra ou galerie) avec guide de cadrage
- 🤖 Analyse IA via **Claude Vision** (Anthropic)
- 📊 Score cutané global + scores par zone du visage
- 🛍️ Recommandations produits adaptées aux peaux africaines
- 💡 Routine matin / soir personnalisée
- 📋 Historique des analyses (Supabase optionnel)
- 🔐 Clé API stockée **uniquement côté serveur**

---

## 🔐 Sécurité

- Clé Anthropic jamais exposée côté mobile
- Rate limiting (10 analyses/h/IP)
- Helmet.js, validation Joi, CORS configurable
- Images limitées à 10 MB

---

## ⚠️ Disclaimer

SKIN AI est un outil d'aide cosmétique. Il **ne remplace pas** un avis dermatologique professionnel.

---

## 📚 Documentation détaillée

- Backend : voir [`SkinAI-Backend/README.md`](./SkinAI-Backend/README.md)
- App mobile : voir [`SkinAI_complet_v2/SkinAI/README.md`](./SkinAI_complet_v2/SkinAI/README.md)
