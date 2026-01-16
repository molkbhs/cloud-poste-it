#!/bin/bash

# Configuration
AWS_ACCOUNT_ID=${1:-"YOUR_ACCOUNT_ID"}
AWS_REGION=${2:-"us-east-1"}
IMAGE_TAG=${3:-"latest"}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "🚀 Building and pushing Docker images to ECR"
echo "================================================"
echo "Registry: $ECR_REGISTRY"
echo "Tag: $IMAGE_TAG"
echo ""

# Login to ECR
echo "📝 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Frontend Image
echo ""
echo "🏗️  Building Frontend image..."
docker build -f frontend/Dockerfile.prod -t postit-frontend:$IMAGE_TAG ./frontend
docker tag postit-frontend:$IMAGE_TAG $ECR_REGISTRY/postit-frontend:$IMAGE_TAG
docker tag postit-frontend:$IMAGE_TAG $ECR_REGISTRY/postit-frontend:latest

echo "📤 Pushing Frontend image..."
docker push $ECR_REGISTRY/postit-frontend:$IMAGE_TAG
docker push $ECR_REGISTRY/postit-frontend:latest

# Backend Image
echo ""
echo "🏗️  Building Backend image..."
docker build -f backend/Dockerfile.prod -t postit-backend:$IMAGE_TAG ./backend
docker tag postit-backend:$IMAGE_TAG $ECR_REGISTRY/postit-backend:$IMAGE_TAG
docker tag postit-backend:$IMAGE_TAG $ECR_REGISTRY/postit-backend:latest

echo "📤 Pushing Backend image..."
docker push $ECR_REGISTRY/postit-backend:$IMAGE_TAG
docker push $ECR_REGISTRY/postit-backend:latest

echo ""
echo "✅ All images pushed successfully!"
echo ""
echo "Next steps:"
echo "1. Update Task Definitions with ECR URLs:"
echo "   - Replace YOUR_ECR_REGISTRY with: $ECR_REGISTRY"
echo "2. Register Task Definitions:"
echo "   aws ecs register-task-definition --cli-input-json file://aws/ecs-task-frontend.json"
echo "   aws ecs register-task-definition --cli-input-json file://aws/ecs-task-backend.json"
echo "3. Deploy CloudFormation stack:"
echo "   aws cloudformation create-stack --template-body file://aws/ecs-stack.yaml --stack-name postit-ecs"
