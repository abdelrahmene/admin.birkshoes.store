console.log('🔍 Test MySQL ultra-simple...');

const mysql = require('mysql2/promise');
const fs = require('fs');

async function testMysqlSimple() {
  try {
    // Lire le fichier .env manuellement
    const envPath = require('path').join(__dirname, '..', '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ Fichier .env non trouvé');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    let databaseUrl = null;
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        databaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
        break;
      }
    }
    
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL non trouvée dans .env');
      return;
    }
    
    console.log('🔗 DATABASE_URL trouvée');
    
    // Parser l'URL MySQL (format: mysql://user:password@host:port/database)
    const url = new URL(databaseUrl);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) // Enlever le / au début
    };
    
    console.log('🏗️ Configuration DB:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    // Test de connexion
    console.log('⏳ Connexion à MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion MySQL réussie !');
    
    // Vérifier les tables
    console.log('📋 Vérification des tables...');
    const [tables] = await connection.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      ORDER BY table_name
    `, [config.database]);
    
    console.log(`📊 Tables trouvées: ${tables.length}`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Vérifier spécifiquement home_sections
    const hasHomeSections = tables.some(t => t.table_name === 'home_sections');
    
    if (hasHomeSections) {
      console.log('✅ Table home_sections existe');
      
      // Compter les sections
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM home_sections');
      console.log(`📄 Sections existantes: ${count[0].count}`);
      
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
            isVisible: 1,
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
              maxItems: 6
            }),
            isVisible: 1,
            order: 2
          },
          {
            id: 'collection-section-1',
            title: 'Collection Vedette',
            description: 'Collection mise en avant',
            type: 'collection',
            content: JSON.stringify({
              title: 'Collection Automne-Hiver',
              description: 'Découvrez notre nouvelle collection'
            }),
            isVisible: 1,
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
                  description: 'Livraison en 24-48h'
                },
                {
                  icon: 'shield',
                  title: 'Qualité garantie',
                  description: 'Produits authentiques'
                },
                {
                  icon: 'phone',
                  title: 'Support client',
                  description: 'Équipe disponible 7j/7'
                }
              ]
            }),
            isVisible: 1,
            order: 4
          }
        ];
        
        for (const section of sections) {
          await connection.execute(`
            INSERT INTO home_sections (id, title, description, type, content, isVisible, \`order\`, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            section.id,
            section.title,
            section.description,
            section.type,
            section.content,
            section.isVisible,
            section.order
          ]);
        }
        
        console.log('✅ 4 sections de base créées !');
      }
      
      // Vérifier le résultat
      const [finalSections] = await connection.execute('SELECT id, title, type, isVisible FROM home_sections ORDER BY `order`');
      console.log('\n📋 Sections finales:');
      finalSections.forEach(section => {
        console.log(`  - ${section.title} (${section.type}) - Visible: ${section.isVisible ? 'Oui' : 'Non'}`);
      });
      
    } else {
      console.log('❌ Table home_sections n\'existe pas');
      console.log('🔧 Il faut créer les tables avec Prisma d\'abord');
      console.log('💡 Essayez: npx prisma db push --force-reset');
    }
    
    await connection.end();
    console.log('\n🎉 Test MySQL terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur MySQL:', error.message);
    if (error.code) {
      console.error('📋 Code d\'erreur:', error.code);
    }
  }
}

testMysqlSimple();
