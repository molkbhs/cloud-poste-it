# 📝 Post-it App - Application Web de Gestion de Notes

Une application web moderne pour créer, organiser et gérer vos notes adhésives numériques, inspirée par les célèbres Post-it jaunes de 3M.

## 🎯 Fonctionnalités

- ✏️ **Créer des notes** - Ajoutez de nouvelles notes avec titre et contenu
- 🎨 **Couleurs personnalisables** - 8 couleurs différentes pour vos notes
- 🖱️ **Drag & Drop** - Repositionnez vos notes librement sur le tableau
- ✎ **Éditer les notes** - Modifiez le titre et le contenu à tout moment
- 🗑️ **Supprimer les notes** - Supprimez les notes dont vous n'avez plus besoin
- 💾 **Persistance des données** - Vos notes sont sauvegardées automatiquement
- 📱 **Interface intuitive** - Design moderne et ergonomique

## 🛠️ Stack Technologique

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Gestion des requêtes cross-origin
- **UUID** - Génération d'identifiants uniques
- **JSON** - Stockage des données

### Frontend
- **React 18** - Bibliothèque UI
- **Axios** - Client HTTP
- **CSS3** - Styling moderne avec animations
- **React Hooks** - Gestion d'état et effets

## 📦 Installation

### Prérequis
- Node.js 14+ installé
- npm ou yarn

### 1. Cloner le projet
```bash
cd postit-app
```

### 2. Installer le Backend

```bash
cd backend
npm install
```

### 3. Installer le Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Démarrage

### Terminal 1 - Backend
```bash
cd backend
npm start
# ou pour le mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

L'application s'ouvre automatiquement sur `http://localhost:3000`

## 📋 API Endpoints

### GET `/api/notes`
Récupère toutes les notes

**Réponse:**
```json
[
  {
    "id": "uuid",
    "title": "Ma note",
    "content": "Contenu de la note",
    "color": "#FFD700",
    "x": 100,
    "y": 200,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### POST `/api/notes`
Crée une nouvelle note

**Corps de la requête:**
```json
{
  "title": "Ma nouvelle note",
  "content": "Contenu",
  "color": "#FFD700",
  "x": 100,
  "y": 200
}
```

### PUT `/api/notes/:id`
Met à jour une note existante

**Corps de la requête:**
```json
{
  "title": "Titre modifié",
  "content": "Nouveau contenu",
  "color": "#FFB6C1",
  "x": 150,
  "y": 250
}
```

### DELETE `/api/notes/:id`
Supprime une note

## 📁 Structure du Projet

```
postit-app/
├── backend/
│   ├── server.js          # Serveur Express
│   ├── notes.json         # Stockage des données
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── NoteBoard.js
│   │       ├── NoteBoard.css
│   │       ├── Note.js
│   │       ├── Note.css
│   │       ├── NewNoteForm.js
│   │       └── NewNoteForm.css
│   └── package.json
└── README.md
```

## 🎨 Palette de Couleurs

1. **Or** (#FFD700) - Par défaut
2. **Rose** (#FFB6C1)
3. **Bleu ciel** (#87CEEB)
4. **Vert clair** (#90EE90)
5. **Pêche** (#FFE4B5)
6. **Prune** (#DDA0DD)
7. **Khaki** (#F0E68C)
8. **Saumon** (#FFA07A)

## 💡 Utilisation

1. **Créer une note** - Cliquez sur le bouton "+ Nouvelle Note" en haut à droite
2. **Remplir les champs** - Entrez le titre, contenu et choisissez une couleur
3. **Confirmer** - Cliquez sur "Créer la note"
4. **Déplacer** - Cliquez et glissez la note pour la repositionner
5. **Éditer** - Cliquez sur le bouton ✎ pour modifier
6. **Changer de couleur** - Cliquez sur une couleur en bas de la note
7. **Supprimer** - Cliquez sur le bouton ✕ pour supprimer

## 🔧 Configuration

Vous pouvez modifier le port du backend en éditant `backend/server.js`:
```javascript
const PORT = 5000; // Modifier ici
```

Pour changer l'URL de l'API côté frontend, éditez `frontend/src/App.js`:
```javascript
const API_URL = 'http://localhost:5000/api/notes'; // Modifier ici
```

## 📝 Notes de Développement

- Les notes sont sauvegardées dans `backend/notes.json`
- Les positions des notes sont sauvegardées en pixels (x, y)
- Les dates sont en format ISO 8601
- Chaque note a un UUID unique

## 🐛 Dépannage

**Le frontend ne peut pas se connecter au backend?**
- Vérifiez que le backend est démarré sur le port 5000
- Vérifiez la CORS configuration dans `backend/server.js`

**Les notes ne sont pas sauvegardées?**
- Vérifiez les permissions d'écriture du répertoire backend
- Vérifiez que le fichier `notes.json` existe

## 📄 Licence

Open Source - Libre d'utilisation

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à améliorer l'application.

---

**Créé avec ❤️ en 2024**
