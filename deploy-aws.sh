#!/bin/bash

# Deploy script pour AWS Elastic Beanstalk
# Usage: ./deploy-aws.sh <environment-name>

set -e

ENVIRONMENT_NAME=${1:-postit-app-prod}
REGION=us-east-1

echo "🚀 Déploiement de Post-it App sur AWS Elastic Beanstalk"
echo "Environment: $ENVIRONMENT_NAME"
echo "Region: $REGION"

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé. Installez-le d'abord."
    exit 1
fi

# Vérifier que eb CLI est installé
if ! command -v eb &> /dev/null; then
    echo "❌ Elastic Beanstalk CLI n'est pas installé. Installez-le avec: pip install awsebcli"
    exit 1
fi

# Créer un fichier .gitignore pour EB
cat > .ebignore << 'EOF'
node_modules/
frontend/node_modules/
.git/
.github/
docs/
*.md
!README.md
.DS_Store
.env
.env.local
*.log
build/
dist/
coverage/
EOF

echo "✓ Fichier .ebignore créé"

# Initialiser EB (si nécessaire)
if [ ! -d ".elasticbeanstalk" ]; then
    echo "📦 Initialisation d'Elastic Beanstalk..."
    eb init postit-app \
        --region $REGION \
        --platform node.js \
        --instance-type t3.micro \
        --interactive false
else
    echo "✓ Elastic Beanstalk déjà initialisé"
fi

# Créer ou mettre à jour l'environnement
echo "🔧 Configuration de l'environnement..."

# Configuration des variables d'environnement (à définir dans AWS Console ou EB CLI)
echo "⚠️  IMPORTANT: Configurez ces variables d'environnement dans AWS Elastic Beanstalk:"
echo "  - DATABASE_URL: mongodb+srv://user:password@cluster.mongodb.net/postit-db"
echo "  - NODE_ENV: production"
echo "  - CORS_ORIGIN: https://votre-domaine.com"
echo ""

# Créer l'environnement
echo "📤 Déploiement du code..."
eb create $ENVIRONMENT_NAME \
    --instance-type t3.micro \
    --envvars NODE_ENV=production \
    --scale 1 || true

# Déployer la dernière version
eb deploy $ENVIRONMENT_NAME

# Afficher les informations de déploiement
echo ""
echo "✅ Déploiement terminé!"
echo ""
eb status $ENVIRONMENT_NAME
echo ""
echo "🌐 URL de l'application: $(eb open --print-url)"
echo ""
echo "📊 Pour voir les logs:"
echo "  eb logs"
echo ""
echo "🔧 Pour configurer les variables d'environnement:"
echo "  eb setenv DATABASE_URL='mongodb+srv://...' CORS_ORIGIN='https://...'"
echo ""
echo "🛑 Pour arrêter l'environnement:"
echo "  eb terminate $ENVIRONMENT_NAME"
