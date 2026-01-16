#!/usr/bin/env node

/**
 * Migration Script: JSON → PostgreSQL
 * 
 * Utilisation:
 * node migrate-to-postgres.js
 * 
 * Variables d'environnement requises:
 * - DATABASE_URL: postgresql://user:password@localhost:5432/postit
 * - NOTES_FILE: (optionnel) chemin vers notes.json (défaut: ./notes.json)
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Configuration
const DATABASE_URL = process.env.DATABASE_URL;
const NOTES_FILE = process.env.NOTES_FILE || path.join(__dirname, 'notes.json');
const BATCH_SIZE = 100;

// Validation
if (!DATABASE_URL) {
  console.error('❌ Erreur: DATABASE_URL non défini');
  console.error('Utilisation: DATABASE_URL=postgresql://... node migrate-to-postgres.js');
  process.exit(1);
}

// Initialiser Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// Définir le modèle Note
const NoteModel = require('./models/Note');
const Note = NoteModel(sequelize);

/**
 * Fonction principale de migration
 */
async function migrate() {
  console.log('📦 Migration JSON → PostgreSQL');
  console.log('═'.repeat(50));

  try {
    // 1. Vérifier le fichier source
    if (!fs.existsSync(NOTES_FILE)) {
      console.warn(`⚠️  Fichier ${NOTES_FILE} non trouvé. Création d'une base vide...`);
      // Créer une base vide
      await connectDatabase();
      console.log('✅ Migration terminée (base vide créée)');
      await sequelize.close();
      return;
    }

    // 2. Lire les notes du fichier JSON
    console.log(`\n📂 Lecture du fichier: ${NOTES_FILE}`);
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    const notes = JSON.parse(data);
    console.log(`   Nombre de notes trouvées: ${notes.length}`);

    if (notes.length === 0) {
      console.log('✅ Aucune note à migrer');
      return;
    }

    // 3. Connecter à PostgreSQL
    console.log('\n🔗 Connexion à PostgreSQL...');
    await connectDatabase();
    console.log('   ✓ Connecté à PostgreSQL');

    // 4. Créer la table
    console.log('\n🔨 Création du schéma...');
    await sequelize.sync({ force: false });
    console.log('   ✓ Schéma créé/mis à jour');

    // 5. Vérifier les doublons
    console.log('\n🔍 Vérification des doublons...');
    const existingCount = await Note.count();
    console.log(`   Notes existantes dans PostgreSQL: ${existingCount}`);

    if (existingCount > 0) {
      console.warn('⚠️  Des notes existent déjà dans PostgreSQL!');
      const duplicates = await Note.findAll({
        where: {
          id: notes.map(n => n.id)
        },
        attributes: ['id', 'title']
      });

      if (duplicates.length > 0) {
        console.warn(`   ${duplicates.length} doublon(s) détecté(s):`);
        duplicates.forEach(dup => {
          console.warn(`   - ${dup.id}: "${dup.title}"`);
        });

        // Demander confirmation
        const response = await askQuestion('\n❓ Voulez-vous continuer et créer les doublons? (oui/non): ');
        if (response.toLowerCase() !== 'oui' && response.toLowerCase() !== 'yes') {
          console.log('Annulé');
          await sequelize.close();
          return;
        }
      }
    }

    // 6. Migrer les notes par lots
    console.log(`\n⚡ Migration par lots (taille: ${BATCH_SIZE})...`);
    let migratedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < notes.length; i += BATCH_SIZE) {
      const batch = notes.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`   Lot ${batchNum}: ${i + 1}-${Math.min(i + BATCH_SIZE, notes.length)}...`);

      try {
        // Transformer les notes pour PostgreSQL
        const transformedNotes = batch.map(note => ({
          id: note.id,
          title: note.title || 'Sans titre',
          content: note.content || '',
          color: note.color || '#FFD700',
          x: note.x || 50,
          y: note.y || 50,
          userId: note.userId || 'default',
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date()
        }));

        // Insérer en ignorant les doublons
        const result = await Note.bulkCreate(transformedNotes, {
          ignoreDuplicates: true
        });

        migratedCount += result.length;
      } catch (err) {
        console.error(`   ❌ Erreur lors de la migration du lot ${batchNum}:`);
        console.error(`      ${err.message}`);
        errorCount++;
      }
    }

    // 7. Vérifier la migration
    console.log('\n✅ Migration terminée!');
    const finalCount = await Note.count();
    console.log(`   Notes dans PostgreSQL: ${finalCount}`);
    console.log(`   Notes migrées: ${migratedCount}`);
    if (errorCount > 0) {
      console.warn(`   Erreurs: ${errorCount}`);
    }

    // 8. Statistiques
    const stats = await sequelize.query(`
      SELECT "userId", COUNT(*) as count
      FROM notes
      GROUP BY "userId"
    `);

    console.log('\n📊 Statistiques par utilisateur:');
    stats[0].forEach(stat => {
      console.log(`   ${stat.userId}: ${stat.count} note(s)`);
    });

    // 9. Créer une sauvegarde du fichier JSON
    const backupFile = NOTES_FILE + '.backup';
    fs.copyFileSync(NOTES_FILE, backupFile);
    console.log(`\n💾 Sauvegarde créée: ${backupFile}`);

  } catch (error) {
    console.error('\n❌ Erreur de migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Déconnexion de PostgreSQL');
  }
}

/**
 * Connecter à PostgreSQL
 */
async function connectDatabase() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error.message);
    process.exit(1);
  }
}

/**
 * Poser une question à l'utilisateur
 */
function askQuestion(question) {
  return new Promise(resolve => {
    process.stdout.write(question);
    process.stdin.once('data', data => {
      resolve(data.toString().trim());
    });
  });
}

// Lancer la migration
migrate().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
