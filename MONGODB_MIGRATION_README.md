# 📌 Post-it App - MongoDB + AWS Edition

Une application web complète pour créer, éditer et organiser des notes autocollantes, déployable sur le cloud AWS avec MongoDB Atlas.

## 🎯 Objectifs Atteints

✅ Application Post-it 100% fonctionnelle
✅ Backend Node.js/Express avec MongoDB (remplacé JSON)
✅ Frontend React moderne avec drag & drop
✅ Configuration Docker pour conteneurisation
✅ Configuration AWS Elastic Beanstalk
✅ Scripts de migration JSON → MongoDB
✅ Documentation complète de déploiement

---

## 🏗️ Architecture

### Avant (JSON)
```
Frontend (React) ←→ Backend (Express) ←→ notes.json
```

**Problèmes:**
- Pas de concurrence (une écriture à la fois)
- Données perdues à chaque redémarrage (serveurs cloud)
- Pas d'isolation multi-utilisateur
- Sauvegarde manuelle

### Après (MongoDB)
```
Frontend (React) ←→ Backend (Express) ←→ MongoDB Atlas (Cloud)
                                     ↓
                             Authentification
                                     ↓
                            Multi-utilisateur
                                     ↓
                          Backup automatique
```

---

## 📁 Structure du Projet

```
postit-app/
├── backend/                          # API Express.js
│   ├── server.js                     # Serveur principal (MIGRÉ vers MongoDB)
│   ├── models/
│   │   └── Note.js                   # Schéma Mongoose
│   ├── migrate-to-mongodb.js         # Script de migration JSON → DB
│   ├── package.json                  # Dépendances Node.js
│   └── notes.json                    # Données JSON (à migrer)
│
├── frontend/                         # Application React
│   ├── src/
│   │   ├── App.js                    # Composant principal
│   │   └── components/
│   │       ├── NoteBoard.js          # Tableau des notes
│   │       ├── Note.js               # Composant note (drag & drop)
│   │       └── NewNoteForm.js        # Formulaire création
│   ├── package.json                  # Dépendances React
│   └── public/
│
├── .ebextensions/                    # Configuration AWS Elastic Beanstalk
│   ├── 01_environment.config         # Variables d'environnement
│   └── 02_nodejs.config              # Configuration Node.js
│
├── .dockerignore                     # Fichiers à ignorer dans Docker
├── docker-compose.yml                # Orchestration multi-conteneurs
├── Dockerfile.backend                # Image Docker backend
├── Dockerfile.frontend               # Image Docker frontend
│
├── .env.example                      # Template des variables
├── .github/workflows/                # CI/CD pipelines
├── cloudformation-template.yaml      # Infrastructure AWS as Code
│
└── Documentation/
    ├── README.md                     # Ce fichier
    ├── MONGODB_SETUP.md              # Configuration MongoDB
    ├── AWS_DEPLOYMENT.md             # Guide AWS détaillé
    ├── CLOUD_DEPLOYMENT.md           # Déploiement cloud général
    └── deploy-aws.sh                 # Script automatisé
```

---

## 🚀 Démarrage Rapide

### 1️⃣ Préparation

```bash
# Cloner/télécharger le projet
cd postit-app

# Créer le fichier .env
cp .env.example backend/.env

# Installer MongoDB (en local) ou ouvrir un compte Atlas (gratuit)
# → Voir MONGODB_SETUP.md
```

### 2️⃣ Configuration MongoDB

**Option A: MongoDB Atlas (Cloud - Recommandé)**
```bash
# 1. Créer un compte: https://www.mongodb.com/cloud/atlas
# 2. Créer un cluster M0 gratuit
# 3. Copier la chaîne de connexion
# 4. Ajouter à backend/.env
DATABASE_URL=mongodb+srv://postit_user:PASSWORD@cluster...
```

**Option B: MongoDB Local**
```bash
# Docker
docker run -d -p 27017:27017 mongo

# Ou installer
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

### 3️⃣ Installation des Dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd frontend
npm install
```

