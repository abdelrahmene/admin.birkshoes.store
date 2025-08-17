# Admin Birkshoes Store - Frontend

## 🚀 Projet Frontend Pur

Ce projet est maintenant un frontend **React/Next.js** pur qui communique avec l'API backend externe.

### ✅ Migration Terminée

- ✅ Toutes les routes API supprimées
- ✅ Prisma et dépendances backend supprimées  
- ✅ Configuration API externe via `apiClient`
- ✅ Toutes les pages migrées vers l'API externe
- ✅ Fichiers temporaires et de sauvegarde nettoyés

### 🛠️ Configuration

**API Backend:** Le backend est maintenant séparé dans le projet `birkshoes-api`

**Variables d'environnement:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 📦 Installation et Démarrage

```bash
npm install
npm run dev
```

### 🏗️ Architecture

```
src/
├── app/                 # Pages Next.js App Router
│   ├── products/       # Gestion des produits
│   ├── categories/     # Gestion des catégories
│   ├── collections/    # Gestion des collections
│   ├── orders/         # Gestion des commandes
│   ├── customers/      # Gestion des clients
│   ├── inventory/      # Gestion des stocks
│   ├── content/        # Gestion du contenu
│   └── analytics/      # Tableaux de bord
├── components/         # Composants réutilisables
├── lib/               # Utilitaires et API client
└── types/             # Types TypeScript
```

### 🔗 API Client

Toutes les requêtes utilisent `apiClient` configuré dans `src/lib/api.ts`

### 📊 Fonctionnalités

- 🏪 Gestion complète des produits
- 📂 Système de catégories hiérarchiques  
- 🎨 Collections personnalisées
- 📦 Gestion avancée des stocks
- 👥 Gestion des clients et commandes
- 📊 Analytics et reporting
- 🎯 Gestion de contenu dynamique
- 📱 Interface responsive

---

**Dernière mise à jour:** 17/08/2025
**Status:** ✅ Frontend pur - Prêt pour la production
