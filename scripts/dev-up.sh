#!/bin/bash

# Start development environment
# This script starts only the core services needed for development

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_status "Starting Form.io development environment..."

# Start core services
docker-compose up -d mongodb formio-server redis

print_status "Waiting for services to be ready..."
sleep 15

# Check if Form.io server is responding
for i in {1..10}; do
    if curl -f http://localhost:3002/health &> /dev/null; then
        print_success "Form.io server is ready at http://localhost:3002"
        break
    fi
    print_status "Waiting for Form.io server... (attempt $i/10)"
    sleep 5
done

print_success "Development environment is ready!"
echo -e "\nAccess URLs:"
echo -e "  • Form.io Admin: http://localhost:3002"
echo -e "  • Login: admin@example.com / password123"