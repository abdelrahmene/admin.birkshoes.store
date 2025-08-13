console.log('🔧 Script de correction Prisma Windows...');

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function fixPrismaWindows() {
  try {
    console.log('1. 🛑 Arrêt des processus Node...');
    
    try {
      await execAsync('taskkill /f /im node.exe /t');
    } catch (e) {
      // Ignore si aucun processus à arrêter
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('2. 🗑️ Suppression du dossier Prisma client...');
    
    const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma');
    
    if (fs.existsSync(prismaClientPath)) {
      try {
        fs.rmSync(prismaClientPath, { recursive: true, force: true });
        console.log('✅ Dossier .prisma supprimé');
      } catch (e) {
        console.log('⚠️ Erreur lors de la suppression:', e.message);
      }
    }
    
    console.log('3. 📦 Génération Prisma...');
    
    // Essayer plusieurs fois si nécessaire
    let success = false;
    for (let i = 0; i < 3; i++) {
      try {
        await execAsync('npx prisma generate', { 
          cwd: path.join(__dirname, '..'),
          timeout: 30000 
        });
        success = true;
        break;
      } catch (e) {
        console.log(`❌ Tentative ${i + 1}/3 échouée:`, e.message);
        if (i < 2) {
          console.log('⏳ Attente avant nouvelle tentative...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    if (!success) {
      throw new Error('Échec de la génération Prisma après 3 tentatives');
    }
    
    console.log('✅ Client Prisma généré avec succès');
    
    console.log('4. 🗄️ Push vers la DB...');
    await execAsync('npx prisma db push', { 
      cwd: path.join(__dirname, '..'),
      timeout: 30000 
    });
    console.log('✅ Schema pushé vers la DB');
    
    console.log('5. 🧪 Test de connexion...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Connexion Prisma réussie');
    
    const count = await prisma.homeSection.count();
    console.log(`📊 Sections existantes: ${count}`);
    
    await prisma.$disconnect();
    
    console.log('🎉 Configuration Prisma terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction Prisma:', error.message);
    process.exit(1);
  }
}

fixPrismaWindows();
