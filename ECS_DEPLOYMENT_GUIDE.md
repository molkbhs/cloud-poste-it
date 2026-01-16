# 🐳 Déploiement ECS - Guide Complet

## Architecture

```
GitHub (CI/CD)
    ↓
ECR (Docker Image Registry)
    ↓
ECS Cluster (Fargate)
    ├── Frontend Service (Auto-Scaling)
    │   └── Task × 2-10 containers
    │
    └── Backend Service (Auto-Scaling)
        └── Task × 2-10 containers
        
    ↓
Application Load Balancer (ALB)
    ├── Route /     → Frontend (port 80)
    └── Route /api  → Backend (port 5000)
    
    ↓
RDS PostgreSQL + S3 (Managed Services)
```

## 📋 Prérequis

- ✅ Compte AWS avec credentials configurés
- ✅ ECR Repositories créés
- ✅ VPC et Subnets
- ✅ Docker installé localement
- ✅ AWS CLI v2

## 1️⃣ Créer ECR Repositories

```bash
# Frontend Repository
aws ecr create-repository \
  --repository-name postit-frontend \
  --region us-east-1

# Backend Repository
aws ecr create-repository \
  --repository-name postit-backend \
  --region us-east-1
```

## 2️⃣ Construire et Pousser les Images Docker

### Méthode 1: Script Automatique

```bash
./scripts/build-and-push-ecr.sh 123456789 us-east-1 v1.0.0
```

### Méthode 2: Manuelle

```bash
# Variables
AWS_ACCOUNT_ID=123456789
AWS_REGION=us-east-1
ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Login à ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Build Frontend
docker build -f frontend/Dockerfile.prod -t $ECR_REGISTRY/postit-frontend:latest ./frontend
docker push $ECR_REGISTRY/postit-frontend:latest

# Build Backend
docker build -f backend/Dockerfile.prod -t $ECR_REGISTRY/postit-backend:latest ./backend
docker push $ECR_REGISTRY/postit-backend:latest
```

## 3️⃣ Mettre à Jour Task Definitions

Édite `aws/ecs-task-frontend.json` et `aws/ecs-task-backend.json`:

```json
"image": "YOUR_ECR_REGISTRY/postit-frontend:latest"
```

Remplace par:
```json
"image": "123456789.dkr.ecr.us-east-1.amazonaws.com/postit-frontend:latest"
```

Idem pour le backend.

## 4️⃣ Enregistrer Task Definitions

```bash
# Frontend
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-frontend.json

# Backend
aws ecs register-task-definition \
  --cli-input-json file://aws/ecs-task-backend.json
```

Vérife:
```bash
aws ecs list-task-definitions
```

## 5️⃣ Déployer CloudFormation Stack

### Créer des Secrets pour les Credentials

```bash
# Database URL
aws secretsmanager create-secret \
  --name postit/database-url \
  --secret-string "postgresql://user:pass@rds.amazonaws.com:5432/postit"

# AWS Access Key
aws secretsmanager create-secret \
  --name postit/aws-access-key \
  --secret-string "AKIA..."

# AWS Secret Key
aws secretsmanager create-secret \
  --name postit/aws-secret-key \
  --secret-string "wJalr..."
```

### Déployer le Stack

```bash
aws cloudformation create-stack \
  --stack-name postit-ecs \
  --template-body file://aws/ecs-stack.yaml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=production \
    ParameterKey=VpcId,ParameterValue=vpc-123456 \
    ParameterKey=SubnetIds,ParameterValue=subnet-123,subnet-456 \
  --capabilities CAPABILITY_NAMED_IAM
```

Vérifie le status:
```bash
aws cloudformation describe-stacks \
  --stack-name postit-ecs \
  --query 'Stacks[0].StackStatus'
```

## 6️⃣ Vérifier le Déploiement

### Obtenir le Load Balancer DNS

```bash
aws cloudformation describe-stacks \
  --stack-name postit-ecs \
  --query 'Stacks[0].Outputs' \
  --output table
```

Copie le **LoadBalancerDns** et visite:
```
http://LoadBalancerDns
```

### Vérifier les Services

```bash
# Frontend Service
aws ecs describe-services \
  --cluster postit-production \
  --services postit-frontend-production

# Backend Service
aws ecs describe-services \
  --cluster postit-production \
  --services postit-backend-production
```

### Vérifier les Tâches

```bash
# Lister les tâches
aws ecs list-tasks --cluster postit-production

# Détails d'une tâche
aws ecs describe-tasks \
  --cluster postit-production \
  --tasks arn:aws:ecs:...
```

### Logs CloudWatch

