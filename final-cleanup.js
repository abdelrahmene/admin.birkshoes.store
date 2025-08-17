console.log('🎯 FINALISATION DU PROJET ADMIN - FRONTEND PUR')
console.log('='.repeat(60))

import { execSync } from 'child_process'
import { rmSync, existsSync } from 'fs'
import { join } from 'path'

const projectRoot = process.cwd()

// Supprimer définitivement le dossier API
const apiPath = join(projectRoot, 'src', 'app', 'api')
if (existsSync(apiPath)) {
  console.log('📁 Suppression du dossier API...')
  rmSync(apiPath, { recursive: true, force: true })
  console.log('✅ Dossier API supprimé !')
} else {
  console.log('✅ Dossier API déjà absent')
}

// Supprimer le dossier prisma
const prismaPath = join(projectRoot, 'prisma')
if (existsSync(prismaPath)) {
  console.log('📁 Suppression du dossier Prisma...')
  rmSync(prismaPath, { recursive: true, force: true })
  console.log('✅ Dossier Prisma supprimé !')
} else {
  console.log('✅ Dossier Prisma déjà absent')
}

// Liste des fichiers temporaires à supprimer
const tempFiles = [
  '.env.old',
  'package.json.old',
  'prisma.schema.bak',
  'cleanup-api.ps1',
  'cleanup-final.js',
  'cleanup.js',
  'final-cleanup.bat',
  'final-cleanup.js',
  'final-migration.sh',
  'remove-api-routes.js',
  'setup-complete.ps1',
  'setup-complete.sh',
  'temp_cleanup-api.bat'
]

console.log('🧹 Nettoyage des fichiers temporaires...')
tempFiles.forEach(file => {
  const filePath = join(projectRoot, file)
  if (existsSync(filePath)) {
    rmSync(filePath, { force: true })
    console.log(`✅ Supprimé: ${file}`)
  }
})

// Supprimer les dossiers temporaires
const tempDirs = ['scripts', 'test-scripts']
tempDirs.forEach(dir => {
  const dirPath = join(projectRoot, dir)
  if (existsSync(dirPath)) {
    rmSync(dirPath, { recursive: true, force: true })
    console.log(`✅ Dossier supprimé: ${dir}`)
  }
})

console.log('🎉 NETTOYAGE TERMINÉ!')
console.log('📂 Structure finale du projet:')
console.log('   ├── src/')
console.log('   │   ├── app/ (pages Next.js - FRONTEND SEUL)')
console.log('   │   ├── components/ (composants React)')
console.log('   │   └── lib/ (utilitaires dont api.ts)')
console.log('   ├── public/ (assets statiques)')
console.log('   └── package.json (dépendances frontend)')
console.log('')
console.log('⚙️  Configuration:')
console.log('   • Client API configuré pour http://localhost:4000')
console.log('   • Backend séparé dans: birkshoes-api/')
console.log('   • Pages corrigées: Products, Categories, Collections, Inventory')
console.log('')
console.log('✅ PROJET ADMIN FINALISÉ - FRONTEND PUR REACT/NEXT.JS')
