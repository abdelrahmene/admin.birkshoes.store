const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🔄 Configuration de la base de données...\n');

  try {
    // 1. Générer le client Prisma
    console.log('📦 Génération du client Prisma...');
    await execAsync('npx prisma generate');
    console.log('✅ Client Prisma généré\n');

    // 2. Pousser le schéma vers la DB
    console.log('🗄️  Push du schéma vers la DB...');
    await execAsync('npx prisma db push');
    console.log('✅ Schéma pushé vers la DB\n');

    // 3. Tester la connexion
    console.log('🔍 Test de la connexion...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Vérifier si les tables existent
    const homeSections = await prisma.homeSection.findMany();
    console.log(`✅ Connexion réussie - ${homeSections.length} sections trouvées\n`);

    // 4. Insérer les sections de base si aucune n'existe
    if (homeSections.length === 0) {
      console.log('📝 Insertion des sections de base...');
      
      const defaultSections = [
        {
          title: 'Section Hero',
          description: 'Section principale de la page d\'accueil',
          type: 'hero',
          content: JSON.stringify({
            title: 'Découvrez nos chaussures d\'exception',
            subtitle: 'Collection premium de chaussures pour homme et femme',
            buttonText: 'Découvrir',
            buttonLink: '/products',
            backgroundImage: '/images/hero-bg.jpg'
          }),
          isVisible: true,
          order: 1
        },
        {
          title: 'Section Catégories',
          description: 'Affichage des principales catégories',
          type: 'categories',
          content: JSON.stringify({
            title: 'Nos Catégories',
            showAll: true,
            maxItems: 6,
            displayStyle: 'grid'
          }),
          isVisible: true,
          order: 2
        },
        {
          title: 'Collection Vedette',
          description: 'Collection mise en avant',
          type: 'collection',
          content: JSON.stringify({
            title: 'Collection Automne-Hiver',
            description: 'Découvrez notre nouvelle collection',
            buttonText: 'Voir la collection',
            buttonLink: '/collections/automne-hiver',
            image: '/images/collection-aw.jpg'
          }),
          isVisible: true,
          order: 3
        },
        {
          title: 'Nos Avantages',
          description: 'Points forts de la boutique',
          type: 'advantages',
          content: JSON.stringify({
            title: 'Pourquoi nous choisir ?',
            items: [
              {
                icon: 'truck',
                title: 'Livraison rapide',
                description: 'Livraison en 24-48h dans toute l\'Algérie'
              },
              {
                icon: 'shield',
                title: 'Qualité garantie',
                description: 'Produits authentiques et garantis'
              },
              {
                icon: 'phone',
                title: 'Support client',
                description: 'Équipe disponible 7j/7'
              }
            ]
          }),
          isVisible: true,
          order: 4
        }
      ];

      for (const section of defaultSections) {
        await prisma.homeSection.create({ data: section });
      }

      console.log('✅ 4 sections de base créées\n');
    }

    await prisma.$disconnect();
    console.log('🎉 Configuration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

setupDatabase();
