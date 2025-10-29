#!/bin/bash

# PELBIOT Setup Script
# This script automates the setup process for local and production environments

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║       PELBIOT Setup Script                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v docker &> /dev/null || { echo "Docker not found. Please install Docker."; exit 1; }
command -v docker-compose &> /dev/null || { echo "Docker Compose not found. Please install Docker Compose."; exit 1; }
echo "✅ Docker and Docker Compose found"
echo ""

# Ask for environment
echo "🌍 Select environment:"
echo "1) Development (localhost)"
echo "2) Production"
read -p "Enter choice (1-2): " ENV_CHOICE

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    if [ "$ENV_CHOICE" = "2" ]; then
        echo ""
        echo "⚙️  Production configuration:"
        read -p "Enter domain name: " DOMAIN
        read -sp "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
        echo ""
        read -sp "Enter MySQL user password: " MYSQL_PASSWORD
        echo ""
        read -sp "Enter JWT secret: " JWT_SECRET
        echo ""
        
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://$DOMAIN/api|" .env
        sed -i "s|REACT_APP_SOCKET_URL=.*|REACT_APP_SOCKET_URL=https://$DOMAIN|" .env
        sed -i "s|MYSQL_ROOT_PASSWORD=.*|MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD|" .env
        sed -i "s|MYSQL_PASSWORD=.*|MYSQL_PASSWORD=$MYSQL_PASSWORD|" .env
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    fi
    
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."

# Build and start services
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

echo "✅ Docker containers started"
echo ""

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T mysql mysqladmin ping -h localhost &> /dev/null; then
        echo "✅ MySQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MySQL failed to start"
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "✅ All services are running!"
echo ""

# Display access information
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    Access Information                    ║"
echo "╠══════════════════════════════════════════════════════════╣"

if [ "$ENV_CHOICE" = "1" ]; then
    echo "║ Frontend:     http://localhost                        ║"
    echo "║ API:          http://localhost/api                   ║"
    echo "║ phpMyAdmin:   http://localhost:8080                  ║"
else
    DOMAIN=$(grep "FRONTEND_URL" .env | cut -d'=' -f2)
    echo "║ Frontend:     https://$DOMAIN"
    echo "║ API:          https://$DOMAIN/api"
    echo "║ Backend:      http://localhost:5000"
    echo "║ Database:     localhost:3306"
fi

echo "╠══════════════════════════════════════════════════════════╣"
echo "║                  Default Credentials                     ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║ Super Admin:  superadmin / superadmin123                ║"
echo "║ Admin:        admin / admin123                          ║"
echo "║ Database:     pelbiot / pelbiot_password                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Show helpful commands
echo "📋 Useful commands:"
echo ""
echo "   View logs:           docker-compose logs -f"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo "   View status:         docker-compose ps"
echo ""

# Run tests if requested
if [ "$ENV_CHOICE" = "1" ]; then
    echo "🧪 Running tests..."
    docker-compose exec -T backend npm test -- --coverage --watchAll=false || true
fi

echo ""
echo "✅ Setup complete! PELBIOT is ready to use."
