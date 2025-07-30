#!/bin/bash

# Cura Development Docker Script
# Provides easy commands for Docker development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${GREEN}[Cura]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[Cura]${NC} $1"
}

print_error() {
    echo -e "${RED}[Cura]${NC} $1"
}

# Show usage
usage() {
    echo -e "${BLUE}Cura Development Docker Commands:${NC}"
    echo ""
    echo "  ./docker-dev.sh up        - Start all services"
    echo "  ./docker-dev.sh down      - Stop all services"
    echo "  ./docker-dev.sh build     - Build all images"
    echo "  ./docker-dev.sh restart   - Restart all services"
    echo "  ./docker-dev.sh logs      - Show logs for all services"
    echo "  ./docker-dev.sh status    - Show running containers"
    echo "  ./docker-dev.sh clean     - Clean up containers and volumes"
    echo "  ./docker-dev.sh shell     - Open shell in backend container"
    echo "  ./docker-dev.sh test      - Run tests"
    echo ""
    echo "  Services will be available at:"
    echo "    Frontend:  http://localhost:3000"
    echo "    Backend:   http://localhost:8000"
    echo "    Adminer:   http://localhost:8080"
    echo ""
}

# Start services
up() {
    print_status "Starting Cura development environment..."
    docker compose up -d
    print_status "Services started! Frontend: http://localhost:3000 Backend: http://localhost:8000"
}

# Stop services
down() {
    print_status "Stopping Cura development environment..."
    docker compose down
}

# Build images
build() {
    print_status "Building Cura Docker images..."
    docker compose build
}

# Restart services
restart() {
    print_status "Restarting Cura services..."
    docker compose restart
}

# Show logs
logs() {
    docker compose logs -f $2
}

# Show status
status() {
    docker compose ps
}

# Clean up
clean() {
    print_warning "This will remove all containers, networks, and volumes..."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup complete!"
    fi
}

# Open shell in backend
shell() {
    print_status "Opening shell in backend container..."
    docker compose exec backend /bin/bash
}

# Run tests
test() {
    print_status "Running tests..."
    docker compose exec backend pytest
    docker compose exec frontend npm test -- --coverage --watchAll=false
}

# Main command handler
case "$1" in
    up)
        up
        ;;
    down)
        down
        ;;
    build)
        build
        ;;
    restart)
        restart
        ;;
    logs)
        logs $@
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    shell)
        shell
        ;;
    test)
        test
        ;;
    *)
        usage
        ;;
esac 