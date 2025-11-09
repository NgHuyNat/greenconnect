# GreenConnect - Nền tảng Kết nối Cung cầu Nông sản

## Tổng quan

GreenConnect là một nền tảng web kết nối người bán và người mua nông sản trực tiếp, giúp nông dân tiêu thụ sản phẩm hiệu quả và mang đến thực phẩm tươi ngon cho người tiêu dùng.

## Tính năng chính

### 🔐 Hệ thống Authentication

- Đăng ký tài khoản mới với thông tin chi tiết
- Đăng nhập bằng username/email/số điện thoại
- Quản lý vai trò (Người bán/Người mua/Cả hai)
- JWT Authentication với refresh token

### 📦 Quản lý Sản phẩm

- Đăng tin bán nông sản với hình ảnh, mô tả chi tiết
- Tìm kiếm và lọc sản phẩm theo nhiều tiêu chí
- Quản lý trạng thái sản phẩm (Available/Sold/Reserved)
- Hỗ trợ cả bán có phí và tặng miễn phí

### 🗺️ Bản đồ Tương tác

- Hiển thị vị trí nông sản trên bản đồ
- Tìm kiếm theo khu vực địa lý
- Tính toán khoảng cách từ người mua
- Integration với Google Maps/OpenStreetMap

### 💬 Hệ thống Chat Real-time

- Chat trực tiếp giữa người bán và người mua
- Thông báo real-time qua WebSocket
- Lịch sử tin nhắn được lưu trữ
- Hỗ trợ emoji và chia sẻ hình ảnh

### ⭐ Đánh giá và Uy tín

- Hệ thống đánh giá 5 sao
- Bình luận chi tiết về giao dịch
- Tính toán rating trung bình tự động
- Xây dựng uy tín cho người dùng

### 📊 Dashboard và Quản lý

- Theo dõi đơn hàng và giao dịch
- Thống kê bán hàng cho người bán
- Lịch sử mua hàng cho người mua
- Báo cáo và phân tích

## Công nghệ sử dụng

### Backend

- **NestJS** - Framework Node.js với TypeScript
- **Prisma** - ORM và Database toolkit
- **PostgreSQL** - Cơ sở dữ liệu quan hệ
- **JWT** - JSON Web Tokens cho authentication
- **Socket.IO** - WebSocket cho real-time communication
- **Multer** - Upload file handling
- **Swagger** - API documentation

### Frontend

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Leaflet/Google Maps** - Map integration
- **Socket.IO Client** - Real-time communication

### DevOps & Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Production database
- **Nginx** - Reverse proxy và static files

## Cấu trúc Project

```
GreenConnect/
├── apps/
│   ├── backend/                 # NestJS API Server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Authentication module
│   │   │   │   ├── users/      # User management
│   │   │   │   ├── products/   # Product management
│   │   │   │   ├── orders/     # Order processing
│   │   │   │   ├── chat/       # Real-time messaging
│   │   │   │   └── reviews/    # Rating & reviews
│   │   │   ├── common/         # Shared utilities
│   │   │   └── config/         # Configuration
│   │   ├── prisma/             # Database schema
│   │   └── uploads/            # File uploads
│   │
│   └── frontend/               # Next.js Web App
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks
│       │   ├── store/          # State management
│       │   ├── types/          # TypeScript definitions
│       │   └── utils/          # Utility functions
│       └── public/             # Static assets
│
├── packages/                   # Shared packages
├── docker-compose.yml          # Development environment
└── README.md                   # Documentation
```

## Database Schema

### Entities chính:

- **User**: Thông tin người dùng, vai trò, địa chỉ, rating
- **Product**: Sản phẩm nông nghiệp, giá, vị trí, hình ảnh
- **Order**: Đơn đặt hàng, trạng thái, thông tin giao dịch
- **Message**: Tin nhắn chat giữa users
- **Conversation**: Cuộc hội thoại nhóm messages
- **Review**: Đánh giá và nhận xét từ người dùng

## Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm >= 8.0.0

### 1. Clone repository

```bash
git clone <repository-url>
cd GreenConnect
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

**Backend (.env)**:

```bash
cp apps/backend/.env.example apps/backend/.env
# Cập nhật DATABASE_URL (MongoDB) và Firebase credentials
```

**Frontend (.env.local)**:

```bash
# Tạo file apps/frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Run Prisma Studio
npm run db:studio
```

### 5. Chạy ứng dụng

**Development mode:**

```bash
# Chạy cả backend và frontend
npm run dev

# Hoặc chạy riêng lẻ
npm run dev:backend    # Backend: http://localhost:3001
npm run dev:frontend   # Frontend: http://localhost:3000
```

**Production mode:**

```bash
# Build
npm run build

# Start
npm run start
```

### 6. Docker Deployment

```bash
# Chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:

```
http://localhost:3001/api/docs
```

## Flow hoạt động

### 1. Đăng ký / Đăng nhập

- User mở app → màn hình landing page
- Chọn Đăng ký → nhập thông tin → xác nhận email
- Chọn Đăng nhập → username/email + password
- Chọn vai trò mặc định (có thể thay đổi sau)

### 2. Dashboard chung

- Hiển thị bản đồ với các markers sản phẩm
- Bộ lọc: loại sản phẩm, khu vực, giá, thời gian
- Thanh tìm kiếm và navigation

### 3. Người bán (Seller)

- Đăng tin: chọn dấu ➕ → nhập thông tin sản phẩm
- Chờ yêu cầu từ buyer → nhận thông báo
- Xác nhận đơn hàng → mở chat
- Hoàn tất giao dịch → đánh giá buyer

### 4. Người mua (Buyer)

- Tìm sản phẩm trên map/search → xem chi tiết
- Đặt hàng → chờ seller xác nhận
- Chat trực tiếp → thỏa thuận chi tiết
- Nhận hàng → đánh giá seller

### 5. Sau giao dịch

- Cả hai bên nhận thông báo hoàn tất
- Cập nhật rating và điểm uy tín
- Lưu vào lịch sử giao dịch

## Roadmap

### Phase 1 (Hiện tại)

- ✅ Core authentication và user management
- ✅ Product listing và management
- ✅ Basic chat system
- ✅ Rating và review system

### Phase 2 (Tương lai)

- 🔄 Payment integration
- 🔄 Advanced map features (route planning)
- 🔄 Mobile app (React Native)
- 🔄 Admin dashboard
- 🔄 Advanced analytics

### Phase 3 (Mở rộng)

- 📋 Multi-language support
- 📋 AI-powered recommendations
- 📋 Logistics integration
- 📋 Marketplace ecosystem

## Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- Email: support@greenconnect.vn
- GitHub: [GitHub Repository](https://github.com/your-org/greenconnect)

## Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
