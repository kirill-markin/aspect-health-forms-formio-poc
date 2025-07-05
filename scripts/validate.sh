#!/bin/bash

# Validation script for Form.io POC setup
# Checks if all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Validation results
VALIDATION_PASSED=true

# Check Docker services
check_docker_services() {
    print_header "Docker Services Status"
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        VALIDATION_PASSED=false
        return
    fi
    
    # Check running services
    local services=("mongodb" "formio-server" "redis")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
            VALIDATION_PASSED=false
        fi
    done
}

# Check Form.io API
check_formio_api() {
    print_header "Form.io API Health Check"
    
    # Main page endpoint
    if curl -f http://localhost:3002 &> /dev/null; then
        print_success "Form.io server is responding"
    else
        print_error "Form.io server is not responding"
        VALIDATION_PASSED=false
    fi
    
    # Project endpoint
    if curl -f http://localhost:3002/project &> /dev/null; then
        print_success "Form.io project endpoint is accessible"
    else
        print_warning "Form.io project endpoint may need configuration"
    fi
    
    # Forms endpoint
    if curl -f http://localhost:3002/form &> /dev/null; then
        print_success "Form.io forms endpoint is accessible"
    else
        print_warning "Form.io forms endpoint may be empty (no forms created yet)"
    fi
}

# Check MongoDB
check_mongodb() {
    print_header "MongoDB Connection"
    
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand({ping: 1})" &> /dev/null; then
        print_success "MongoDB is accessible and responding"
    else
        print_error "MongoDB connection failed"
        VALIDATION_PASSED=false
    fi
    
    # Check if Form.io database exists
    if docker-compose exec -T mongodb mongosh --eval "use formio; db.stats()" &> /dev/null; then
        print_success "Form.io database exists"
    else
        print_warning "Form.io database may not be initialized yet"
    fi
}

# Check Redis
check_redis() {
    print_header "Redis Connection"
    
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is accessible and responding"
    else
        print_error "Redis connection failed"
        VALIDATION_PASSED=false
    fi
}

# Check React Native app
check_react_native() {
    print_header "React Native App"
    
    if [ -d "app" ]; then
        print_success "React Native app directory exists"
        
        if [ -f "app/package.json" ]; then
            print_success "package.json found"
        else
            print_warning "package.json not found in app directory"
        fi
        
        if [ -f "app/.env" ]; then
            print_success "App environment file exists"
        else
            print_warning "App environment file not found"
        fi
        
        if [ -d "app/node_modules" ]; then
            print_success "Node modules installed"
        else
            print_warning "Node modules not installed. Run: cd app && npm install"
        fi
    else
        print_error "React Native app directory not found"
        VALIDATION_PASSED=false
    fi
}

# Check configuration files
check_configuration() {
    print_header "Configuration Files"
    
    local config_files=("docker-compose.yml" ".env" "scripts/setup.sh")
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            VALIDATION_PASSED=false
        fi
    done
}

# Check port availability
check_ports() {
    print_header "Port Availability"
    
    local ports=("3002" "27017" "6379")
    
    for port in "${ports[@]}"; do
        if lsof -i :$port &> /dev/null; then
            print_success "Port $port is in use (service running)"
        else
            print_warning "Port $port is not in use (service may not be running)"
        fi
    done
}

# Performance check
check_performance() {
    print_header "Performance Check"
    
    # Check Form.io response time
    local start_time=$(date +%s%N)
    if curl -f http://localhost:3002 &> /dev/null; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        
        if [ $duration -lt 1000 ]; then
            print_success "Form.io response time: ${duration}ms (excellent)"
        elif [ $duration -lt 3000 ]; then
            print_success "Form.io response time: ${duration}ms (good)"
        else
            print_warning "Form.io response time: ${duration}ms (slow)"
        fi
    fi
}

# Print summary
print_summary() {
    print_header "Validation Summary"
    
    if [ "$VALIDATION_PASSED" = true ]; then
        echo -e "${GREEN}✅ All validations passed!${NC}\n"
        
        echo -e "${BLUE}🎉 Your Form.io POC is ready to use!${NC}\n"
        
        echo -e "${BLUE}Quick Access:${NC}"
        echo -e "  • Form.io Admin: ${YELLOW}http://localhost:3002${NC}"
        echo -e "  • Login: ${YELLOW}admin@example.com${NC} / ${YELLOW}password123${NC}"
        echo -e "  • Start React Native: ${YELLOW}cd app && npm start${NC}"
        
    else
        echo -e "${RED}❌ Some validations failed!${NC}\n"
        
        echo -e "${YELLOW}Troubleshooting:${NC}"
        echo -e "  • Check Docker services: ${YELLOW}docker-compose ps${NC}"
        echo -e "  • View logs: ${YELLOW}docker-compose logs -f${NC}"
        echo -e "  • Restart services: ${YELLOW}docker-compose restart${NC}"
        echo -e "  • Complete reset: ${YELLOW}./scripts/reset.sh${NC}"
        
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                 Form.io POC Validation                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_docker_services
    check_formio_api
    check_mongodb
    check_redis
    check_react_native
    check_configuration
    check_ports
    check_performance
    print_summary
}

# Run main function
main "$@"