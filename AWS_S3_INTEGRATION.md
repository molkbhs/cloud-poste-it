# 📱 Configuration AWS S3 pour Post-it App

## Vue d'Ensemble

L'application Post-it est maintenant compatible avec **AWS S3** pour le stockage cloud des images. Cette implémentation utilise le pattern **presigned URLs** (URLs présignées) qui est sécurisé et ne nécessite pas d'exposer les credentials AWS au frontend.

## 🏗️ Architecture S3

```
Frontend (React)
    ↓
[ImageUploader Component] → [s3Service.js]
    ↓
POST /api/s3/presigned-url → Récupère URL signée de 1h
    ↓
PUT presignedUrl → Upload direct vers S3 (pas de backend)
    ↓
POST /api/notes → Crée note avec imageUrl + imageKey
    ↓
Backend (Node.js)
    ↓
PostgreSQL + S3 Client
    ↓
DELETE /api/s3/file/:key → Suppression d'image
GET /api/s3/file/:key → Récupération URL publique
```

## 📋 Prérequis

1. **Compte AWS** avec accès IAM
2. **S3 Bucket** créé dans votre région
3. **Credentials AWS** (Access Key ID + Secret Access Key)
4. **Variables d'environnement** configurées

## 🔑 Configuration AWS

### Étape 1: Créer un S3 Bucket

```bash
# Via AWS CLI
aws s3 mb s3://postit-app-uploads --region us-east-1

# Ou via Console AWS:
# - S3 → Create Bucket
# - Bucket name: postit-app-uploads
# - Region: us-east-1
# - Block all public access: OFF (pour CORS presigned URLs)
```

### Étape 2: Configurer la Politique CORS

Appliquer cette politique CORS au bucket (S3 → Bucket → Permissions → CORS):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Étape 3: Créer un Utilisateur IAM (Recommandé)

Pour plus de sécurité, créer un utilisateur IAM dédié:

```bash
# Via AWS CLI
aws iam create-user --user-name postit-app-s3-user
aws iam create-access-key --user-name postit-app-s3-user

# Attacher une politique S3
aws iam put-user-policy --user-name postit-app-s3-user \
  --policy-name postit-s3-policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::postit-app-uploads/*"
      }
    ]
  }'
```

### Étape 4: Configurer les Variables d'Environnement

**Backend (.env):**
```env
# ===== AWS S3 Configuration =====
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=postit-app-uploads
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Flux de Téléchargement d'Image

### 1. Utilisateur Sélectionne une Image

```javascript
// Dans NewNoteForm.js
const handleImageUpload = async (file) => {
  const { url, key } = await s3Service.uploadFile(file);
  setImageUrl(url);
  setImageKey(key);
};
```

### 2. Frontend Demande une URL Présignée

```javascript
// frontend/src/services/s3Service.js
POST /api/s3/presigned-url
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg"
}

Response:
{
  "presignedUrl": "https://bucket.s3.amazonaws.com/notes/123-uuid-image.jpg?X-Amz-Algorithm=...",
  "fileKey": "notes/123-uuid-image.jpg"
}
```

**Avantage de sécurité:** Le backend contrôle qui peut uploader et quand (1 heure d'expiration).

### 3. Frontend Upload Directement vers S3

```javascript
// Utilise l'URL présignée pour PUT direct vers S3
PUT presignedUrl
Headers: { 'Content-Type': 'image/jpeg' }
Body: File data
```

**Avantage:** Pas d'upload via le backend = meilleure performance.

### 4. Frontend Crée la Note avec Image

```javascript
POST /api/notes
{
  "title": "Ma note",
  "content": "Description",
  "color": "#FFD700",
  "imageUrl": "https://bucket.s3.amazonaws.com/notes/123-uuid-image.jpg",
  "imageKey": "notes/123-uuid-image.jpg"
}
```

### 5. Backend Stocke Références dans PostgreSQL

```sql
-- Colonne de la table notes
imageUrl: "https://bucket.s3.amazonaws.com/notes/123-uuid-image.jpg"
imageKey: "notes/123-uuid-image.jpg"  -- Pour suppression ultérieure
```

## 🖼️ Composant ImageUploader

**Localisation:** `frontend/src/components/ImageUploader.js`

**Fonctionnalités:**
- ✅ Validation: Images seulement
- ✅ Limite de taille: 5 MB max
- ✅ Barre de progression
- ✅ Messages d'erreur
- ✅ Interface simple drag & drop

**Utilisation:**
```javascript
import ImageUploader from './ImageUploader';

<ImageUploader 
  onImageUpload={(file) => {
    // file = {url, key, name}
    console.log('Upload réussi:', file.url);
  }}
  onError={(error) => {
    console.error('Erreur upload:', error);
  }}
/>
```

## 📝 Endpoints S3 Backend

### POST /api/s3/presigned-url

**Description:** Génère une URL présignée pour upload sécurisé

**Request:**
```bash
curl -X POST http://localhost:5000/api/s3/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName": "image.jpg", "fileType": "image/jpeg"}'
```

**Response:**
```json
{
  "presignedUrl": "https://bucket.s3.amazonaws.com/notes/...",
  "fileKey": "notes/123-uuid-image.jpg",
  "bucket": "postit-app-uploads"
}
```

**Erreurs:**
- `400`: fileName ou fileType manquant
- `503`: S3 non configuré (pas de credentials AWS)
- `500`: Erreur AWS

---

### DELETE /api/s3/file/:fileKey

**Description:** Supprime un fichier de S3

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/s3/file/notes%2F123-uuid-image.jpg
```