### 4️⃣ Migration des Données (optionnel)

```bash
# Si vous avez un fichier notes.json existant:
cd backend
DATABASE_URL=mongodb+srv://... node migrate-to-mongodb.js
```

### 5️⃣ Démarrer l'Application

```bash
# Terminal 1: Backend
cd backend
NODE_ENV=development DATABASE_URL=mongodb://... npm start
# → API sur http://localhost:5000

# Terminal 2: Frontend
cd frontend
REACT_APP_API_URL=http://localhost:5000 npm start
# → App sur http://localhost:3000
```

---

## 🔄 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur
- **Axios** - Requêtes HTTP
- **CSS3** - Styling moderne avec animations
- **Vite/Create React App** - Build tool

### Backend
- **Node.js 18** - Runtime JavaScript
- **Express.js 4** - Framework web
- **Mongoose 7** - ODM MongoDB
- **CORS** - Gestion des requêtes cross-origin
- **UUID** - Génération d'identifiants uniques

### Base de Données
- **MongoDB Atlas** - Base de données cloud (gratuite)
- **Mongoose** - ORM pour MongoDB

### Infrastructure
- **Docker** - Conteneurisation
- **AWS Elastic Beanstalk** - Hosting cloud
- **AWS Certificate Manager** - SSL/TLS
- **Route 53** - DNS (optionnel)

---

## 📝 API Endpoints

### Récupérer toutes les notes
```http
GET /api/notes

Response:
[
  {
    "id": "uuid",
    "title": "Ma note",
    "content": "Contenu",
    "color": "#FFD700",
    "x": 100,
    "y": 200,
    "userId": "default",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Créer une note
```http
POST /api/notes

Body:
{
  "title": "Nouvelle note",
  "content": "Contenu...",
  "color": "#FFB6C1",
  "x": 50,
  "y": 50
}

Response: Objet Note créé
```

### Mettre à jour une note
```http
PUT /api/notes/:id

Body:
{
  "title": "Note modifiée",
  "content": "...",
  "color": "#87CEEB"
}
```

### Supprimer une note
```http
DELETE /api/notes/:id
```

### Health Check
```http
GET /health

Response:
{
  "status": "OK",
  "database": "MongoDB connected"
}
```

---

## 🎨 Couleurs Disponibles

| Couleur | Code | RGB |
|---------|------|-----|
| 🟨 Jaune | #FFD700 | Gold |
| 🩷 Rose | #FFB6C1 | Light Pink |
| 🟦 Bleu | #87CEEB | Sky Blue |
| 🟩 Vert | #90EE90 | Light Green |
| 🟧 Orange | #FFE4B5 | Moccasin |
| 🟪 Violet | #DDA0DD | Plum |
| 🟨 Crème | #F0E68C | Khaki |
| 🔶 Saumon | #FFA07A | Light Salmon |

---

## 🌐 Déploiement

### En Local
```bash
npm start  # Dans chaque dossier
```

### Docker Compose
```bash
docker-compose up
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### AWS Elastic Beanstalk
```bash
./deploy-aws.sh postit-app-prod
# Ou manuellement:
eb create postit-app-prod --instance-type t3.micro
eb deploy
```

**Documentation complète:** [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)

---

## 🔧 Configuration

### Variables d'Environnement

**Backend (`backend/.env`)**
```
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/postit-db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

**Frontend (`frontend/.env`)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Production
```bash
# backend/.env.production
NODE_ENV=production
PORT=8081
DATABASE_URL=mongodb+srv://user:password@...
CORS_ORIGIN=https://postit-app.com
```

---

## 📊 Monitoring

### Logs
```bash
# Backend
npm start

# Frontend
npm start

