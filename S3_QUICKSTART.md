# ⚡ Démarrage Rapide S3 (5 minutes)

## 1️⃣ Créer un S3 Bucket (2 min)

```bash
# Option A: AWS CLI
aws s3 mb s3://postit-app-uploads --region us-east-1

# Option B: Console AWS
# Aller à: https://s3.console.aws.amazon.com
# Create Bucket → postit-app-uploads → Create
```

## 2️⃣ Configurer CORS (1 min)

Console AWS → S3 → postit-app-uploads → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 3️⃣ Configurer Credentials (1 min)

`.env` backend:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_S3_BUCKET=postit-app-uploads
```

📍 **Où obtenir les credentials:**
1. AWS Console → IAM → Users → Select your user
2. Security credentials → Create access key
3. Copy Access Key ID & Secret

## 4️⃣ Installer Dépendances (1 min)

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install  # Sinon package.json est déjà à jour

cd ../frontend
npm install @aws-sdk/client-s3
```

## 5️⃣ Tester (1 min)

```bash
# Terminal 1: Backend
cd backend
npm start
# Doit afficher: ✅ S3 Client initialisé

# Terminal 2: Frontend
cd frontend
npm start
# Visite http://localhost:3000

# Terminal 3: Test API
curl -X POST http://localhost:5000/api/s3/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg"}'
```

✅ Si tu vois une presignedUrl → C'est bon! 🎉

## 🎯 Utilisation

1. Créer une note
2. Cliquer sur "📷 Image (optionnel)"
3. Sélectionner une image (max 5MB)
4. L'image s'upload directement vers S3
5. La note est créée avec l'image

L'image s'affiche dans la note et reste persistante dans S3!

---

## ❓ Problèmes Courants

### "S3 non configuré"
→ Vérifier que .env a les 4 variables AWS (et redémarrer)

### "CORS error"
→ Vérifier que `AllowedOrigins` inclut `http://localhost:3000`

### "File too large"
→ Max 5MB (ImageUploader valide côté client)

### "Access Denied"
→ Les credentials AWS sont peut-être expirées

---

Pour plus de détails: voir [AWS_S3_INTEGRATION.md](AWS_S3_INTEGRATION.md)
