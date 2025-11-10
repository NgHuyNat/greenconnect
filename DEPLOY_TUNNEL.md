# 🌐 Deploy GreenConnect với Cloudflare Tunnel

## 🎯 Tổng quan

Deploy GreenConnect lên homelab sử dụng Cloudflare Tunnel để:

- ✅ Không cần port forwarding
- ✅ Không cần cấu hình router
- ✅ Auto SSL/HTTPS miễn phí
- ✅ DDoS protection tự động
- ✅ Global CDN
- ✅ Truy cập từ bất kỳ đâu qua domain

---

## 📋 Yêu cầu

### **1. Domain**

- Domain riêng (ví dụ: `hynat.io.vn` hoặc `greenconnect.com`)
- Domain phải được quản lý trên Cloudflare (miễn phí)

### **2. Homelab Server**

- OS: Ubuntu/Debian/EndeavourOS (bất kỳ Linux nào)
- Docker & Docker Compose
- Internet connection
- Ít nhất 2GB RAM free

### **3. Cloudflare Account**

- Account miễn phí tại: https://dash.cloudflare.com/sign-up
- Domain đã add vào Cloudflare

---

## 🚀 Hướng dẫn Deploy

### **Bước 1: Chuẩn bị Cloudflare**

#### **1.1. Add domain vào Cloudflare (nếu chưa có)**

1. Login: https://dash.cloudflare.com
2. Click "Add a Site"
3. Nhập domain: `greenconnect.com` (hoặc domain của bạn)
4. Chọn plan Free
5. Update nameservers ở domain registrar về Cloudflare:
   ```
   NS1: ava.ns.cloudflare.com
   NS2: brad.ns.cloudflare.com
   ```
6. Chờ domain active (~5-10 phút)

#### **1.2. Tạo Cloudflare Tunnel**

1. Truy cập: https://one.dash.cloudflare.com
2. Chọn domain của bạn
3. Navigate: **Zero Trust** → **Networks** → **Tunnels**
4. Click **"Create a tunnel"**
5. Chọn **"Cloudflared"**
6. Đặt tên: `greenconnect-tunnel`
7. Click **"Save tunnel"**
8. **QUAN TRỌNG:** Copy **Tunnel Token** (bắt đầu bằng `eyJ...`)
   - Token này dùng 1 lần, lưu lại!

#### **1.3. Configure Tunnel Routes**

Trong tunnel vừa tạo, section **"Public Hostnames"**, thêm:

| Subdomain      | Domain           | Service Type | Service URL |
| -------------- | ---------------- | ------------ | ----------- |
| (blank) hoặc @ | greenconnect.com | HTTP         | nginx:80    |
| www            | greenconnect.com | HTTP         | nginx:80    |
| api            | greenconnect.com | HTTP         | nginx:80    |

Click **"Save"**

---

### **Bước 2: Deploy trên Homelab Server**

#### **2.1. SSH vào server**

```bash
ssh user@homelab-ip
cd /opt/greenconnect  # hoặc nơi bạn clone project
```

#### **2.2. Tạo file .env**

```bash
cp .env.tunnel .env
nano .env
```

Sửa các giá trị:

```env
# Database
DB_PASSWORD=YourVeryStrongPassword123!@#

# JWT Secret (32+ characters random string)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-12345

# Domain URLs
CORS_ORIGIN=https://greenconnect.com,https://www.greenconnect.com
NEXT_PUBLIC_API_URL=https://greenconnect.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://greenconnect.com

# Cloudflare Tunnel Token (paste token từ bước 1.2)
CLOUDFLARE_TUNNEL_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-token-here

# Optional
REDIS_PASSWORD=redis-password-123
```

#### **2.3. Chạy script deploy**

```bash
chmod +x deploy-tunnel.sh
./deploy-tunnel.sh
```

Script sẽ:

1. ✅ Check dependencies (Docker, Docker Compose)
2. ✅ Validate .env file
3. ✅ Build Docker images
4. ✅ Start all services (Postgres, Redis, Backend, Frontend, Nginx, Cloudflared)
5. ✅ Setup monitoring script
6. ✅ Setup auto backup
7. ✅ Test tunnel connection

#### **2.4. Chờ services khởi động**

```bash
# Xem logs real-time
docker compose -f docker-compose.tunnel.yml logs -f

# Check tunnel connection
docker logs greenconnect-cloudflared -f
```

Khi thấy log:

```
2025/11/10 10:00:00 Connection established
2025/11/10 10:00:00 Registered tunnel connection
```

→ Tunnel đã sẵn sàng!

---

### **Bước 3: Kiểm tra Deployment**

#### **3.1. Test từ browser**

Mở browser và truy cập:

- ✅ Frontend: `https://greenconnect.com`
- ✅ Backend: `https://greenconnect.com/api/v1/health`
- ✅ Swagger: `https://greenconnect.com/api/docs`

#### **3.2. Test WebSocket (Chat)**

1. Login vào app
2. Vào trang Chat
3. Gửi tin nhắn
4. Check real-time updates

#### **3.3. Monitor services**

```bash
# Quick health check
./monitor-tunnel.sh

# Docker stats
docker stats

# Service logs
docker compose -f docker-compose.tunnel.yml logs backend -f
docker compose -f docker-compose.tunnel.yml logs frontend -f

# Tunnel logs
docker logs greenconnect-cloudflared -f
```

---

## 🔧 Quản lý & Troubleshooting

### **Restart services**

