#!/bin/bash

set -e

echo "🌐 Starting GreenConnect Cloudflare Tunnel Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root for some operations
check_root() {
    if [[ $EUID -eq 0 ]]; then
        echo -e "${RED}❌ Don't run this script as root!${NC}"
        echo "Run as regular user - we'll use sudo when needed"
        exit 1
    fi
}

# Check required dependencies
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed!${NC}"
        echo "Install Docker first: sudo pacman -S docker"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not available!${NC}"
        echo "Install Docker Compose: sudo pacman -S docker-compose"
        exit 1
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        echo -e "${YELLOW}⚠️  User not in docker group. Adding...${NC}"
        sudo usermod -aG docker $USER
        echo "Please logout and login again, then re-run this script"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies check passed${NC}"
}

# Install cloudflared locally (for tunnel setup only)
install_cloudflared() {
    echo "📦 Installing cloudflared CLI..."
    
    if command -v cloudflared &> /dev/null; then
        echo -e "${GREEN}✅ cloudflared already installed${NC}"
        return
    fi
    
    # Install from AUR for Arch/EndeavourOS
    if command -v yay &> /dev/null; then
        yay -S cloudflared
    elif command -v paru &> /dev/null; then
        paru -S cloudflared
    else
        # Download binary directly
        echo "📥 Downloading cloudflared binary..."
        curl -L --output cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm
        rpm2cpio cloudflared.rpm | cpio -idmv
        sudo mv usr/bin/cloudflared /usr/local/bin/
        sudo chmod +x /usr/local/bin/cloudflared
        rm -rf usr cloudflared.rpm
    fi
    
    echo -e "${GREEN}✅ cloudflared installed${NC}"
}

# Setup Cloudflare Tunnel
setup_tunnel() {
    echo "🌐 Setting up Cloudflare Tunnel..."
    
    echo -e "${BLUE}📋 Please follow these steps to create your tunnel:${NC}"
    echo ""
    echo "1. Go to Cloudflare Dashboard: https://one.dash.cloudflare.com/"
    echo "2. Navigate to Zero Trust > Networks > Tunnels"
    echo "3. Click 'Create a tunnel'"
    echo "4. Choose 'Cloudflared' and name it 'greenconnect-tunnel'"
    echo "5. Copy the tunnel token (starts with 'eyJ...')"
    echo ""
    
    read -p "📝 Paste your Cloudflare Tunnel Token here: " tunnel_token
    
    if [ -z "$tunnel_token" ]; then
        echo -e "${RED}❌ Tunnel token cannot be empty!${NC}"
        exit 1
    fi
    
    # Update .env file with tunnel token
    if grep -q "CLOUDFLARE_TUNNEL_TOKEN=" .env; then
        sed -i "s/CLOUDFLARE_TUNNEL_TOKEN=.*/CLOUDFLARE_TUNNEL_TOKEN=$tunnel_token/" .env
    else
        echo "CLOUDFLARE_TUNNEL_TOKEN=$tunnel_token" >> .env
    fi
    
    echo -e "${GREEN}✅ Tunnel token saved to .env${NC}"
    
    echo ""
    echo -e "${BLUE}📋 Now configure your tunnel routes in Cloudflare Dashboard:${NC}"
    echo ""
    echo "In the 'Public Hostname' section, add:"
    echo "  Subdomain: greenconnect"
    echo "  Domain: hynat.io.vn" 
    echo "  Service Type: HTTP"
    echo "  Service URL: nginx:80"
    echo ""
    echo "Click 'Save tunnel' when done."
    echo ""
    read -p "Press Enter when you've configured the tunnel routes..."
}

# Validate environment
validate_env() {
    echo "🔍 Validating environment..."
    
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Error: .env file not found!${NC}"
        echo "📝 Please create .env file first"
        exit 1
    fi
    
    # Load environment variables
    export $(grep -v '^#' .env | xargs)
    
    # Validate required variables
    REQUIRED_VARS=("DB_PASSWORD" "JWT_SECRET" "REDIS_PASSWORD" "CLOUDFLARE_TUNNEL_TOKEN")
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Error: $var is not set in .env file${NC}"
            exit 1
        fi
    done
    
    echo -e "${GREEN}✅ Environment variables validated${NC}"
}

# Deploy application
deploy_app() {
    echo "🚀 Deploying application with Cloudflare Tunnel..."
    
    # Pull latest code
    echo "📦 Pulling latest code..."
    git pull origin main || echo -e "${YELLOW}⚠️  Git pull failed, continuing with local code${NC}"
    
    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker compose -f docker-compose.tunnel.yml down || true
    
    # Remove old images (optional)
    read -p "🗑️  Remove old Docker images? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old images..."
        docker image prune -f
        docker system prune -f
    fi
    
    # Build and start services
    echo "🏗️  Building and starting services..."
    docker compose -f docker-compose.tunnel.yml up --build -d
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be healthy..."
    sleep 30
    
    # Check service status
    echo "🔍 Checking service status..."
    docker compose -f docker-compose.tunnel.yml ps
    
    # Test local endpoint
    echo "🧪 Testing local endpoints..."
    sleep 10
    
    # Test local health check
    if curl -f http://localhost/health &> /dev/null; then
        echo -e "${GREEN}✅ Local health check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Local health check failed${NC}"
    fi
    
    # Show logs
    echo "📋 Showing recent logs..."
    docker compose -f docker-compose.tunnel.yml logs --tail=20
}

