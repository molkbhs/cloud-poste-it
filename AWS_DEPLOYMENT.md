# 🚀 Guide de Déploiement AWS - Post-it App

Ce guide explique comment déployer l'application Post-it sur AWS Elastic Beanstalk avec MongoDB Atlas.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Architecture AWS](#architecture-aws)
3. [Configuration MongoDB Atlas](#configuration-mongodb-atlas)
4. [Préparation du Projet](#préparation-du-projet)
5. [Déploiement avec Elastic Beanstalk](#déploiement-avec-elastic-beanstalk)
6. [Configuration du Domaine](#configuration-du-domaine)
7. [Monitoring et Logs](#monitoring-et-logs)
8. [Dépannage](#dépannage)
9. [Coûts Estimés](#coûts-estimés)

---

## 📦 Prérequis

### Outils Requis

```bash
# Installer AWS CLI v2
# Windows: https://awscli.amazonaws.com/AWSCLIV2.msi
# macOS: brew install awscli
# Linux: sudo apt-get install awscli

# Installer Elastic Beanstalk CLI
pip install awsebcli

# Vérifier les installations
aws --version
eb --version
```

### Compte AWS

1. Créer un compte AWS: https://aws.amazon.com/
2. Ajouter une méthode de paiement valide
3. Générer les clés d'accès AWS:
   ```
   AWS Console → IAM → Users → Security credentials
   ```
4. Configurer AWS CLI:
   ```bash
   aws configure
   # Entrer: Access Key ID, Secret Access Key, Region (ex: us-east-1)
   ```

### Compte MongoDB Atlas (Gratuit)

1. Créer un compte: https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit (M0)
3. Configurer les adresses IP autorisées (ajouter 0.0.0.0/0 pour AWS)

---

## 🏗️ Architecture AWS

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                       │
│            (postit-app.com → ELB)                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│        Elastic Load Balancer (ALB)                      │
│   - HTTPS (Certificate Manager)                        │
│   - Auto-redirect HTTP → HTTPS                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼────┐              ┌───▼────┐
    │  EC2   │              │  EC2   │
    │Instance│              │Instance│
    │   #1   │              │   #2   │
    └───┬────┘              └───┬────┘
        │     (Auto-Scaling)    │
        └────────────┬──────────┘
                     │
        ┌────────────▼──────────┐
        │  MongoDB Atlas Cloud  │
        │   (Multi-Region)      │
        └───────────────────────┘
```

### Composants

| Composant | Rôle |
|-----------|------|
| **Route 53** | Service DNS gérant votre domaine |
| **Elastic Load Balancer** | Distribue le trafic entre instances |
| **EC2** | Serveurs Node.js exécutant l'application |
| **Auto Scaling** | Ajoute/retire instances selon la charge |
| **MongoDB Atlas** | Base de données managée dans le cloud |
| **RDS (optionnel)** | Autre base de données relationnelle |

---

## 🗄️ Configuration MongoDB Atlas

### Étape 1: Créer un Cluster

```bash
# Sur https://cloud.mongodb.com/
1. Cliquer sur "Build a Database"
2. Choisir "Shared" (gratuit)
3. Choisir le provider: AWS
4. Choisir la région la plus proche
5. Cliquer "Create Deployment"
```

### Étape 2: Créer un Utilisateur

```
1. Aller à "Database Access"
2. Cliquer "Add New Database User"
3. Nom d'utilisateur: postit_user
4. Mot de passe: [générer un mot de passe fort]
5. Rôles: Atlas Admin
6. Cliquer "Add User"
```

### Étape 3: Autoriser les Adresses IP

```
1. Aller à "Network Access"
2. Cliquer "Add IP Address"
3. Ajouter 0.0.0.0/0 (pour AWS Elastic Beanstalk)
4. Cliquer "Confirm"
```

⚠️ **IMPORTANT**: En production, utiliser des IP spécifiques, pas 0.0.0.0/0

### Étape 4: Obtenir la Chaîne de Connexion

```
1. Aller à "Databases"
2. Cliquer "Connect" sur votre cluster
3. Choisir "Connect your application"
4. Copier l'URL: mongodb+srv://postit_user:PASSWORD@cluster...
5. Remplacer PASSWORD par votre mot de passe
```

**Exemple:**
```
mongodb+srv://postit_user:MySecurePassword123@postit-cluster.mongodb.net/postit-db?retryWrites=true&w=majority
```

---

## 🔧 Préparation du Projet

### Étape 1: Installer les Dépendances

```bash
cd postit-app

# Backend
cd backend
npm install
npm install mongoose dotenv

# Frontend
cd ../frontend
npm install
npm run build
cd ..
```

### Étape 2: Créer le Fichier .env.production

```bash
# backend/.env.production
NODE_ENV=production
PORT=8081
DATABASE_URL=mongodb+srv://postit_user:PASSWORD@postit-cluster.mongodb.net/postit-db
CORS_ORIGIN=https://postit-app.com
LOG_LEVEL=info
```

### Étape 3: Tester Localement

```bash
# Backend
cd backend
NODE_ENV=production DATABASE_URL=mongodb+srv://... npm start

# Frontend (dans un autre terminal)
cd frontend
REACT_APP_API_URL=http://localhost:8081 npm start
```

### Étape 4: Initialiser Git et Elastic Beanstalk

```bash
# Initialiser Git (si nécessaire)
git init
git add .
git commit -m "Initial commit"

# Initialiser Elastic Beanstalk
eb init postit-app \
  --region us-east-1 \
  --platform node.js \
  --instance-type t3.micro
```

---

## 🚀 Déploiement avec Elastic Beanstalk

### Option 1: Déploiement Automatique (Recommandé)

```bash
# Exécuter le script de déploiement
chmod +x deploy-aws.sh
./deploy-aws.sh postit-app-prod
```

### Option 2: Déploiement Manuel

```bash
# Créer l'environnement
eb create postit-app-prod \
  --instance-type t3.micro \
  --scale 2

# Configurer les variables d'environnement
eb setenv \
  NODE_ENV=production \
  DATABASE_URL="mongodb+srv://postit_user:PASSWORD@..." \
  CORS_ORIGIN="https://postit-app.com"

# Déployer
eb deploy

# Vérifier le statut
eb status

# Ouvrir l'application dans le navigateur
eb open
```

### Étape 3: Configurer la Santé des Instances

```bash
# L'application inclut un endpoint /health pour health checks
# Elastic Beanstalk l'utilise automatiquement pour :
# - Vérifier que les instances sont saines
# - Retirer les instances défaillantes du load balancer
# - Démarrer un replacement automatiquement
```

---

## 🌐 Configuration du Domaine

### Avec Route 53 (AWS)

```bash
# 1. Acheter un domaine ou transférer celui-ci dans Route 53
#    Route 53 → Registered Domains → Register Domain

# 2. Créer une zone hébergée pour votre domaine
#    Route 53 → Hosted Zones → Create Zone

# 3. Créer un enregistrement ALIAS vers Elastic Beanstalk
# Type: A (Address)
# Name: postit-app.com
# Alias Target: <votre-eb-url>.elasticbeanstalk.com
# Evaluate Target Health: Yes

# 4. Créer un enregistrement CNAME pour www
# Type: CNAME
# Name: www.postit-app.com
# Value: postit-app.com
```

### Avec DNS Externe (GoDaddy, Namecheap, etc.)

```bash
# 1. Aller aux paramètres DNS de votre domaine

# 2. Ajouter des enregistrements A vers Elastic Beanstalk
# Nom: @
# Type: A
# Valeur: [Adresse IP d'Elastic Beanstalk]

# 3. Ou utiliser CNAME
# Nom: @
# Type: CNAME
# Valeur: postit-app-prod.elasticbeanstalk.com
```

### SSL/TLS avec Certificate Manager

```bash
# 1. AWS Console → Certificate Manager → Request Certificate

# 2. Ajouter le domaine: postit-app.com, www.postit-app.com

# 3. Valider la propriété du domaine (email ou DNS)

# 4. Attacher le certificat au Load Balancer (Elastic Beanstalk)
#    Elastic Beanstalk → Configuration → Load Balancer → HTTPS
```

---

## 📊 Monitoring et Logs

### Logs en Temps Réel

```bash
# Afficher les logs
eb logs

# Logs continus
eb logs --stream

# Logs SSH sur l'instance
eb ssh
tail -f /var/log/nodejs/nodejs.log
```

### CloudWatch Dashboard

```bash
# AWS Console → CloudWatch → Dashboards → Create Dashboard

# Métriques à surveiller:
# - CPU Utilization
# - Memory Utilization
# - HTTP 4xx / 5xx errors
# - Request Count
# - Target Response Time
```

### Alertes CloudWatch

```bash
# Créer une alarme pour les erreurs
aws cloudwatch put-metric-alarm \
  --alarm-name postit-app-errors \
  --alarm-description "Alert on 5xx errors" \
  --metric-name HTTPCode_Target_5XX_Count \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## 🔧 Dépannage

### L'application ne démarre pas

```bash
# 1. Vérifier les logs
eb logs

# 2. SSH dans l'instance
eb ssh

# 3. Vérifier les logs Node.js
tail -f /var/log/nodejs/nodejs.log

# 4. Vérifier le processus
ps aux | grep node

# 5. Vérifier la connexion MongoDB
echo $DATABASE_URL
# Tester manuellement
node -e "console.log(process.env.DATABASE_URL)"
```

### Erreur de connexion MongoDB

```bash
# 1. Vérifier la chaîne de connexion
eb config
# Chercher DATABASE_URL

# 2. Vérifier les IP autorisées dans MongoDB Atlas
#    MongoDB Atlas → Network Access → IP Whitelist
#    (Ajouter les IPs d'Elastic Beanstalk)

# 3. Tester la connexion
mongo "mongodb+srv://postit_user:PASSWORD@..."
```

### Erreur 504 Gateway Timeout

```bash
# 1. Augmenter le timeout du Load Balancer
#    Elastic Beanstalk → Configuration → Load Balancer
#    Idle timeout: 60 secondes

# 2. Augmenter les ressources
#    Changer d'instance type: t3.small ou t3.medium

# 3. Ajouter des instances
#    Auto Scaling → Min Size: 2, Max Size: 4
```

### Problèmes de Performance

```bash
# 1. Ajouter un index MongoDB
#    Backend → models/Note.js déjà inclus

# 2. Ajouter du cache
#    Utiliser ElastiCache (Redis)

# 3. Augmenter les ressources
#    Instance type ou Auto Scaling
```

---

## 💰 Coûts Estimés (par mois)

| Service | Configuration | Coût |
|---------|--------------|------|
| **EC2** | 1× t3.micro (750h gratuit) | $0 (1ère année) / $7.50 |
| **Elastic Load Balancer** | 1 LB | $16.50 |
| **Data Transfer** | 50 GB sortant | $4.50 |
| **MongoDB Atlas** | M0 (gratuit) | $0 |
| **Route 53** | 1 zone hébergée | $0.50 |
| **Certificate Manager** | 1 certificat SSL | $0 (gratuit) |
| **CloudWatch** | Logs et métriques | $0 (gratuit) |
| **TOTAL MINIMUM** | | ~$20/mois |

⚠️ **IMPORTANT**: Après 12 mois, l'instance t3.micro n'est plus gratuite (coût devient ~$7.50/mois)

### Économiser des Coûts

1. **Utiliser EC2 Spot Instances** (70% de réduction)
2. **Augmenter MongoDB à M2** (gratuit, meilleure performance)
3. **CloudFront pour les assets statiques** (cache et réduction de bande passante)
4. **Auto Scaling** (payer uniquement pour ce qu'on utilise)

---

## 🔒 Sécurité

### Bonnes Pratiques

```bash
# 1. Ne jamais committer .env
echo ".env" >> .gitignore

# 2. Utiliser AWS Secrets Manager pour les mots de passe
aws secretsmanager create-secret \
  --name postit-app/database-url \
  --secret-string "mongodb+srv://..."

# 3. Mettre à jour les IP autorisées MongoDB
#    Au lieu de 0.0.0.0/0, utiliser l'IP spécifique d'Elastic Beanstalk

# 4. Utiliser HTTPS (SSL/TLS)
#    ✓ Déjà configuré dans AWS Certificate Manager

# 5. Mettre à jour les paquets régulièrement
#    Amazon Linux 2 gère les mises à jour de sécurité automatiquement
```

### Audit et Monitoring

```bash
# Activer CloudTrail pour l'audit
aws cloudtrail create-trail \
  --name postit-app-audit \
  --s3-bucket-name postit-app-logs

# Monitorer les changements de sécurité
aws cloudwatch put-metric-alarm \
  --alarm-name postit-app-security \
  --metric-name UnauthorizedAPICallsCount
```

---

## 📈 Étapes Suivantes

1. **Ajouter l'authentification** (AWS Cognito ou Auth0)
2. **Ajouter un CDN** (CloudFront pour les assets)
3. **Backup automatique** (AWS Backup pour MongoDB)
4. **CI/CD Pipeline** (GitHub Actions → Elastic Beanstalk)
5. **Analytics** (AWS Analytics ou Mixpanel)
6. **Email Notifications** (AWS SES)

---

## 📞 Support

- **AWS Support**: https://aws.amazon.com/support/
- **Elastic Beanstalk Docs**: https://docs.aws.amazon.com/elasticbeanstalk/
- **MongoDB Atlas**: https://docs.mongodb.com/atlas/
- **Node.js**: https://nodejs.org/docs/

---

**Dernière mise à jour:** 2024 | **Version:** 1.0.0
