#!/bin/bash

# Post-it App - Quick Setup Script
# Utilisation: ./setup.sh

set -e

echo "🚀 Post-it App - Configuration Rapide"
echo "═════════════════════════════════════"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "   Installer depuis: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version)"

# Choisir l'option MongoDB
echo ""
echo "🗄️  Quelle base de données voulez-vous utiliser?"
echo "  1) MongoDB Atlas (gratuit, cloud) - recommandé"
echo "  2) MongoDB Local (développement)"
echo ""
read -p "Choisir (1 ou 2): " db_choice

if [ "$db_choice" = "1" ]; then
    echo ""
    echo "📝 MongoDB Atlas Setup:"
    echo "  1. Créer un compte: https://www.mongodb.com/cloud/atlas"
    echo "  2. Créer un cluster gratuit (M0)"
    echo "  3. Créer un utilisateur: postit_user"
    echo "  4. Copier la chaîne de connexion"
    echo ""
    read -p "Appuyer sur Entrée quand prêt..."
    read -p "Entrer la chaîne de connexion MongoDB Atlas: " db_url
elif [ "$db_choice" = "2" ]; then
    echo ""
    echo "📝 MongoDB Local Setup:"
    echo "  Assurez-vous que MongoDB est en cours d'exécution:"
    echo "  - Windows: mongod"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Linux: sudo systemctl start mongod"
    echo "  - Docker: docker run -d -p 27017:27017 mongo"
    echo ""
    db_url="mongodb://localhost:27017/postit-db"
    echo "URL: $db_url"
else
    echo "❌ Option invalide"
    exit 1
fi

# Créer .env
echo ""
echo "🔧 Création du fichier .env..."

cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
DATABASE_URL=$db_url
CORS_ORIGIN=http://localhost:3000
EOF

cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
EOF

echo "✅ Fichiers .env créés"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."

echo "  Backend..."
cd backend
npm install
cd ..

echo "  Frontend..."
cd frontend
npm install
cd ..

echo "✅ Dépendances installées"

# Migrer les données (si JSON existe)
if [ -f "backend/notes.json" ]; then
    echo ""
    echo "📤 Fichier notes.json trouvé"
    read -p "Voulez-vous migrer les données vers MongoDB? (oui/non): " migrate_choice
    
    if [ "$migrate_choice" = "oui" ] || [ "$migrate_choice" = "yes" ]; then
        echo "Migration en cours..."
        cd backend
        node migrate-to-mongodb.js
        cd ..
        echo "✅ Migration terminée"
    fi
fi

# Prêt à démarrer
echo ""
echo "✅ Configuration terminée!"
echo ""
echo "Pour démarrer l'application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Ensuite, ouvrir: http://localhost:3000"
echo ""
