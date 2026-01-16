# 🗄️ Configuration MongoDB - Post-it App

Ce guide explique comment configurer MongoDB pour l'application Post-it App et migrer les données existantes.

## 📋 Table des Matières

1. [Options MongoDB](#options-mongodb)
2. [MongoDB Atlas (Cloud - Recommandé)](#mongodb-atlas-cloud---recommandé)
3. [MongoDB Local (Développement)](#mongodb-local-développement)
4. [Migration JSON → MongoDB](#migration-json--mongodb)
5. [Dépannage](#dépannage)
6. [Références](#références)

---

## 🗄️ Options MongoDB

### Comparaison

| Option | Coût | Setup | Performance | Backup |
|--------|------|-------|-------------|--------|
| **MongoDB Atlas** | Gratuit (M0) | 5 min | Excellente | Automatique |
| **Atlas M2** | $9/mois | 5 min | Très bonne | Automatique |
| **MongoDB Local** | Gratuit | 10 min | Bonne | Manuel |
| **AWS DocumentDB** | $0.84/heure | 15 min | Excellente | Automatique |

**Recommandation**: Utiliser **MongoDB Atlas M0** (gratuit) en développement et en production pour les petites applications.

---

## 🌐 MongoDB Atlas (Cloud - Recommandé)

### Étape 1: Créer un Compte

1. Aller à: https://www.mongodb.com/cloud/atlas
2. Cliquer "Try Free" ou "Sign Up"
3. Remplir le formulaire avec:
   - Email
   - Password
   - Nom (prénom)
4. Cliquer "Create Your MongoDB Account"
5. Vérifier votre email

### Étape 2: Créer un Cluster Gratuit

```
1. Après la connexion, cliquer "Build a Database"
2. Choisir "Shared" (gratuit)
3. Choisir le provider: AWS
4. Choisir la région:
   - us-east-1 (Virginie) - recommandé
   - eu-west-1 (Irlande)
   - ap-southeast-1 (Singapour)
5. Cliquer "Create Cluster"
6. Attendre 2-3 minutes pour la création
```

### Étape 3: Créer un Utilisateur de Base de Données

```
1. Aller à "Security" → "Database Access"
2. Cliquer "Add New Database User"
3. Remplir:
   - Username: postit_user
   - Password: [générer un mot de passe fort]
   - Built-in Role: Atlas Admin
4. Cliquer "Add User"
```

**Mot de passe sécurisé:**
```bash
# Générer un mot de passe aléatoire
openssl rand -base64 32
# Ou utiliser un gestionnaire de mots de passe
```

### Étape 4: Autoriser les Adresses IP

```
1. Aller à "Security" → "Network Access"
2. Cliquer "Add IP Address"
3. Options:
   - Development: 0.0.0.0/0 (n'importe quelle IP)
   - Production: Ajouter IP spécifique
4. Cliquer "Confirm"
```

### Étape 5: Obtenir la Chaîne de Connexion

```
1. Aller à "Deployment" → "Databases"
2. Cliquer "Connect" sur votre cluster
3. Choisir "Drivers" → "Node.js"
4. Copier la chaîne de connexion
```

**Format standard:**
```
mongodb+srv://postit_user:PASSWORD@cluster-xxxxx.mongodb.net/postit-db?retryWrites=true&w=majority
```

### Étape 6: Ajouter à votre .env

```bash
# backend/.env
DATABASE_URL=mongodb+srv://postit_user:YOUR_PASSWORD@cluster-xxxxx.mongodb.net/postit-db
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Test de Connexion

```bash
# Installer MongoDB Shell (optionnel)
npm install -g mongosh

# Test de connexion
mongosh "mongodb+srv://postit_user:PASSWORD@cluster-xxxxx.mongodb.net/postit-db"

# Ou avec Node.js
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur:', err.message))
  .finally(() => process.exit(0));
"
```

---

## 💻 MongoDB Local (Développement)

### Installation Windows

```bash
# Télécharger l'installer
# https://www.mongodb.com/try/download/community

# Ou utiliser Chocolatey
choco install mongodb-community

# Ou utiliser Docker (recommandé)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Installation macOS

```bash
# Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ou Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Installation Linux

```bash
# Ubuntu/Debian
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Ou Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Configuration

```bash
# backend/.env
DATABASE_URL=mongodb://localhost:27017/postit-db
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### Vérifier l'Installation

```bash
# Avec mongosh
mongosh

# Ou avec Node.js
npm install -g mongosh
mongosh mongodb://localhost:27017
```

---

## 📦 Migration JSON → MongoDB

### Prérequis

1. Avoir une base de données MongoDB (Atlas ou local)
2. Avoir un fichier `backend/notes.json` existant
3. Avoir défini la variable `DATABASE_URL`

### Migration Automatique

```bash
# 1. Installer les dépendances (si nécessaire)
cd backend
npm install mongoose dotenv

# 2. Configurer DATABASE_URL
# backend/.env
DATABASE_URL=mongodb+srv://postit_user:PASSWORD@...

# 3. Exécuter le script de migration
node migrate-to-mongodb.js
```

**Output attendu:**
```
📦 Migration JSON → MongoDB
==================================================

📂 Lecture du fichier: ./notes.json
   Nombre de notes trouvées: 42

🔗 Connexion à MongoDB...
   ✓ Connecté à MongoDB

🔍 Vérification des doublons...
   Notes existantes dans MongoDB: 0

⚡ Migration par lots (taille: 100)...
   Lot 1: 1-42...

✅ Migration terminée!
   Notes dans MongoDB: 42
   Notes migrées: 42
   Erreurs: 0

📊 Statistiques par utilisateur:
   default: 42 note(s)

💾 Sauvegarde créée: ./notes.json.backup

🔌 Déconnexion de MongoDB
```

### Migration Manuelle

```bash
# 1. Se connecter à MongoDB
mongosh "mongodb+srv://postit_user:PASSWORD@cluster..."

# 2. Créer la base de données
use postit-db

# 3. Importer les données
db.notes.insertMany([
  {
    id: "uuid-1",
    title: "Ma note",
    content: "Contenu",
    color: "#FFD700",
    x: 50,
    y: 50,
    userId: "default",
    createdAt: ISODate("2024-01-01T00:00:00Z"),
    updatedAt: ISODate("2024-01-01T00:00:00Z")
  }
])

# 4. Créer les index
db.notes.createIndex({ userId: 1, createdAt: -1 })
db.notes.createIndex({ id: 1 })
```

### Vérifier la Migration

```bash
# Compter les documents
curl http://localhost:5000/api/notes

# Ou directement dans MongoDB
mongosh "mongodb+srv://postit_user:PASSWORD@..."
use postit-db
db.notes.count()
db.notes.find().limit(5)
```

---

## 🔧 Dépannage

### Erreur: "Impossible de se connecter à MongoDB"

```bash
# 1. Vérifier la chaîne de connexion
echo $DATABASE_URL

# 2. Vérifier MongoDB Atlas
#    - Aller à: https://cloud.mongodb.com/
#    - Vérifier que le cluster est en cours d'exécution
#    - Vérifier les IP autorisées dans Network Access

# 3. Tester la connexion
mongosh "mongodb+srv://postit_user:PASSWORD@..."

# 4. Vérifier les logs du serveur
npm start  # et voir les erreurs
```

### Erreur: "Authentication failed"

```bash
# 1. Vérifier le mot de passe
#    - Le mot de passe peut contenir des caractères spéciaux
#    - Les URL-encoder: @ → %40, # → %23, etc.

# 2. Vérifier le nom d'utilisateur et la base de données
# Bon format:
mongodb+srv://postit_user:PASSWORD@cluster.mongodb.net/postit-db?retryWrites=true

# 3. Réinitialiser le mot de passe
#    MongoDB Atlas → Database Access → Edit User → Change Password
```

### Erreur: "IP not authorized"

```bash
# 1. Aller à Network Access
#    MongoDB Atlas → Security → Network Access

# 2. Ajouter votre IP
#    Add IP Address → Add Current IP

# 3. Pour AWS Elastic Beanstalk, ajouter 0.0.0.0/0
#    (moins sécurisé, mais plus facile en développement)

# 4. Mieux: Ajouter l'IP de l'instance AWS
#    AWS Console → EC2 → Instances → Elastic Beanstalk → Public IP
```

### Migration échouée

```bash
# 1. Vérifier le fichier JSON
cat backend/notes.json | head -20

# 2. Valider le JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('backend/notes.json', 'utf8')))"

# 3. Nettoyer et recommencer
#    Supprimer les notes migrées:
mongosh "mongodb+srv://..."
use postit-db
db.notes.deleteMany({ userId: "default" })

# 4. Relancer la migration
node backend/migrate-to-mongodb.js
```

### Notes n'apparaissent pas après migration

```bash
# 1. Vérifier MongoDB
mongosh "mongodb+srv://..."
use postit-db
db.notes.find()

# 2. Vérifier le endpoint GET
curl http://localhost:5000/api/notes | jq .

# 3. Redémarrer le serveur
# (le serveur cache parfois les données)
```

---

## 📚 Références

### MongoDB Atlas
- **Documentation**: https://docs.mongodb.com/atlas/
- **Connection String**: https://docs.mongodb.com/manual/reference/connection-string/
- **Pricing**: https://www.mongodb.com/cloud/atlas/pricing

### Mongoose (Node.js)
- **Documentation**: https://mongoosejs.com/
- **Schema Types**: https://mongoosejs.com/docs/schematypes.html
- **Query Methods**: https://mongoosejs.com/docs/queries.html

### MongoDB
- **Community Edition**: https://www.mongodb.com/try/download/community
- **Atlas Free Tier**: https://www.mongodb.com/cloud/atlas/lp/try

### Outils
- **MongoDB Compass**: https://www.mongodb.com/products/compass (UI visuelle)
- **MongoDB Shell**: https://www.mongodb.com/products/shell (CLI)
- **mongosh**: npm install -g mongosh

---

## ✅ Checklist de Déploiement

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster créé et démarré
- [ ] Utilisateur de base de données créé
- [ ] IP autorisée dans Network Access
- [ ] Chaîne de connexion copiée
- [ ] DATABASE_URL défini dans .env
- [ ] Serveur Node.js démarre sans erreur
- [ ] GET /api/notes retourne les données
- [ ] Notes JSON migrées vers MongoDB
- [ ] Sauvegarde du fichier notes.json créée

---

**Dernière mise à jour:** 2024 | **Version:** 1.0.0
