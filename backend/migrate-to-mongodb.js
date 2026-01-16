#!/usr/bin/env node

/**
 * Migration Script: JSON → MongoDB
 * 
 * Utilisation:
 * node migrate-to-mongodb.js
 * 
 * Variables d'environnement requises:
 * - DATABASE_URL: mongodb+srv://user:password@cluster.mongodb.net/database
 * - NOTES_FILE: (optionnel) chemin vers notes.json (défaut: ./notes.json)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Configuration
const DATABASE_URL = process.env.DATABASE_URL;
const NOTES_FILE = process.env.NOTES_FILE || path.join(__dirname, 'notes.json');
const BATCH_SIZE = 100;

// Validation
if (!DATABASE_URL) {
  console.error('❌ Erreur: DATABASE_URL non défini');
  console.error('Utilisation: DATABASE_URL=mongodb://... node migrate-to-mongodb.js');
  process.exit(1);
}

// Définir le schéma Note
const noteSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  title: { type: String, default: 'Sans titre' },
  content: { type: String, default: '' },
  color: {
    type: String,
    enum: ['#FFD700', '#FFB6C1', '#87CEEB', '#90EE90', '#FFE4B5', '#DDA0DD', '#F0E68C', '#FFA07A'],
    default: '#FFD700'
  },
  x: { type: Number, default: 50 },
  y: { type: Number, default: 50 },
  userId: { type: String, default: 'default' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ id: 1 });

const Note = mongoose.model('Note', noteSchema);

/**
 * Fonction principale de migration
 */
async function migrate() {
  console.log('📦 Migration JSON → MongoDB');
  console.log('═'.repeat(50));

  try {
    // 1. Vérifier le fichier source
    if (!fs.existsSync(NOTES_FILE)) {
      console.warn(`⚠️  Fichier ${NOTES_FILE} non trouvé. Création d'une base vide...`);
      // Créer une base vide
      await connectDatabase();
      console.log('✅ Migration terminée (base vide créée)');
      await mongoose.disconnect();
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

    // 3. Connecter à MongoDB
    console.log('\n🔗 Connexion à MongoDB...');
    await connectDatabase();
    console.log('   ✓ Connecté à MongoDB');

    // 4. Vérifier les doublons
    console.log('\n🔍 Vérification des doublons...');
    const existingCount = await Note.countDocuments();
    console.log(`   Notes existantes dans MongoDB: ${existingCount}`);

    if (existingCount > 0) {
      console.warn('⚠️  Des notes existent déjà dans MongoDB!');
      const duplicates = await Note.find({
        id: { $in: notes.map(n => n.id) }
      }).select('id title');

      if (duplicates.length > 0) {
        console.warn(`   ${duplicates.length} doublon(s) détecté(s):`);
        duplicates.forEach(dup => {
          console.warn(`   - ${dup.id}: "${dup.title}"`);
        });

        // Demander confirmation
        const response = await askQuestion('\n❓ Voulez-vous continuer et créer les doublons? (oui/non): ');
        if (response.toLowerCase() !== 'oui' && response.toLowerCase() !== 'yes') {
          console.log('Annulé');
          await mongoose.disconnect();
          return;
        }
      }
    }

    // 5. Migrer les notes par lots
    console.log(`\n⚡ Migration par lots (taille: ${BATCH_SIZE})...`);
    let migratedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < notes.length; i += BATCH_SIZE) {
      const batch = notes.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(`   Lot ${batchNum}: ${i + 1}-${Math.min(i + BATCH_SIZE, notes.length)}...`);

      try {
        // Transformer les notes pour MongoDB
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

        // Insérer avec ignoreErrors pour les doublons
        const result = await Note.insertMany(transformedNotes, { ordered: false }).catch(err => {
          // Ignorer les erreurs de doublon et continuer
          if (err.code === 11000) {
            return err.insertedDocs || [];
          }
          throw err;
        });

        migratedCount += (result?.length || 0);
      } catch (err) {
        console.error(`   ❌ Erreur lors de la migration du lot ${batchNum}:`);
        console.error(`      ${err.message}`);
        errorCount++;
      }
    }

    // 6. Vérifier la migration
    console.log('\n✅ Migration terminée!');
    const finalCount = await Note.countDocuments();
    console.log(`   Notes dans MongoDB: ${finalCount}`);
    console.log(`   Notes migrées: ${migratedCount}`);
    if (errorCount > 0) {
      console.warn(`   Erreurs: ${errorCount}`);
    }

    // 7. Statistiques
    const stats = await Note.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Statistiques par utilisateur:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} note(s)`);
    });

    // 8. Créer une sauvegarde du fichier JSON
    const backupFile = NOTES_FILE + '.backup';
    fs.copyFileSync(NOTES_FILE, backupFile);
    console.log(`\n💾 Sauvegarde créée: ${backupFile}`);

  } catch (error) {
    console.error('\n❌ Erreur de migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

/**
 * Connecter à MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
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
