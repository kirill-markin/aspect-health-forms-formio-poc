#!/bin/bash

# Aspect Health Forms - Form.io POC Setup Script
# This script sets up the complete development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Check if Docker is installed and running
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Node.js is installed
check_node() {
    print_header "Checking Node.js Installation"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Start Docker services
start_services() {
    print_header "Starting Form.io Services"
    
    print_status "Starting MongoDB and Form.io server..."
    docker-compose up -d mongodb formio-server redis
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check if Form.io server is responding by checking the main page
    local retries=0
    local max_retries=12
    
    while [ $retries -lt $max_retries ]; do
        if curl -f http://localhost:3002 &> /dev/null; then
            print_success "Form.io server is ready"
            break
        fi
        
        retries=$((retries + 1))
        print_status "Waiting for Form.io server... (attempt $retries/$max_retries)"
        sleep 10
    done
    
    if [ $retries -eq $max_retries ]; then
        print_error "Form.io server failed to start. Check logs with: docker-compose logs formio-server"
        exit 1
    fi
}

# Initialize Form.io project
init_formio() {
    print_header "Initializing Form.io Project"
    
    # Create project if it doesn't exist
    print_status "Setting up Form.io project..."
    
    # Note: Form.io creates the project automatically based on environment variables
    # We'll verify it's accessible
    if curl -f http://localhost:3002 &> /dev/null; then
        print_success "Form.io project initialized successfully"
    else
        print_warning "Form.io project may need manual setup. Check the admin interface."
    fi
}

# Set up React Native app
setup_react_native() {
    print_header "Setting Up React Native App"
    
    if [ ! -d "app" ]; then
        print_error "React Native app directory not found. Please ensure the app directory exists."
        exit 1
    fi
    
    cd app
    
    # Install dependencies
    print_status "Installing React Native dependencies..."
    npm install
    
    # Create environment file
    print_status "Creating app environment configuration..."
    cat > .env << EOF
EXPO_PUBLIC_FORMIO_URL=http://localhost:3002
EXPO_PUBLIC_FORMIO_PROJECT_URL=http://localhost:3002/project
EXPO_PUBLIC_APP_NAME=Aspect Health Forms
EOF
    
    cd ..
    print_success "React Native app setup complete"
}

# Seed demo data into Form.io
seed_demo_data() {
    print_header "Creating Demo Forms"
    
    print_status "Importing forms into Form.io..."
    
    # Run the Node.js import script
    if [ -f "scripts/import-forms.js" ]; then
        node scripts/import-forms.js
        if [ $? -eq 0 ]; then
            print_success "Forms imported successfully"
        else
            print_warning "Form import failed, but setup will continue"
            print_warning "You can run 'node scripts/import-forms.js' manually later"
        fi
    else
        print_warning "Form import script not found"
        print_warning "Demo forms will need to be created manually"
    fi
}

# Validate setup
validate_setup() {
    print_header "Validating Setup"
    
    # Check Docker services
    print_status "Checking Docker services..."
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some Docker services are not running"
        docker-compose ps
        exit 1
    fi
    
    # Check Form.io server response
    print_status "Testing Form.io server..."
    if ! curl -f http://localhost:3002 &> /dev/null; then
        print_error "Form.io server is not responding"
        exit 1
    fi
    
    # Check MongoDB
    print_status "Testing MongoDB connection..."
    if ! docker-compose exec -T mongodb mongo --eval "db.runCommand({ping: 1})" &> /dev/null; then
        print_error "MongoDB is not accessible"
        exit 1
    fi
    
    print_success "All services are running correctly"
}

# Print final instructions
print_final_instructions() {
    print_header "Setup Complete! 🎉"
    
    echo -e "${GREEN}Your Form.io POC is now ready!${NC}\n"
    
    echo -e "${BLUE}📋 Access URLs:${NC}"
    echo -e "  • Form.io Admin: ${YELLOW}http://localhost:3002${NC}"
    echo -e "  • Login: ${YELLOW}admin@example.com${NC} / ${YELLOW}password123${NC}"
    echo -e "  • API Base: ${YELLOW}http://localhost:3002${NC}"
    echo -e "  • MongoDB: ${YELLOW}mongodb://localhost:27017${NC}"
    
    echo -e "\n${BLUE}🚀 Next Steps:${NC}"
    echo -e "  1. Start the React Native app:"
    echo -e "     ${YELLOW}cd app && npm start${NC}"
    echo -e "     Then press 'w' for web browser (easiest for testing)"
    echo -e "  2. Test demo forms in Form.io admin interface"
    echo -e "  3. Test complete flow: admin → mobile app → responses"
    
    echo -e "\n${BLUE}🎯 Quick Testing Guide:${NC}"
    echo -e "  1. Open Form.io Admin and explore demo forms"
    echo -e "  2. Open React Native app (web browser)"
    echo -e "  3. Complete a demo form and check responses in admin"
    
    echo -e "\n${BLUE}🔧 Useful Commands:${NC}"
    echo -e "  • View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  • Stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "  • Restart services: ${YELLOW}docker-compose restart${NC}"
    echo -e "  • Validate setup: ${YELLOW}./scripts/validate.sh${NC}"
    
    echo -e "\n${BLUE}📚 Documentation:${NC}"
    echo -e "  • Project overview: ${YELLOW}tmp/00_init/00_project_overview.md${NC}"
    echo -e "  • Full README: ${YELLOW}README.md${NC}"
    
    echo -e "\n${GREEN}Happy coding! 🎯${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                 Aspect Health Forms - Form.io POC              ║"
    echo "║                        Setup Script                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Run setup steps
    check_docker
    check_node
    start_services
    init_formio
    setup_react_native
    seed_demo_data
    validate_setup
    print_final_instructions
}

# Run main function
main "$@"