console.log('🔍 Test de connexion MySQL simple...');

// Test de connexion MySQL direct sans Prisma
const mysql = require('mysql2/promise');

async function testMysqlConnection() {
  try {
    // Lire les variables d'environnement
    require('dotenv').config();
    
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('❌ DATABASE_URL non trouvée dans .env');
      return;
    }
    
    console.log('🔗 URL DB trouvée, test de connexion...');
    
    // Parser l'URL MySQL
    const url = new URL(dbUrl);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1)
    };
    
    console.log('🏗️ Configuration DB:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    // Test de connexion
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion MySQL réussie');
    
    // Vérifier si la table existe
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'home_sections'",
      [config.database]
    );
    
    const tableExists = tables[0].count > 0;
    console.log(`📋 Table home_sections: ${tableExists ? 'Existe' : 'N\'existe pas'}`);
    
    if (tableExists) {
      // Compter les sections
      const [sections] = await connection.execute('SELECT COUNT(*) as count FROM home_sections');
      console.log(`📄 Nombre de sections: ${sections[0].count}`);
      
      if (sections[0].count === 0) {
        console.log('📝 Insertion des sections de base...');
        
        const defaultSections = [
          ['hero-section', 'Section Hero', 'Section principale de la page d\'accueil', 'hero', JSON.stringify({
            title: 'Découvrez nos chaussures d\'exception',
            subtitle: 'Collection premium de chaussures pour homme et femme',
            buttonText: 'Découvrir',
            buttonLink: '/products'
          }), true, 1],
          ['categories-section', 'Section Catégories', 'Affichage des principales catégories', 'categories', JSON.stringify({
            title: 'Nos Catégories',
            showAll: true
          }), true, 2],
          ['collection-section', 'Collection Vedette', 'Collection mise en avant', 'collection', JSON.stringify({
            title: 'Collection Automne-Hiver'
          }), true, 3],
          ['advantages-section', 'Nos Avantages', 'Points forts de la boutique', 'advantages', JSON.stringify({
            title: 'Pourquoi nous choisir ?'
          }), true, 4]
        ];
        
        for (const section of defaultSections) {
          await connection.execute(
            'INSERT INTO home_sections (id, title, description, type, content, isVisible, `order`, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            section
          );
        }
        
        console.log('✅ 4 sections de base créées');
      }
    } else {
      console.log('⚠️ Table home_sections n\'existe pas. Prisma db push requis.');
    }
    
    await connection.end();
    console.log('🎉 Test terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testMysqlConnection();
