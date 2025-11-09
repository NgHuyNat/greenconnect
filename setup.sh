#!/bin/bash

# GreenConnect Development Setup Script
# This script helps you set up and run the GreenConnect application

set -e

echo "🌱 GreenConnect Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d. -f1 | cut -dv -f2)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js version: $(node --version) ✓"
}

# Check if PostgreSQL is available
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL CLI not found. Make sure PostgreSQL is installed."
        print_warning "You can use Docker: docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15"
    else
        print_status "PostgreSQL CLI found ✓"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing root dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd apps/backend && npm install && cd ../..
    
    print_status "Installing frontend dependencies..."
    cd apps/frontend && npm install && cd ../..
    
    print_status "All dependencies installed ✓"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "apps/backend/.env" ]; then
        cp apps/backend/.env.example apps/backend/.env
        print_status "Created apps/backend/.env from example"
        print_warning "Please update DATABASE_URL and other variables in apps/backend/.env"
    else
        print_status "Backend .env already exists"
    fi
    
    # Frontend .env.local
    if [ ! -f "apps/frontend/.env.local" ]; then
        cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
EOF
        print_status "Created apps/frontend/.env.local"
        print_warning "Please update Google Maps API key in apps/frontend/.env.local"
    else
        print_status "Frontend .env.local already exists"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd apps/backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Ask user if they want to run migrations
    echo ""
    read -p "Do you want to run database migrations? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Running database migrations..."
        npx prisma migrate dev --name init
        print_status "Database migrations completed ✓"
    else
        print_warning "Skipped database migrations. Run 'npm run db:migrate' later."
    fi
    
    cd ../..
}

# Main setup function
main() {
    echo ""
    print_status "Starting GreenConnect setup..."
    
    check_node
    check_postgres
    
    echo ""
    read -p "Continue with installation? (Y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_status "Setup cancelled."
        exit 0
    fi
    
    install_dependencies
    setup_env
    setup_database
    
    echo ""
    print_status "🎉 Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "  1. Update environment variables in apps/backend/.env"
    echo "  2. Update Google Maps API key in apps/frontend/.env.local"
    echo "  3. Start development: npm run dev"
    echo ""
    print_status "Available commands:"
    echo "  npm run dev          # Start both backend and frontend"
    echo "  npm run dev:backend  # Start only backend"
    echo "  npm run dev:frontend # Start only frontend"
    echo "  npm run db:studio    # Open Prisma Studio"
    echo ""
    print_status "URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo "  API Docs: http://localhost:3001/api/docs"
    echo "  DB Studio: http://localhost:5555 (when running)"
    echo ""
}

# Run main function
main