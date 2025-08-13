#!/bin/bash

echo "🔧 Configuration automatique Admin Dashboard + Client"
echo "=================================================="

cd "C:\Users\abdelrahmene fares\Desktop\admin.Birkshoes.store"

echo ""
echo "📦 Installation dépendances admin..."
npm install node-fetch

echo ""
echo "🔄 Génération client Prisma..."
npx prisma generate

echo ""
echo "🗄️  Push schéma vers DB MySQL..."
npx prisma db push

echo ""
echo "🔍 Test et initialisation DB..."
node scripts/setup-db.js

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🚀 Pour démarrer l'admin: npm run dev"
echo "🌐 Pour démarrer le client: cd ../ecommerce-client && npm start"