```bash
# Frontend Logs
aws logs tail /ecs/postit-frontend --follow

# Backend Logs
aws logs tail /ecs/postit-backend --follow
```

## 🔄 Auto-Scaling Configuration

### Métriques Activées

**Frontend:**
- CPU Target: 70%
- Memory Target: 80%
- Min tasks: 2
- Max tasks: 10

**Backend:**
- CPU Target: 75%
- Memory Target: 85%
- Min tasks: 2
- Max tasks: 10

### Vérifier Auto-Scaling

```bash
# Afficher les scaling targets
aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs

# Afficher les scaling policies
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs
```

### Test de Charge

```bash
# Installer Apache Bench
sudo apt-get install apache2-utils

# Générer du trafic
ab -n 10000 -c 100 http://LoadBalancerDns/

# Observer le scaling dans CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time 2024-01-16T00:00:00Z \
  --end-time 2024-01-16T23:59:59Z \
  --period 60 \
  --statistics Average \
  --dimensions Name=LoadBalancer,Value=app/postit-alb-production/...
```

## 📊 Monitoring CloudWatch

### Créer un Dashboard

```bash
cat > dashboard.json <<EOF
{
  "DashboardName": "postit-ecs",
  "DashboardBody": {
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
            ["AWS/ECS", "MemoryUtilization", {"stat": "Average"}],
            ["AWS/ApplicationELB", "TargetResponseTime"],
            ["AWS/ApplicationELB", "RequestCount"]
          ],
          "period": 60,
          "stat": "Average",
          "region": "us-east-1",
          "title": "ECS Performance"
        }
      }
    ]
  }
}
EOF

aws cloudwatch put-dashboard --cli-input-json file://dashboard.json
```

## 🔐 Sécurité

### Security Groups

- **ALB SG:** Permet entrées HTTP/HTTPS (0.0.0.0/0)
- **ECS Tasks SG:** Permet entrées depuis ALB SG

### Secrets Management

- Database credentials en AWS Secrets Manager
- AWS credentials en AWS Secrets Manager
- Aucun secret en plaintext dans Task Definition

### ECR Image Scanning

```bash
aws ecr start-image-scan \
  --repository-name postit-frontend \
  --image-id imageTag=latest
```

## 📈 Mises à Jour (CI/CD)

### Pipeline GitHub Actions → ECR → ECS

```yaml
# .github/workflows/deploy-ecs.yml
name: Deploy to ECS

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | \
            docker login --username AWS --password-stdin \
            123456789.dkr.ecr.us-east-1.amazonaws.com
      
      - name: Build and push frontend
        run: |
          docker build -f frontend/Dockerfile.prod -t \
            123456789.dkr.ecr.us-east-1.amazonaws.com/postit-frontend:latest \
            ./frontend
          docker push \
            123456789.dkr.ecr.us-east-1.amazonaws.com/postit-frontend:latest
      
      - name: Update ECS Service
        run: |
          aws ecs update-service \
            --cluster postit-production \
            --service postit-frontend-production \
            --force-new-deployment
```

## 🛑 Dépannage

### Tâches ne démarrent pas

```bash
# Vérifier les logs
aws ecs describe-tasks --cluster postit-production --tasks <task-arn>

# Check CloudWatch logs
aws logs get-log-events --log-group-name /ecs/postit-frontend
```

### Service unhealthy

```bash
# Vérifier health checks
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...
```

### OOM errors

Augmente la mémoire en Task Definition:
```json
"memory": 2048,  // Augmenter
"cpu": "1024"     // Augmenter proportionnellement
```

## 💰 Coûts Estimés

| Service | Coût Mensuel |
|---------|--------------|
| Fargate (1 vCPU, 2GB RAM × 2 tasks) | ~$50 |
| ALB | ~$16 |
| CloudWatch Logs | ~$5 |
| ECR Storage | ~$1 |
| Data Transfer | ~$10 |
| **Total** | **~$82/mois** |

## ✅ Checklist Déploiement

- [ ] ECR repositories créés
- [ ] Images Docker construites et pushées
- [ ] Task Definitions enregistrées
- [ ] Secrets créés dans Secrets Manager
- [ ] CloudFormation stack créé
- [ ] Services running (vérifier ECS dashboard)
- [ ] ALB responding (curl DNS name)
- [ ] Auto-scaling policies activées
- [ ] CloudWatch dashboard créé
- [ ] Logs vérifiés
- [ ] Health checks passing
- [ ] Test de charge effectué
- [ ] CI/CD pipeline configuré

---

**C'est done! Tu as maintenant une infrastructure ECS complète, scalable et hautement disponible!** 🚀
