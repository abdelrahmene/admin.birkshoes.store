const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...\n');
  
  const prisma = new PrismaClient();

  try {
    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion DB réussie');

    // Test de récupération des sections
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: 'asc' }
    });

    console.log(`\n📋 ${sections.length} sections trouvées:`);
    sections.forEach(section => {
      console.log(`  - ${section.title} (${section.type}) - Visible: ${section.isVisible}`);
    });

    // Test de l'API en interne
    console.log('\n🔍 Test API...');
    const fetch = require('node-fetch').default;
    
    try {
      const response = await fetch('http://localhost:3000/api/content/home-sections');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API accessible - Sections récupérées:', data.data.length);
      } else {
        console.log('❌ API erreur:', data.error);
      }
    } catch (apiError) {
      console.log('⚠️  API non accessible (admin peut-être non démarré)');
      console.log('💡 Démarrez l\'admin avec: npm run dev');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
