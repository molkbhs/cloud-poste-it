#!/bin/bash
# Script de démarrage pour macOS/Linux
# Rendre ce fichier exécutable: chmod +x start.sh

echo ""
echo "========================================"
echo ""
echo "    POST-IT APP - Démarrage Rapide"
echo ""
echo "========================================"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Erreur: Node.js n'est pas installé!"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté"
echo ""

# Installer les dépendances
echo "📦 Installation des dépendances..."
echo ""

if [ ! -d "backend/node_modules" ]; then
    echo "Installation du backend..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installation du frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "========================================"
echo ""
echo "    Démarrage de l'application"
echo ""
echo "========================================"
echo ""
echo "📝 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""

# Démarrer le backend
echo "Démarrage du backend..."
cd backend
npm start &
BACKEND_PID=$!

sleep 3

# Démarrer le frontend
echo "Démarrage du frontend..."
cd ../frontend
npm start

# Attendre
wait