**Response:**
```json
{
  "success": true,
  "deleted": "notes/123-uuid-image.jpg"
}
```

**Automatisé:** Appelé automatiquement quand une note avec image est supprimée.

---

### GET /api/s3/file/:fileKey

**Description:** Récupère l'URL publique d'un fichier S3

**Request:**
```bash
curl http://localhost:5000/api/s3/file/notes%2F123-uuid-image.jpg
```

**Response:**
```json
{
  "url": "https://bucket.s3.amazonaws.com/notes/123-uuid-image.jpg"
}
```

## 🔒 Sécurité

### Pattern Presigned URLs

✅ **Avantages:**
- Pas d'AWS credentials en frontend
- URLs expirables (1 heure par défaut)
- Accès limité au bucket spécifique
- Backend contrôle le flux

⚠️ **Considérations:**
- Les URLs presignées peuvent être partagées accidentellement
- Les utilisateurs peuvent uploader au-delà de la taille limite (côté client)

### Recommandations Production

1. **Chiffrer les URLs en transit:**
   ```env
   # Force HTTPS
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Limiter l'accès au bucket:**
   ```json
   {
     "Effect": "Deny",
     "Principal": "*",
     "Action": "s3:*",
     "Resource": "arn:aws:s3:::postit-app-uploads/*",
     "Condition": {
       "StringNotEquals": {
         "aws:SourceVpc": "vpc-12345"
       }
     }
   }
   ```

3. **Scanner les fichiers uploadés:**
   ```javascript
   // Intégration avec ClamAV ou Yara
   app.post('/api/s3/presigned-url', async (req, res) => {
     const scanResult = await scanFile(file);
     if (!scanResult.clean) {
       throw new Error('Fichier suspect détecté');
     }
   });
   ```

4. **Quotas par utilisateur:**
   ```javascript
   // Vérifier usage S3 par userId
   const userUsage = await getUserS3Usage(userId);
   if (userUsage > MAX_STORAGE) {
     throw new Error('Quota dépassé');
   }
   ```

## 🐛 Troubleshooting

### "S3 non configuré"

```
❌ Erreur: 503 Service Unavailable - S3 non configuré
```

**Solution:**
```bash
# Vérifier variables d'environnement
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_REGION
echo $AWS_S3_BUCKET

# Redémarrer le serveur après modification du .env
npm run dev
```

### "CORS policy: No 'Access-Control-Allow-Origin'"

```
❌ Erreur: CORS policy blocked request
```

**Solution:**
```json
// Vérifier la politique CORS du bucket
{
  "AllowedOrigins": ["http://localhost:3000"],  // Votre domaine
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"]
}
```

### "File size exceeds limit"

```
❌ Erreur: File exceeds 5MB limit
```

**Solution:** Le composant ImageUploader valide côté client. Pour augmenter:

```javascript
// frontend/src/components/ImageUploader.js
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
```

### "AccessDenied: InvalidAccessKeyId"

```
❌ Erreur: AWS credentials invalides
```

**Solution:**
```bash
# Vérifier les credentials AWS
aws sts get-caller-identity

# Recréer si expirées
aws iam create-access-key --user-name postit-app-s3-user
```

## 📊 Monitoring et Analytics

### CloudWatch Metrics

```javascript
// Ajouter au backend pour tracking
const trackS3Upload = (fileSize, duration) => {
  cloudWatch.putMetricData({
    MetricData: [{
      MetricName: 'ImageUploadSize',
      Value: fileSize,
      Unit: 'Bytes'
    }]
  });
};
```

### S3 Access Logs

```bash
# Activer les logs S3
aws s3api put-bucket-logging \
  --bucket postit-app-uploads \
  --bucket-logging-status file://logging.json
```

## 🚀 Déploiement

### En Production (AWS Elastic Beanstalk)

```bash
# 1. Ajouter credentials à Environment Variables
eb setenv \
  AWS_ACCESS_KEY_ID=your_key \
  AWS_SECRET_ACCESS_KEY=your_secret \
  AWS_S3_BUCKET=postit-app-uploads

# 2. Déployer l'application
eb deploy

# 3. Vérifier
curl https://your-api.elasticbeanstalk.com/api/s3/presigned-url
```

### En Kubernetes

```yaml
# kubernetes/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: aws-s3-credentials
type: Opaque
data:
  AWS_ACCESS_KEY_ID: <base64-encoded>
  AWS_SECRET_ACCESS_KEY: <base64-encoded>
  AWS_S3_BUCKET: <base64-encoded>

---
# kubernetes/deployment.yaml
env:
  - name: AWS_ACCESS_KEY_ID
    valueFrom:
      secretKeyRef:
        name: aws-s3-credentials
        key: AWS_ACCESS_KEY_ID
```

## 📖 Ressources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

## ✅ Checklist Intégration

- [ ] Créer S3 bucket AWS
- [ ] Configurer politique CORS
- [ ] Créer utilisateur IAM (optionnel)
- [ ] Ajouter credentials au .env backend
- [ ] Tester endpoint POST /api/s3/presigned-url
- [ ] Tester upload via ImageUploader
- [ ] Vérifier stockage en S3 (Console AWS)
- [ ] Tester suppression d'image (DELETE note)
- [ ] Configurer monitoring CloudWatch
- [ ] Documenter processus pour l'équipe

---

**Statut:** ✅ Implémentation S3 terminée et intégrée
**Dernier update:** 2024
**Maintenance:** À jour
