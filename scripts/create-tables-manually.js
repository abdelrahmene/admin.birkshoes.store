console.log('🔧 Création manuelle des tables sans Prisma...');

const mysql = require('mysql2/promise');
const fs = require('fs');

async function createTablesManually() {
  try {
    // Lire le fichier .env
    const envPath = require('path').join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    let databaseUrl = null;
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        databaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
        break;
      }
    }
    
    const url = new URL(databaseUrl);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1)
    };
    
    console.log('🔗 Connexion à MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connecté à MySQL');
    
    // Créer la table home_sections si elle n'existe pas
    console.log('🏗️ Création de la table home_sections...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS home_sections (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        isVisible BOOLEAN NOT NULL DEFAULT true,
        \`order\` INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Table home_sections créée ou vérifiée');
    
    // Vérifier si elle contient des données
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM home_sections');
    console.log(`📊 Sections existantes: ${count[0].count}`);
    
    if (count[0].count === 0) {
      console.log('📝 Insertion des sections de base...');
      
      const sections = [
        {
          id: 'hero-section-1',
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
          id: 'categories-section-1',
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
          id: 'collection-section-1',
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
          id: 'advantages-section-1',
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
      
      const insertSQL = `
        INSERT INTO home_sections (id, title, description, type, content, isVisible, \`order\`, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      for (const section of sections) {
        await connection.execute(insertSQL, [
          section.id,
          section.title,
          section.description,
          section.type,
          section.content,
          section.isVisible,
          section.order
        ]);
      }
      
      console.log('✅ 4 sections de base insérées !');
    }
    
    // Afficher le résultat final
    const [finalSections] = await connection.execute('SELECT id, title, type, isVisible FROM home_sections ORDER BY `order`');
    console.log('\n📋 Sections disponibles:');
    finalSections.forEach((section, index) => {
      console.log(`  ${index + 1}. ${section.title} (${section.type}) - ${section.isVisible ? 'Visible' : 'Masquée'}`);
    });
    
    await connection.end();
    console.log('\n🎉 Tables et données créées avec succès !');
    console.log('💡 Vous pouvez maintenant démarrer l\'admin avec: npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createTablesManually();
