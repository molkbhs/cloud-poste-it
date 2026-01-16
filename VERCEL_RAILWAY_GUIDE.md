# 🚀 Vercel + Railway Deployment Guide

## Architecture Finale

```
GitHub (cloud-poste-it)
    ↓
[Vercel] Frontend React          [Railway] Backend Node.js
   ↓                                 ↓
Frontend served globally        API endpoints available
(https://cloud-poste-it.vercel.app)  (https://your-api.railway.app)
                                ↓
                        PostgreSQL + S3
```

---

## PART 1: Vercel Frontend Deployment

### 1. Accès Vercel

```bash
# Visite https://vercel.com/login
# Login avec GitHub account (molkbhs)
```

### 2. Import Project

1. Dashboard → "Add New..." → "Project"
2. Sélectionne "Import Git Repository"
3. Cherche `cloud-poste-it`
4. Clique "Import"

### 3. Configuration Vercel

Dans l'écran de configuration:

**Root Directory:**
- Vercel devrait auto-détecter `frontend`
- Sinon: manuellement définir à `frontend`

**Build Settings (Auto-détecté):**
```
Framework: Create React App
Build Command: npm run build
Output Directory: build
```

**Environment Variables:**

Ajoute:
```
REACT_APP_API_URL = https://cloud-poste-it-api.railway.app
```

