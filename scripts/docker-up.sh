#!/bin/bash

echo "🐳 Starting Post-it App with Docker Compose..."
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose exists
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Create volumes if they don't exist
docker volume ls | grep postit_postgres_data > /dev/null || \
    docker volume create postit_postgres_data

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo ""
echo "🏥 Checking health..."

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is healthy (http://localhost:3000)"
else
    echo "❌ Frontend is not responding"
fi

# Backend
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is healthy (http://localhost:5000)"
else
    echo "❌ Backend is not responding"
fi

# PostgreSQL
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready > /dev/null 2>&1; then
    echo "✅ PostgreSQL is healthy"
else
    echo "❌ PostgreSQL is not responding"
fi

echo ""
echo "📋 Services running:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 View logs:"
echo "  - Frontend: docker-compose -f docker-compose.prod.yml logs -f frontend"
echo "  - Backend: docker-compose -f docker-compose.prod.yml logs -f backend"
echo "  - Database: docker-compose -f docker-compose.prod.yml logs -f postgres"

echo ""
echo "🛑 To stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
