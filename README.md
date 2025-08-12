# BirkShoes Admin Dashboard

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données :
- Copier `.env.example` vers `.env`
- Modifier les variables d'environnement avec vos informations MySQL

3. Initialiser Prisma :
```bash
npx prisma generate
npx prisma db push
```

4. Lancer le serveur de développement :
```bash
npm run dev
```

## Structure du projet

- `src/app/` - Pages Next.js 13+ avec App Router
- `src/components/` - Composants réutilisables
- `src/lib/` - Utilitaires et configuration
- `src/types/` - Types TypeScript
- `prisma/` - Schema et migrations Prisma

## Fonctionnalités principales

- ✅ Dashboard avec statistiques en temps réel
- ✅ Gestion des commandes (CRUD)
- ✅ Interface responsive et moderne
- ✅ Animations avec Framer Motion
- ✅ Base de données MySQL avec Prisma
- 🔄 Gestion des produits (en cours)
- 🔄 Intégration Yalidine (en cours)
- 🔄 Gestion des collections (en cours)

## Technologies utilisées

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma
- **Base de données**: MySQL (Hostinger)
- **UI Components**: Radix UI, Lucide React
- **Charts**: Recharts

## API Endpoints

- `GET /api/dashboard` - Statistiques du dashboard
- `GET /api/orders` - Liste des commandes
- `POST /api/orders` - Créer une nouvelle commande

## Configuration de production

1. Configurer les variables d'environnement sur le serveur
2. Exécuter les migrations Prisma
3. Builder et déployer l'application

```bash
npm run build
npm run start
```

## Roadmap

- [ ] Gestion complète des produits
- [ ] Intégration Yalidine pour l'expédition
- [ ] Système d'authentification
- [ ] Upload d'images avec Cloudinary
- [ ] Rapports et analytics avancés
- [ ] Notifications en temps réel