# Setup monitoring
setup_monitoring() {
    echo "📊 Setting up monitoring for tunnel..."
    
    # Create tunnel monitoring script
    cat > monitor-tunnel.sh << 'EOF'
#!/bin/bash
echo "=== GreenConnect Tunnel Health Check ==="
echo "Date: $(date)"
echo ""

echo "=== Docker Services ==="
docker compose -f docker-compose.tunnel.yml ps
echo ""

echo "=== Cloudflare Tunnel Status ==="
docker logs greenconnect-cloudflared --tail=10
echo ""

echo "=== Nginx Access Logs ==="
tail -n 5 logs/nginx/access.log
echo ""

echo "=== Resource Usage ==="
docker stats --no-stream
echo ""

echo "=== Test Endpoints ==="
echo "Local health: $(curl -s http://localhost/health || echo 'FAILED')"
echo "Public health: $(curl -s https://greenconnect.hynat.io.vn/health || echo 'FAILED')"
EOF
    
    chmod +x monitor-tunnel.sh
    echo -e "${GREEN}✅ Tunnel monitoring script created (./monitor-tunnel.sh)${NC}"
}

# Setup backup
setup_backup() {
    echo "💾 Setting up database backup..."
    
    # Create backup script (same as before but with tunnel compose file)
    cat > backup-db-tunnel.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="greenconnect_backup_${DATE}.sql"

echo "🗄️  Creating database backup..."
docker exec greenconnect-postgres pg_dump -U postgres greenconnect > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"
echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Keep only last 7 backups
find "${BACKUP_DIR}" -name "greenconnect_backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Old backups cleaned up"
EOF
    
    chmod +x backup-db-tunnel.sh
    
    # Setup cron job for daily backup
    (crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./backup-db-tunnel.sh >> logs/backup.log 2>&1") | crontab -
    
    echo -e "${GREEN}✅ Database backup configured (daily at 2 AM)${NC}"
}

# Test tunnel connection
test_tunnel() {
    echo "🧪 Testing tunnel connection..."
    
    echo "Waiting for tunnel to establish connection..."
    sleep 20
    
    # Test public endpoint
    if curl -f -s https://greenconnect.hynat.io.vn/health > /dev/null; then
        echo -e "${GREEN}✅ Public tunnel connection working!${NC}"
    else
        echo -e "${YELLOW}⚠️  Public tunnel connection failed${NC}"
        echo "Check Cloudflare dashboard and tunnel configuration"
        echo "Tunnel logs:"
        docker logs greenconnect-cloudflared --tail=10
    fi
}

# Main deployment flow
main() {
    check_root
    check_dependencies
    install_cloudflared
    setup_tunnel
    validate_env
    deploy_app
    setup_monitoring
    setup_backup
    test_tunnel
    
    echo ""
    echo -e "${GREEN}🎉 Cloudflare Tunnel deployment completed!${NC}"
    echo ""
    echo "📍 Access your application at:"
    echo "   🌐 Frontend: https://greenconnect.hynat.io.vn"
    echo "   🔌 Backend API: https://greenconnect.hynat.io.vn/api/v1"
    echo "   🏠 Local (debugging): http://localhost/health"
    echo ""
    echo "🛠️  Management commands:"
    echo "   📊 Monitor: ./monitor-tunnel.sh"
    echo "   💾 Backup: ./backup-db-tunnel.sh"
    echo "   📋 Logs: docker compose -f docker-compose.tunnel.yml logs -f"
    echo "   🔄 Restart: docker compose -f docker-compose.tunnel.yml restart"
    echo "   🛑 Stop: docker compose -f docker-compose.tunnel.yml down"
    echo "   🌐 Tunnel logs: docker logs greenconnect-cloudflared -f"
    echo ""
    echo -e "${BLUE}📝 Benefits of Cloudflare Tunnel:${NC}"
    echo "   ✅ No port forwarding needed"
    echo "   ✅ Built-in DDoS protection"
    echo "   ✅ Automatic HTTPS/SSL"
    echo "   ✅ Global CDN"
    echo "   ✅ Zero Trust security"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "   1. Test all functionality at https://greenconnect.hynat.io.vn"
    echo "   2. Monitor tunnel connection with ./monitor-tunnel.sh"
    echo "   3. Setup Cloudflare security rules if needed"
    echo "   4. Configure Cloudflare caching rules"
    echo ""
}

# Run main function
main "$@"