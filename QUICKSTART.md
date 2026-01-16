# 🚀 Guide de Démarrage Rapide

## Windows

### Option 1 : Démarrage Automatique (Recommandé)
1. Double-cliquez sur `start.bat`
2. Attendez que les dépendances s'installent
3. L'application s'ouvrira automatiquement sur http://localhost:3000

### Option 2 : Démarrage Manuel

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

---

## macOS/Linux

### Option 1 : Exécutable

```bash
# Rendre le script exécutable
chmod +x start.sh

# Lancer l'app
./start.sh
```

### Option 2 : Démarrage Manuel

#### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

---

## ✅ Vérification

Une fois lancée, vérifiez:

- ✅ Backend s'affiche: `🚀 Serveur démarré sur http://localhost:5000`
- ✅ Frontend s'affiche: `Compiled successfully!`
- ✅ Le navigateur s'ouvre sur `http://localhost:3000`

---

## 🎨 Interface

### Barre d'action (en haut à droite)
- **+ Nouvelle Note** - Créer une note

### Formulaire de création
- **Titre** - Entrez le titre
- **Contenu** - Écrivez le message
- **Couleur** - Choisissez une couleur
- **Créer** ou **Annuler**

### Sur chaque note
- **✎** - Éditer
- **✕** - Supprimer
- **Carrés de couleur** - Changer la couleur
- **Clic + Glissez** - Déplacer la note

---

## 📚 Fichiers Importants

| Fichier | Description |
|---------|-------------|
| `backend/server.js` | Serveur Express |
| `backend/notes.json` | Stockage des données |
| `frontend/src/App.js` | Composant principal |
| `frontend/src/components/Note.js` | Composant Note |
| `frontend/src/components/NewNoteForm.js` | Formulaire d'ajout |

---

## 🔌 API Disponible

```
GET    /api/notes           - Récupérer toutes les notes
POST   /api/notes           - Créer une note
PUT    /api/notes/:id       - Modifier une note
DELETE /api/notes/:id       - Supprimer une note
```

---

## 🐛 Dépannage

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Cannot find module 'react'"
```bash
cd frontend
npm install
```

### Port déjà utilisé
Modifiez le port dans `backend/server.js`:
```javascript
const PORT = 5001; // Changer ici
```

### CORS Error
Vérifiez que le backend tourne sur le port 5000 et que le frontend essaie de se connecter au bon port dans `frontend/src/App.js`.

---

## 💡 Premiers Pas

1. **Créez une note** - Cliquez "+ Nouvelle Note"
2. **Donnez un titre** - Ex: "Ma première note"
3. **Ajoutez du contenu** - Ex: "Bonjour le monde!"
4. **Choisissez une couleur** - Cliquez sur une couleur
5. **Créez** - Cliquez "Créer la note"
6. **Déplacez** - Cliquez et glissez la note
7. **Modifiez** - Cliquez ✎ pour éditer
8. **Supprimez** - Cliquez ✕ pour supprimer

---

## 📱 Fonctionnalités Clés

✅ Créer, lire, modifier, supprimer (CRUD)
✅ Drag & Drop
✅ 8 couleurs disponibles
✅ Persistance des données
✅ Interface intuitive
✅ Temps réel
✅ Dates de création/modification

---

**Bon travail! Bienvenue dans Post-it App! 🎉**
