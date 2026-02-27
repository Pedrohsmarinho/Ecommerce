#!/bin/bash

echo "🚀 Starting E-commerce Project..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env exists in server folder
if [ ! -f "server/.env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp server/.env.example server/.env
    echo "⚠️  Please configure your .env file in server/.env before continuing."
    echo "   Press Enter after editing the file..."
    read
fi

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker compose down

# Start services
echo "🐳 Starting Docker containers..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check services status
echo "📊 Checking services status..."
docker compose ps

echo ""
echo "✅ Project started successfully!"
echo ""
echo "🌐 Services:"
echo "   - Backend API: http://localhost:3000"
echo "   - Swagger Docs: http://localhost:3000/api"
echo "   - PostgreSQL: localhost:5433"
echo "   - Redis: localhost:6380"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose logs -f server"
echo "   - Stop services: docker compose down"
echo "   - Restart: docker compose restart"
echo ""