```bash
docker compose -f docker-compose.tunnel.yml restart

# Restart specific service
docker compose -f docker-compose.tunnel.yml restart backend
docker compose -f docker-compose.tunnel.yml restart cloudflare-tunnel
```

### **Stop all services**

```bash
docker compose -f docker-compose.tunnel.yml down
```

### **Update code và redeploy**

```bash
git pull origin main
docker compose -f docker-compose.tunnel.yml down
docker compose -f docker-compose.tunnel.yml up --build -d
```

### **Backup database**

```bash
# Manual backup
./backup-db-tunnel.sh

# Auto backup đã setup: daily 2 AM
# Check backups
ls -lh ./backups/
```

### **Restore database**

```bash
# Unzip backup
gunzip backups/greenconnect_backup_20251110_020000.sql.gz

# Restore
docker exec -i greenconnect-postgres psql -U postgres greenconnect < backups/greenconnect_backup_20251110_020000.sql
```

### **View logs**

```bash
# All services
docker compose -f docker-compose.tunnel.yml logs -f

# Specific service
docker compose -f docker-compose.tunnel.yml logs backend --tail=100 -f
docker compose -f docker-compose.tunnel.yml logs cloudflare-tunnel -f

# Nginx logs
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

---

## 🐛 Common Issues

### **❌ Tunnel không connect**

**Triệu chứng:**

```
Error: Unable to reach the origin
cloudflared[1]: ERR  error="dial tcp: lookup nginx: no such host"
```

**Giải pháp:**

1. Check Cloudflare dashboard → Tunnel status
2. Verify tunnel token trong .env
3. Restart tunnel:
   ```bash
   docker compose -f docker-compose.tunnel.yml restart cloudflare-tunnel
   ```

### **❌ 502 Bad Gateway**

**Triệu chứng:**
Browser hiển thị Cloudflare 502 error

**Giải pháp:**

1. Check backend health:
   ```bash
   docker exec greenconnect-backend wget -qO- http://localhost:3001/api/v1/health
   ```
2. Check nginx:
   ```bash
   docker logs greenconnect-nginx --tail=50
   ```
3. Restart services:
   ```bash
   docker compose -f docker-compose.tunnel.yml restart backend nginx
   ```

### **❌ WebSocket không hoạt động**

**Triệu chứng:**
Chat real-time không work

**Giải pháp:**

1. Check WebSocket endpoint:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://greenconnect.com/socket.io/
   ```
2. Verify CORS settings trong .env
3. Check backend logs:
   ```bash
   docker compose -f docker-compose.tunnel.yml logs backend | grep socket
   ```

### **❌ Tunnel token expired**

**Giải pháp:**

1. Tạo tunnel token mới trên Cloudflare dashboard
2. Update token trong .env
3. Restart tunnel:
   ```bash
   docker compose -f docker-compose.tunnel.yml restart cloudflare-tunnel
   ```

---

## 🔒 Security Best Practices

### **1. Secure .env file**

```bash
chmod 600 .env
```

### **2. Enable Cloudflare Security Features**

Trên Cloudflare Dashboard:

- ✅ **SSL/TLS**: Set to "Full (strict)"
- ✅ **Always Use HTTPS**: Enable
- ✅ **WAF Rules**: Enable
- ✅ **Rate Limiting**: Configure
- ✅ **Bot Fight Mode**: Enable

### **3. Firewall Rules**

Homelab server firewall (optional, vì tunnel không expose port):

```bash
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw status
```

### **4. Regular Updates**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose -f docker-compose.tunnel.yml pull
docker compose -f docker-compose.tunnel.yml up -d
```

---

## 📊 Monitoring & Metrics

### **Monitor script**

```bash
./monitor-tunnel.sh
```

Output:

- Docker service status
- Cloudflare tunnel logs
- Nginx access logs
- Resource usage
- Endpoint health checks

### **Setup external monitoring (optional)**

1. **UptimeRobot** (Free): https://uptimerobot.com
   - Monitor: `https://greenconnect.com/health`
   - Alert email/SMS when down

2. **Cloudflare Analytics**
   - Dashboard → Analytics
   - View traffic, requests, bandwidth

---

## 🎉 Kết quả

Sau khi deploy thành công:

✅ **App accessible từ anywhere:**

- `https://greenconnect.com`
- `https://www.greenconnect.com`

✅ **Automatic SSL/HTTPS**
✅ **DDoS Protection**
✅ **Global CDN**
✅ **Zero Trust Security**
✅ **No port forwarding needed**
✅ **No router configuration**

---

## 💡 Tips & Tricks

### **Custom Domain cho mỗi service**

Trong Cloudflare Tunnel config, thêm:

- `api.greenconnect.com` → `backend:3001`
- `ws.greenconnect.com` → `backend:3002`
- `admin.greenconnect.com` → `frontend:3000`

### **Enable Cloudflare Caching**

Để tăng performance:

1. Dashboard → Caching → Configuration
2. Set caching level: Standard
3. Cache static assets: 30 days

### **Enable Argo Tunnel (paid)**

Tăng speed 30%:

- Dashboard → Traffic → Argo Smart Routing
- Enable ($5/month + $0.10/GB)

---

## 📞 Support

Có vấn đề? Check:

1. Logs: `docker compose -f docker-compose.tunnel.yml logs -f`
2. Tunnel status: Cloudflare Dashboard
3. Health check: `./monitor-tunnel.sh`

---

**Happy Deploying! 🚀**
