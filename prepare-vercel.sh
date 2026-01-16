#!/bin/bash

echo "🚀 Préparation pour Vercel Deployment"
echo "======================================"

# Vérifier que Git est initialisé
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized"
    echo "Run: git init"
    exit 1
fi

# Vérifier le remote GitHub
if ! git remote get-url origin | grep -q "github.com"; then
    echo "❌ GitHub remote not configured"
    echo "Run: git remote add origin https://github.com/molkbhs/cloud-poste-it"
    exit 1
fi

echo "✅ Git configured"

# Construire le frontend
echo ""
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
cd ..
echo "✅ Frontend built"

# Ajouter tous les fichiers
echo ""
echo "📦 Staging files..."
git add .
git status

# Commit
echo ""
echo "💾 Committing..."
git commit -m "Prepare for Vercel deployment"

# Push
echo ""
echo "🌐 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ READY FOR VERCEL!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Import project: cloud-poste-it"
    echo "3. Root Directory: frontend"
    echo "4. Add REACT_APP_API_URL env var"
    echo "5. Deploy!"
    echo ""
else
    echo "❌ Push failed"
    exit 1
fi
