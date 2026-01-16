# 🏗️ Architecture de Post-it App

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                          │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         │                            │
    ┌────▼────┐              ┌───────▼──────┐
    │ FRONTEND │              │  API (HTTP)  │
    │  REACT   │◄────────────►│   REST       │
    └────┬────┘              └───────┬──────┘
         │                            │
         │ Components:               │
         │ - NoteBoard              │
         │ - Note                   │
         │ - NewNoteForm            │
         │                          │
         │                     ┌────▼────┐
         │                     │ BACKEND  │
         │                     │EXPRESS.JS│
         │                     └────┬────┘
         │                          │
         │                     Routes:
         │                     - GET /api/notes
         │                     - POST /api/notes
         │                     - PUT /api/notes/:id
         │                     - DELETE /api/notes/:id
         │                          │
         │                     ┌────▼────────┐
         │                     │ FILE SYSTEM  │
         │                     │ notes.json   │
         └─────────────────────┴─────────────┘
```

## Flux de Données

### 1. Récupération des Notes
```
App.useEffect() 
  → fetchNotes() 
  → axios.get('/api/notes') 
  → Backend: loadNotes()
  → Fichier: notes.json
  → Frontend: setNotes()
  → Re-render: NoteBoard
```

### 2. Création d'une Note
```
NewNoteForm 
  → onAdd(noteData) 
  → axios.post('/api/notes', noteData) 
  → Backend: POST /api/notes
  → saveNotes() 
  → notes.json
  → Frontend: setNotes([...notes, newNote])
  → Re-render avec la nouvelle note
```

### 3. Modification d'une Note
```
Note (drag ou edit) 
  → onUpdate(id, updates) 
  → axios.put('/api/notes/:id', updates) 
  → Backend: PUT /api/notes/:id
  → saveNotes() 
  → notes.json
  → Frontend: setNotes(notes.map())
  → Re-render
```

### 4. Suppression d'une Note
```
Note ✕ click 
  → onDelete(id) 
  → axios.delete('/api/notes/:id') 
  → Backend: DELETE /api/notes/:id
  → saveNotes() 
  → Frontend: setNotes(notes.filter())
  → Re-render
```

## Arborescence des Fichiers

```
postit-app/
│
├── 📄 README.md                      # Documentation principale
├── 📄 QUICKSTART.md                  # Guide de démarrage
├── 📄 FEATURES.md                    # Améliorations futures
├── 📄 package.json                   # Config root
├── 📄 .gitignore
├── 🚀 start.bat                      # Démarrage automatique (Windows)
│
├── 📁 backend/
│   ├── 📄 server.js                  # Serveur Express principal
│   ├── 📄 package.json               # Dépendances backend
│   ├── 📄 notes.json                 # Base de données (créée auto)
│   └── 📁 node_modules/              # Dépendances NPM
│
└── 📁 frontend/
    ├── 📄 package.json               # Dépendances frontend
    ├── 📁 public/
    │   └── 📄 index.html             # HTML principal
    ├── 📁 src/
    │   ├── 📄 index.js               # Entrée React
    │   ├── 📄 index.css              # Styles globaux
    │   ├── 📄 App.js                 # Composant principal
    │   ├── 📄 App.css                # Styles App
    │   └── 📁 components/
    │       ├── 📄 NoteBoard.js       # Tableau de notes
    │       ├── 📄 NoteBoard.css
    │       ├── 📄 Note.js            # Composant note unique
    │       ├── 📄 Note.css
    │       ├── 📄 NewNoteForm.js    # Formulaire création
    │       └── 📄 NewNoteForm.css
    └── 📁 node_modules/              # Dépendances NPM
```

## Composants React

### App (Racine)
- **Rôle**: Gestion de l'état global et coordination
- **État**: notes, loading, showForm
- **Responsabilités**: 
  - Charger les notes au démarrage
  - Gérer les requêtes API (CRUD)
  - Passer les callbacks aux enfants

### NoteBoard
- **Rôle**: Conteneur des notes
- **Props**: notes, onUpdateNote, onDeleteNote
- **Responsabilités**:
  - Afficher la liste des notes
  - Afficher le message "aucune note"

### Note
- **Rôle**: Composant unique d'une note
- **Props**: note, onUpdate, onDelete
- **État**: isEditing, editTitle, editContent, isDragging
- **Responsabilités**:
  - Afficher le contenu
  - Permettre l'édition
  - Gérer le drag & drop
  - Changer la couleur
  - Supprimer la note

### NewNoteForm
- **Rôle**: Formulaire de création
- **Props**: onAdd, onCancel
- **État**: title, content, color
- **Responsabilités**:
  - Collecter les données
  - Valider les entrées
  - Appeler onAdd

## Modèle de Données

### Structure d'une Note
```javascript
{
  id: "uuid-unique",           // Identifiant unique
  title: "Titre",              // Titre de la note
  content: "Contenu",          // Contenu texte
  color: "#FFD700",            // Couleur hexadécimale
  x: 100,                       // Position X en pixels
  y: 200,                       // Position Y en pixels
  createdAt: "ISO-8601",       // Date de création
  updatedAt: "ISO-8601"        // Dernière modification
}
```

## Endpoints API

| Méthode | Endpoint | Description | Corps |
|---------|----------|-------------|-------|
| GET | `/api/notes` | Récupérer toutes les notes | - |
| POST | `/api/notes` | Créer une note | `{title, content, color, x, y}` |
| PUT | `/api/notes/:id` | Mettre à jour une note | `{title?, content?, color?, x?, y?}` |
| DELETE | `/api/notes/:id` | Supprimer une note | - |

## Technologies Utilisées

### Backend
```
Node.js 14+
├── Express 4.18    (Framework web)
├── CORS 2.8        (Requêtes cross-origin)
├── UUID 9.0        (Identifiants uniques)
└── File System     (Stockage JSON)
```

### Frontend
```
React 18
├── Hooks State/Effect
├── Axios 1.4       (Client HTTP)
└── CSS3            (Styling + animations)
```

## Performance

### Optimisations Implémentées
- ✅ Chargement une seule fois au montage (useEffect)
- ✅ Mises à jour locales rapides
- ✅ Sauvegarde asynchrone
- ✅ Drag & drop optimisé

### Possibilités d'Amélioration
- Virtualisation pour 1000+ notes
- Pagination des notes
- WebSocket pour le temps réel
- Service Worker pour PWA

## Gestion d'État

### Frontend
```javascript
// App.js
const [notes, setNotes] = useState([]);           // Liste des notes
const [loading, setLoading] = useState(true);    // État de chargement
const [showForm, setShowForm] = useState(false); // Affichage formulaire
```

### Backend
```javascript
// notes.json (File System)
// Stockage persistant en JSON
```

## Sécurité

### Implémenter à L'Avenir
- [ ] Authentification JWT
- [ ] Validation des entrées
- [ ] Rate limiting
- [ ] HTTPS
- [ ] Protection CSRF
- [ ] Sanitization HTML

## Déploiement Futur

### Frontend
```bash
npm run build  # Créer une build de production
# Deploy sur Vercel, Netlify, GitHub Pages
```

### Backend
```bash
# Deploy sur Heroku, Railway, AWS, Azure
# Remplacer JSON par MongoDB/PostgreSQL
```

---

**Cette architecture est simple et scalable pour un MVP.
Pour un projet en production, envisagez d'ajouter une base de données et l'authentification.**