(Remplace par l'URL Railway réelle une fois déployée)

### 4. Deploy

Clique "Deploy" → Attends ~2 minutes → 

**Résultat:** 
```
✅ https://cloud-poste-it.vercel.app
```

### 5. Custom Domain (Optionnel)

Settings → Domains → Ajoute ton domaine

---

## PART 2: Railway Backend Deployment

### 1. Accès Railway

```bash
# Visite https://railway.app
# Login avec GitHub (molkbhs)
```

### 2. Créer Nouveau Projet

```bash
# Railway Dashboard → New Project → Deploy from GitHub
```

### 3. Sélectionner Repo

- Cherche `cloud-poste-it`
- Clique pour importer

### 4. Configuration Railway

**Root Directory:** `backend`

**Service Configuration:**

Railway devrait auto-détecter Node.js. Sinon:

```
Build Command: npm install
Start Command: npm start
```

### 5. Ajouter PostgreSQL

Railway → Add → Postgres

Cela crée auto une DB + connection string.

### 6. Environment Variables

Railway automatiquement crée `DATABASE_URL` pour PostgreSQL.

Ajoute les autres manuellement:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://cloud-poste-it.vercel.app
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_S3_BUCKET=postit-app-uploads
```

**Où obtenir AWS Credentials:**
```bash
# AWS Console → IAM → Users → Your User → Security Credentials
# Create Access Key → Copy ID et Secret
```

### 7. Deploy

Railway auto-déploie après config.

**Résultat:**
```
✅ https://cloud-poste-it-api.railway.app
```

Copie cette URL pour étape suivante.

---

## PART 3: Connecter Frontend ↔ Backend

### 1. Mettre à Jour Vercel

Vercel Dashboard → Settings → Environment Variables

```
REACT_APP_API_URL = https://cloud-poste-it-api.railway.app
```

(Remplace par l'URL Railway de PART 2)

Redeploy:
```bash
git push origin main
# Vercel auto-redeploy
```

### 2. Vérifier Configuration Backend

Railway Dashboard → Backend Service → Variables:

Vérifie que `CORS_ORIGIN` est:
```
CORS_ORIGIN=https://cloud-poste-it.vercel.app
```

### 3. Test de Connexion

```bash
# Terminal
curl https://cloud-poste-it-api.railway.app/health

# Résultat attendu:
# {"status":"ok"} ou similaire
```

Si erreur:
```bash
# Check les logs Railway
railway logs
```

---

## PART 4: Test Complet

### Frontend

1. Visite https://cloud-poste-it.vercel.app
2. Crée une note
3. Devrait fonctionner normalement ✅

### Backend

```bash
# Test API directement
curl https://cloud-poste-it-api.railway.app/api/notes

# Ou depuis frontend: Network tab dans DevTools
# Cherche les requêtes vers l'API
```

### Image S3

1. Crée une note avec image
2. Vérifier qu'elle s'upload vers S3
3. Note sauvegardée avec image ✅

---

## 🔧 Troubleshooting

### Erreur: "Cannot GET /"

**Cause:** Vercel ne trouve pas le build

**Solution:**
```bash
# Vérifie que build/ existe
cd frontend
npm run build
git add build/
git commit -m "Add build folder"
git push
```

### Erreur: "CORS policy blocked"

**Cause:** CORS_ORIGIN mal configuré

**Solution:**
Railway → Backend Service → Variables:
```
CORS_ORIGIN=https://cloud-poste-it.vercel.app
```

Redeploy Railway.

### Erreur: "DATABASE_URL not found"

**Cause:** PostgreSQL pas encore créée

**Solution:**
Railway → Add Service → PostgreSQL

Attends 2 min, la var apparaît auto.

### Erreur: "S3 not configured"

**Cause:** AWS credentials manquants/invalides

**Solution:**
```bash
# Vérifier format
echo $AWS_ACCESS_KEY_ID  # Doit commencer par AKIA
echo $AWS_SECRET_ACCESS_KEY  # Long string

# Créer nouveau si expiré
# AWS Console → IAM → Create new access key
```

### Frontend Affiche "Cannot Connect to API"

**Debug:**
1. Ouvre DevTools (F12)
2. Console → cherche erreur
3. Network tab → cherche requête
4. Vérifier REACT_APP_API_URL

**Fix:**
```bash
cd frontend
echo "REACT_APP_API_URL=https://cloud-poste-it-api.railway.app" > .env.production
npm run build
git push
```

---

## 📊 Monitoring

### Vercel Logs

```bash
# Via CLI
npm install -g vercel
vercel logs

# Ou: Dashboard → Deployments → Logs
```

### Railway Logs

```bash
# CLI
railway logs

# Ou: Dashboard → Backend Service → Logs
```

### PostgreSQL Railway

```bash
# Connect directly
railway connect

# Pour vérifier les données
```

---

## 💰 Coûts

| Service | Free Tier | Prix |
|---------|-----------|------|
| Vercel | Unlimited | $0/mois (gratuit pour frontend) |
| Railway | $5 included | $0.50/GB CPU, storage |
| PostgreSQL (Railway) | Inclus | Compté dans Railway |
| AWS S3 | 5GB free | $0.023/GB (après) |

**Total:** ~$5/mois pour production 💚

---

## 🔐 Sécurité

### Ne Pas Commiter Secrets

```bash
# Vérifier .gitignore
cat .gitignore | grep env

# Output doit avoir:
.env
.env.local
.env.production.local
```

Si credentials pushés:
```bash
# URGENT: Révoquer dans AWS
# AWS Console → IAM → Users → Delete Access Key

# Puis créer nouveau:
# AWS Console → IAM → Create Access Key
```

### CORS Configuration

Prodution (Railway):
```
CORS_ORIGIN=https://cloud-poste-it.vercel.app
```

**Jamais:** `CORS_ORIGIN=*`

---

## 📝 Checklist Final

Deployment:
- [ ] Repo poussé à GitHub
- [ ] Frontend déployé Vercel
- [ ] Backend déployé Railway
- [ ] PostgreSQL créée Railway
- [ ] CORS configuré correctement
- [ ] Env variables définies partout
- [ ] AWS S3 bucket et credentials prêts

Testing:
- [ ] Frontend accessible via HTTPS
- [ ] API endpoint répond à /health
- [ ] Créer note fonctionnne
- [ ] Upload image fonctionne
- [ ] Note avec image sauvegardée
- [ ] Delete note fonctionne
- [ ] Image supprimée S3 auto

---

## 🚀 Auto-Deployment Workflow

```
Local Dev
    ↓
git push origin main
    ↓
GitHub reçoit commit
    ↓
Vercel auto-déclenche build (frontend)
Railway auto-déclenche build (backend)
    ↓
Builds compilés en parallèle
    ↓
Tests exécutés (si configurés)
    ↓
Déploiement en production
    ↓
URL active (~2-3 min)
    ↓
Logs disponibles pour debug
```

Aucune action manuelle après push! ✨

---

## 📚 Ressources Utiles

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Create React App Deployment](https://create-react-app.dev/deployment/)
- [Express on Vercel](https://vercel.com/guides/deploying-a-nodejs-express-app-with-vercel)

---

## 💬 Support

**Vercel Issues:** https://vercel.com/support  
**Railway Issues:** https://railway.app/support  
**AWS Issues:** https://aws.amazon.com/support  

---

**Next Step:** Commence par déployer le frontend sur Vercel (5 min), puis le backend (10 min). Total ~20 min! ⏱️
