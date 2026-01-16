# 🚀 Post-it App - Quick Reference Card

## ⚡ 5-Minute Setup

```bash
# 1. MongoDB Atlas (1 minute)
# https://www.mongodb.com/cloud/atlas
# Create free M0 cluster, copy connection string

# 2. Configure backend
echo "DATABASE_URL=mongodb+srv://user:pass@cluster..." > backend/.env

# 3. Install & Run
cd backend && npm install && npm start
# In another terminal:
cd frontend && npm install && npm start

# 4. Open app
# http://localhost:3000
```

---

## 📁 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `backend/server.js` | Express API + MongoDB | ✅ Migrated |
| `backend/models/Note.js` | Mongoose schema | ✅ Created |
| `backend/migrate-to-mongodb.js` | JSON → MongoDB migration | ✅ Created |
| `.env.example` | Environment variables | ✅ Updated |
| `.ebextensions/` | AWS Elastic Beanstalk config | ✅ Created |
| `cloudformation-template.yaml` | Infrastructure as Code | ✅ Created |
| `deploy-aws.sh` | Automated AWS deployment | ✅ Created |

---

## 🔄 API Endpoints

```bash
# Get all notes
curl http://localhost:5000/api/notes

# Create note
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Body"}'

# Update note
curl -X PUT http://localhost:5000/api/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}'

# Delete note
curl -X DELETE http://localhost:5000/api/notes/{id}

# Health check
curl http://localhost:5000/health
```

---

## 🌐 Environment Variables

```bash
# Backend (backend/.env)
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

# Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## 🐳 Docker

```bash
# Run with Docker Compose
docker-compose up

# Build manually
docker build -f Dockerfile.backend -t postit-backend .
docker build -f Dockerfile.frontend -t postit-frontend .

# Run containers
docker run -p 5000:5000 postit-backend
docker run -p 3000:3000 postit-frontend
```

---

## ☁️ AWS Deployment

```bash
# Option 1: Automated
chmod +x deploy-aws.sh
./deploy-aws.sh postit-app-prod

# Option 2: Manual
eb init postit-app --region us-east-1
eb create postit-app-prod --instance-type t3.micro
eb setenv DATABASE_URL='mongodb+srv://...'
eb deploy

# View logs
eb logs --stream

# Open app
eb open
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
mongosh "mongodb+srv://..."

# Verify IP whitelist in MongoDB Atlas
# https://cloud.mongodb.com/ → Network Access
```

### CORS Error
```bash
# Frontend .env
REACT_APP_API_URL=http://localhost:5000

# Backend .env
CORS_ORIGIN=http://localhost:3000
```

### 503 Service Unavailable
```bash
# Check health
curl http://localhost:5000/health

# View logs
npm start  # Look for errors

# AWS logs
eb logs
```

---

## 📊 Database

### Switch to MongoDB
✅ All endpoints converted (GET, POST, PUT, DELETE)
✅ Mongoose schema with validation
✅ Indexes for performance
✅ Graceful shutdown

### What Changed
- ❌ JSON file storage
- ✅ MongoDB Atlas cloud database
- ❌ File system operations
- ✅ Async/await queries
- ❌ Manual backups
- ✅ Automatic backups

---

## 🔐 Security Checklist

- [ ] DATABASE_URL not in .git
- [ ] Strong MongoDB password (32+ chars)
- [ ] IP whitelist configured (not 0.0.0.0/0 in prod)
- [ ] CORS_ORIGIN set to production domain
- [ ] HTTPS/SSL enabled (AWS Certificate Manager)
- [ ] Environment variables in AWS (not hardcoded)

---

## 📈 Monitoring

```bash
# Local logs
npm start  # Errors appear in console

# Docker logs
docker logs postit-backend
docker logs postit-frontend

# AWS CloudWatch
eb logs
aws logs tail /aws/elasticbeanstalk/postit-app-prod

# Health endpoint
curl http://localhost:5000/health
```

---

## 💰 Costs

| Service | Price |
|---------|-------|
| MongoDB Atlas M0 | Free |
| AWS EC2 t3.micro | Free (1 yr) / $7.50/mo |
| Load Balancer | ~$16/mo |
| Data Transfer | ~$5/mo |
| SSL Certificate | Free |
| **TOTAL** | **~$20/mo** |

---

## 📚 Documentation

- `MONGODB_SETUP.md` - MongoDB configuration guide
- `AWS_DEPLOYMENT.md` - Detailed AWS guide
- `MONGODB_MIGRATION_README.md` - Complete overview
- `MIGRATION_COMPLETE.md` - What was done

---

## 🎯 Next Steps

1. ✅ Setup MongoDB (5 min)
2. ✅ Configure .env (2 min)
3. ✅ Run locally (2 min)
4. ✅ Migrate JSON data (2 min) - Optional
5. ✅ Deploy to AWS (15 min)

---

## 📞 Support

**MongoDB:** https://docs.mongodb.com/atlas/
**AWS:** https://docs.aws.amazon.com/elasticbeanstalk/
**Express:** https://expressjs.com/
**React:** https://react.dev/

---

**Version:** 2.0.0 | **Status:** ✅ Production Ready
