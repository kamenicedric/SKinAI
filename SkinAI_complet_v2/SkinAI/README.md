# ✦ SKIN AI — Analyse Cutanée par IA

> Application mobile d'analyse de peau par intelligence artificielle, pensée pour les **peaux africaines et métissées**.

## 🚀 Lancer le projet

### 1. Installer les dépendances
```bash
npm install
```

### 2. Lancer en mode développement
```bash
npx expo start
```

### 3. Ouvrir sur téléphone
- Installe **Expo Go** sur ton téléphone (Play Store / App Store)
- Scanne le QR code affiché dans le terminal
- L'app se lance instantanément !

## 📁 Structure du projet

```
SkinAI/
├── App.js                    # Navigation principale (Bottom Tabs)
├── app/
│   ├── AnalyzeScreen.jsx     # Écran principal : photo + analyse IA
│   ├── HistoryScreen.jsx     # Historique des analyses
│   └── ProfileScreen.jsx     # Profil + statistiques
├── components/
│   ├── CaptureZone.jsx       # Zone de capture photo
│   ├── AnalyzeButton.jsx     # Bouton gradient d'analyse
│   ├── ProductCard.jsx       # Carte produit recommandé
│   └── ZoneBar.jsx           # Barre de score par zone visage
├── services/
│   ├── skinAnalysis.js       # Appel API Claude Vision
│   └── storage.js            # Stockage sécurisé (expo-secure-store)
├── constants/
│   ├── colors.js             # Palette de couleurs
│   └── prompts.js            # Prompt IA optimisé
└── assets/                   # Icônes et images
```

## 🔑 Configuration API

L'application utilise **Claude Vision API** d'Anthropic.

1. Va sur [console.anthropic.com](https://console.anthropic.com)
2. Crée un compte et génère une clé API
3. Entre ta clé directement dans l'application au premier lancement

> ⚠️ La clé est stockée de façon sécurisée sur le téléphone via `expo-secure-store`

## ✨ Fonctionnalités

- 📷 **Capture photo** — caméra ou galerie avec guide de cadrage
- 🤖 **Analyse IA** — diagnostic complet par Claude Vision
- 📊 **Score cutané** — note globale + scores par zone du visage
- 🛍️ **Recommandations** — produits adaptés aux peaux africaines
- 💡 **Routine** — conseils quotidiens personnalisés
- 📋 **Historique** — suivi de l'évolution de la peau
- 🔐 **Sécurité** — clé API stockée chiffrée, jamais exposée

## ⚠️ Disclaimer

SKIN AI est un outil d'aide cosmétique. Il **ne remplace pas** un avis dermatologique professionnel.

## 📦 Dépendances principales

- `expo` ~54.0.33
- `@react-navigation/bottom-tabs`
- `expo-image-picker` — accès caméra/galerie
- `expo-image-manipulator` — compression images
- `expo-secure-store` — stockage sécurisé
- `expo-linear-gradient` — dégradés UI
- `axios` — appels API

## 🗺️ Roadmap

- [ ] Onboarding au premier lancement
- [ ] Backend Node.js sécurisé (clé API côté serveur)
- [ ] Authentification Supabase
- [ ] Catalogue produits avec base de données
- [ ] Abonnement Premium (3 analyses gratuites/mois)
- [ ] Partage des résultats sur réseaux sociaux
- [ ] Mode comparaison avant/après
