Write-Host "🔧 Configuration automatique Admin Dashboard + Client" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Set-Location "C:\Users\abdelrahmene fares\Desktop\admin.Birkshoes.store"

Write-Host ""
Write-Host "📦 Installation dépendances admin..." -ForegroundColor Yellow
npm install node-fetch

Write-Host ""
Write-Host "🔄 Génération client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "🗄️ Push schéma vers DB MySQL..." -ForegroundColor Yellow
npx prisma db push

Write-Host ""
Write-Host "🔍 Test et initialisation DB..." -ForegroundColor Yellow
node scripts/setup-db.js

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Pour démarrer l'admin: npm run dev" -ForegroundColor Cyan
Write-Host "🌐 Pour démarrer le client: cd ../ecommerce-client && npm start" -ForegroundColor Cyan