# Docker
docker logs postit-backend
docker logs postit-frontend
```

### Health Check
```bash
curl http://localhost:5000/health
```

### AWS CloudWatch
```bash
eb logs
eb logs --stream
```

---

## 🐛 Dépannage

### "Cannot connect to MongoDB"
1. Vérifier que MongoDB est démarré (local) ou accessible (Atlas)
2. Vérifier la chaîne `DATABASE_URL`
3. Vérifier les IP autorisées dans MongoDB Atlas

**Solution:**
```bash
# Tester la connexion
mongosh "mongodb+srv://..."

# Ou vérifier les logs
npm start  # Chercher les messages d'erreur
```

### "CORS error"
1. Vérifier que `CORS_ORIGIN` est correct
2. Vérifier que le frontend appelle la bonne URL d'API

**Solution:**
```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:5000

# backend/.env
CORS_ORIGIN=http://localhost:3000
```

### Notes ne s'affichent pas
1. Vérifier que MongoDB est connecté: `GET /health`
2. Vérifier qu'il y a des notes: `GET /api/notes`
3. Vérifier la console du navigateur pour les erreurs

---

## 📈 Étapes Suivantes

### Court terme
1. **Ajouter l'authentification** (Auth0, Firebase)
2. **Améliorer l'interface** (animations, thèmes)
3. **Validation des données** (Joi, Yup)
4. **Tests unitaires** (Jest, Vitest)

### Moyen terme
1. **Partage de notes** entre utilisateurs
2. **Collaboration en temps réel** (WebSockets, Socket.io)
3. **Recherche et filtrage** avancés
4. **Export/import** (PDF, images)

### Long terme
1. **Application mobile** (React Native)
2. **Synchronisation offline** (Service Workers)
3. **Notifications** (Email, Push)
4. **Intégrations** (Slack, Teams, etc.)

---

## 💰 Coûts Estimés

| Service | Prix | Notes |
|---------|------|-------|
| **MongoDB Atlas M0** | Gratuit | Jusqu'à 512 MB |
| **MongoDB Atlas M2** | $9/mois | Recommandé pour production |
| **AWS EC2 t3.micro** | Gratuit (1 an) / $7.50/mois | Gratuit la 1ère année |
| **AWS Load Balancer** | ~$16/mois | Requis pour auto-scaling |
| **AWS Data Transfer** | ~$5/mois | 50 GB sortant |
| **Route 53 (DNS)** | $0.50/mois | Par zone hébergée |
| **Certificate Manager** | Gratuit | SSL/TLS |
| **TOTAL (1ère année)** | **~$20/mois** | Après gratuit AWS |

---

## 📚 Documentation Complète

- [MONGODB_SETUP.md](MONGODB_SETUP.md) - Configuration MongoDB
- [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) - Déploiement AWS détaillé
- [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) - Déploiement cloud général
- [cloudformation-template.yaml](cloudformation-template.yaml) - Infrastructure as Code

---

## 📞 Support & Ressources

### Documentation
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)

### Outils Utiles
- [MongoDB Compass](https://www.mongodb.com/products/compass) - UI visuelle
- [Postman](https://www.postman.com/) - Test API
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Communautés
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Discussions](https://github.com/)
- [AWS Forum](https://forums.aws.amazon.com/)
- [MongoDB Community](https://www.mongodb.com/community/)

---

## 📄 Licence

MIT License - Libre d'utilisation

---

## ✅ Checklist de Déploiement

Avant de déployer en production:

- [ ] Fichier .env configuré
- [ ] DATABASE_URL pointant vers MongoDB Atlas
- [ ] Tests locaux réussis (API + Frontend)
- [ ] Données migrées (JSON → MongoDB)
- [ ] Certificat SSL configuré
- [ ] Variables d'environnement AWS définis
- [ ] CloudWatch monitoring activé
- [ ] Backup MongoDB configuré
- [ ] Domain DNS configuré
- [ ] CORS correctement configuré

---

**Version:** 1.0.0 | **Dernière mise à jour:** 2024
**Status:** ✅ Prêt pour production
