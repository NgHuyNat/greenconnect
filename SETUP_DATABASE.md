# Setup MongoDB và Firebase cho GreenConnect

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo account và cluster mới (miễn phí)
3. Tạo database user và whitelist IP
4. Copy connection string và cập nhật trong `.env`:

```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/greenconnect?retryWrites=true&w=majority"
```

### Option 2: Local MongoDB

1. Install MongoDB Community Edition:

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# macOS với Homebrew
brew install mongodb-community

# Windows: Download từ mongodb.com
```

2. Start MongoDB:

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS
brew services start mongodb/brew/mongodb-community

# Hoặc chạy trực tiếp
mongod --dbpath /usr/local/var/mongodb
```

3. Update `.env`:

```
DATABASE_URL="mongodb://localhost:27017/greenconnect"
```

### Option 3: Docker (Development)

```bash
# Start MongoDB container
docker run -d --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=greenconnect \
  -e MONGO_INITDB_ROOT_PASSWORD=greenconnect123 \
  mongo:7-jammy

# Connection string
DATABASE_URL="mongodb://greenconnect:greenconnect123@localhost:27017/greenconnect?authSource=admin"
```

## Firebase Setup

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Đặt tên project (ví dụ: greenconnect-app)
4. Enable Google Analytics (optional)

### 2. Enable Storage

1. Trong Firebase Console, vào "Storage"
2. Click "Get started"
3. Chọn location gần nhất (ví dụ: asia-southeast1)
4. Copy Storage bucket name (ví dụ: greenconnect-app.appspot.com)

### 3. Setup Security Rules

Trong Storage Rules, cập nhật:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Tạo Service Account (Backend)

1. Vào "Project Settings" → "Service accounts"
2. Click "Generate new private key"
3. Download JSON file
4. Extract thông tin và cập nhật `.env`:

```bash
FIREBASE_PROJECT_ID=greenconnect-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQ...your-key...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@greenconnect-app.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=greenconnect-app.appspot.com
```

### 5. Setup Web App (Frontend)

1. Trong Firebase Console, click biểu tượng web "</>"
2. Đặt tên app: "GreenConnect Web"
3. Copy config và cập nhật `apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=greenconnect-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=greenconnect-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=greenconnect-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Kiểm tra Setup

### Test MongoDB Connection

```bash
# Trong backend directory
cd apps/backend
npx prisma generate
npx prisma db push
```

### Test Firebase Upload

1. Start backend: `npm run start:dev`
2. Truy cập Swagger: http://localhost:3001/api/docs
3. Test upload endpoint với JWT token

## Troubleshooting

### MongoDB Issues

- **Connection timeout**: Kiểm tra firewall và MongoDB service
- **Authentication failed**: Kiểm tra username/password trong connection string
- **Database not found**: MongoDB sẽ tự tạo database khi insert data đầu tiên

### Firebase Issues

- **Permission denied**: Kiểm tra Storage Rules
- **Invalid credentials**: Kiểm tra Service Account key format
- **File upload failed**: Kiểm tra file size và mimetype restrictions

### Prisma Issues

```bash
# Reset nếu có lỗi schema
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

## Production Notes

### MongoDB

- Sử dụng MongoDB Atlas cho production
- Enable backup và monitoring
- Setup connection pooling
- Enable authentication và SSL

### Firebase

- Upgrade Firebase plan nếu cần storage lớn
- Setup CDN cho faster image loading
- Enable Firebase Analytics
- Configure proper CORS settings
