# Post-it App - Guide de Configuration

## 🔧 Configuration pour Développement

### Variables d'Environnement Backend

Créez un fichier `.env` dans le dossier `/backend`:

```env
# Port du serveur
PORT=5000

# Mode
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

Modifiez `backend/server.js` pour utiliser les variables:

```javascript
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: CORS_ORIGIN
}));
```

### Variables d'Environnement Frontend

Créez un fichier `.env` dans le dossier `/frontend`:

```env
# API Backend
REACT_APP_API_URL=http://localhost:5000/api/notes

# Mode
REACT_APP_MODE=development
```

Modifiez `frontend/src/App.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/notes';
```

---

## 📦 Installation des Dépendances

### Première Installation

```bash
# Installer tout en une fois
npm install

# Ou manuellement
cd backend && npm install
cd ../frontend && npm install
```

### Packages Nécessaires

**Backend** (`npm install` dans `/backend`):
```
express
cors
uuid
```

**Frontend** (`npm install` dans `/frontend`):
```
react
react-dom
axios
```

---

## 🚀 Scripts de Démarrage

### Development

#### Windows - Avec Batch
```bash
start.bat
```

#### Windows - Manuel
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

#### macOS/Linux
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

### Production

#### Frontend
```bash
cd frontend
npm run build
# Déployer le dossier `build/` sur un serveur statique
```

#### Backend
```bash
NODE_ENV=production npm start
```

---

## 🌐 Configuration pour Production

### Réduire la Taille du Bundle Frontend

Modifiez `frontend/package.json`:

```json
{
  "homepage": "https://votredomaine.com"
}
```

Compilez pour la production:
```bash
cd frontend
npm run build
```

### Optimiser le Backend

Installez les packages de production:

```bash
cd backend
npm install --only=production
```

Activez la compression:

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🔒 Sécurité

### Headers de Sécurité

Ajoutez au backend:

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes par window
});

app.use(limiter);
```

### Validation des Données

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/notes', [
  body('title').trim().notEmpty(),
  body('content').trim(),
  body('color').matches(/^#[0-9A-F]{6}$/i)
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

---

## 🐳 Docker (Optionnel)

### Dockerfile Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
    volumes:
      - ./backend/notes.json:/app/notes.json

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Démarrage:
```bash
docker-compose up
```

---

## 📊 Monitoring

### Logs Backend

Modifiez `backend/server.js`:

```javascript
// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

### Métriques Frontend

Ajoutez Google Analytics:

```javascript
// frontend/src/index.js
import { GoogleAnalytics } from 'your-analytics-lib';

GoogleAnalytics.initialize('GA_ID');
```

---

## 🌍 Déploiement Cloud

### Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel
```

### Heroku (Backend)

```bash
heroku create postit-app-backend
git push heroku main
```

### Railway

```bash
# Backend
cd backend
railway link
railway deploy

# Frontend
cd ../frontend
railway link
railway deploy
```

### AWS

Utilisez AWS Amplify pour l'auto-déploiement.

### Azure

Utilisez Azure Static Web Apps pour le frontend et App Service pour le backend.

---

## 🔄 Migration vers MongoDB

### Installation

```bash
npm install mongoose
```

### Modèle

```javascript
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  color: String,
  x: Number,
  y: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
```

### Endpoint Modifié

```javascript
const Note = require('./models/Note');

app.get('/api/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const newNote = new Note(req.body);
  await newNote.save();
  res.status(201).json(newNote);
});
```

---

## 🧪 Tests

### Jest Backend

```bash
npm install --save-dev jest
```

Créez `backend/server.test.js`:

```javascript
describe('API Notes', () => {
  test('GET /api/notes devrait retourner un array', async () => {
    const response = await request(app).get('/api/notes');
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

### React Testing Library

```bash
npm install --save-dev @testing-library/react
```

---

## 📈 Optimisations

### Frontend
- ✅ Code splitting avec React.lazy()
- ✅ Memoization avec React.memo()
- ✅ Image optimization
- ✅ CSS minification

### Backend
- ✅ Compression middleware
- ✅ Caching headers
- ✅ Connection pooling (DB)
- ✅ Index optimization (DB)

---

## 📞 Support

Pour l'aide:
1. Vérifiez les logs de la console
2. Consultez la documentation de la dépendance
3. Déboguez avec les DevTools

---

**Configuration complète! 🎉**
