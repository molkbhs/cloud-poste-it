require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configuration par environnement
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'postit-app-uploads';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/postit';

// Initialiser S3
let s3Client = null;
if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  });
  console.log('✅ S3 Client initialisé');
} else {
  console.warn('⚠️  AWS credentials non configurés - S3 désactivé');
}

// Initialiser Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: DATABASE_URL.startsWith('sqlite') ? 'sqlite' : 'postgres',
  storage: DATABASE_URL.startsWith('sqlite') ? DATABASE_URL.replace('sqlite:', '') : undefined,
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: DATABASE_URL.startsWith('sqlite') ? undefined : {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Importer le modèle
const NoteModel = require('./models/Note');
const Note = NoteModel(sequelize);

// Connexion à PostgreSQL
sequelize.authenticate()
  .then(() => {
    console.log('✅ PostgreSQL connecté avec succès');
    // Créer/mettre à jour les tables
    return sequelize.sync({ alter: NODE_ENV === 'development' });
  })
  .then(() => {
    console.log('✅ Schéma de base de données synchronisé');
  })
  .catch(err => {
    console.error('❌ Erreur de connexion PostgreSQL:', err.message);
    // Essayer de se reconnecter
    setTimeout(() => {
      sequelize.authenticate();
    }, 5000);
  });

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Health check endpoint (important pour AWS)
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: 'PostgreSQL connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'DATABASE_CONNECTION_FAILED',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: 'PostgreSQL disconnected',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET - Récupérer toutes les notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.findAll({
      order: [['createdAt', 'DESC']],
      limit: 500
    });
    
    res.json(notes.map(note => note.toJSON()));
  } catch (error) {
    console.error('Erreur GET /api/notes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des notes',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST - Créer une nouvelle note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, color, x, y, imageUrl, imageKey } = req.body;

    // Validation
    if (!title && !content) {
      return res.status(400).json({ error: 'Titre ou contenu requis' });
    }

    const newNote = await Note.create({
      id: uuidv4(),
      title: title || 'Sans titre',
      content: content || '',
      color: color || '#FFD700',
      x: x || 50,
      y: y || 50,
      imageUrl: imageUrl || null,
      imageKey: imageKey || null,
      userId: req.headers['x-user-id'] || 'default'
    });

    res.status(201).json(newNote.toJSON());
  } catch (error) {
    console.error('Erreur POST /api/notes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la note',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT - Mettre à jour une note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, color, x, y, imageUrl, imageKey } = req.body;

    // Construire l'objet de mise à jour
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (color !== undefined) updateData.color = color;
    if (x !== undefined) updateData.x = x;
    if (y !== undefined) updateData.y = y;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imageKey !== undefined) updateData.imageKey = imageKey;

    const note = await Note.findByPk(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    await note.update(updateData);
    res.json(note.toJSON());
  } catch (error) {
    console.error('Erreur PUT /api/notes/:id:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de la note',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE - Supprimer une note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findByPk(id);

    if (!note) {
      return res.status(404).json({ error: 'Note non trouvée' });
    }

    // Supprimer l'image de S3 si elle existe
    if (note.imageKey && s3Client) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: AWS_S3_BUCKET,
          Key: note.imageKey
        });
        await s3Client.send(deleteCommand);
        console.log(`Image supprimée de S3: ${note.imageKey}`);
      } catch (s3Error) {
        console.error('Erreur lors de la suppression de l\'image S3:', s3Error);
        // Continuer même si la suppression S3 échoue
      }
    }

    const deletedNote = note.toJSON();
    await note.destroy();

    res.json(deletedNote);
  } catch (error) {
    console.error('Erreur DELETE /api/notes/:id:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression de la note',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== S3 ENDPOINTS =====

// POST - Générer une URL présignée pour upload
app.post('/api/s3/presigned-url', async (req, res) => {
  try {
    if (!s3Client) {
      return res.status(503).json({ error: 'S3 non configuré' });
    }

    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName et fileType requis' });
    }

    // Générer une clé unique
    const fileKey = `notes/${Date.now()}-${uuidv4()}-${fileName}`;

    // Créer la commande S3
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      ContentType: fileType
    });

    // Générer l'URL présignée (valide 1 heure)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({
      presignedUrl,
      fileKey,
      bucket: AWS_S3_BUCKET
    });
  } catch (error) {
    console.error('Erreur POST /api/s3/presigned-url:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération de l\'URL présignée',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE - Supprimer un fichier S3
app.delete('/api/s3/file/:fileKey(*)', async (req, res) => {
  try {
    if (!s3Client) {
      return res.status(503).json({ error: 'S3 non configuré' });
    }

    const fileKey = req.params.fileKey;

    if (!fileKey) {
      return res.status(400).json({ error: 'fileKey requis' });
    }

    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: fileKey
    });

    await s3Client.send(command);

    res.json({ success: true, fileKey });
  } catch (error) {
    console.error('Erreur DELETE /api/s3/file/:fileKey:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la suppression du fichier',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET - Obtenir l'URL publique du fichier S3
app.get('/api/s3/file/:fileKey(*)', (req, res) => {
  try {
    if (!s3Client) {
      return res.status(503).json({ error: 'S3 non configuré' });
    }

    const fileKey = req.params.fileKey;
    const fileUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ fileUrl });
  } catch (error) {
    console.error('Erreur GET /api/s3/file/:fileKey:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'URL',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur port ${PORT}`);
  console.log(`📝 API disponible sur http://localhost:${PORT}/api/notes`);
  console.log(`🌍 Environnement: ${NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Fermeture gracieuse...');
  server.close(async () => {
    try {
      await sequelize.close();
      console.log('Connexion PostgreSQL fermée');
    } catch (error) {
      console.error('Erreur lors de la fermeture PostgreSQL:', error);
    }
    console.log('Serveur fermé');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu. Fermeture gracieuse...');
  server.close(async () => {
    try {
      await sequelize.close();
      console.log('Connexion PostgreSQL fermée');
    } catch (error) {
      console.error('Erreur lors de la fermeture PostgreSQL:', error);
    }
    console.log('Serveur fermé');
    process.exit(0);
  });
});
