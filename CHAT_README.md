# 💬 Hệ thống Chat Realtime - GreenConnect

## 🎯 Tổng quan

Hệ thống chat realtime được thiết kế để kết nối người mua và người bán trên nền tảng GreenConnect, cho phép họ giao tiếp trực tiếp và hiệu quả.

## ✨ Tính năng chính

### 🔄 **Tin nhắn Realtime**

- Nhắn tin trực tiếp không cần reload trang
- WebSocket connection cho tốc độ tối ưu
- Auto-reconnect khi mất kết nối

### 💬 **Giao diện Chat**

- **Responsive Design**: Hoạt động mượt mà trên desktop và mobile
- **Conversation List**: Danh sách cuộc trò chuyện với preview tin nhắn cuối
- **Search Function**: Tìm kiếm cuộc trò chuyện theo tên người dùng
- **Message Status**: Hiển thị trạng thái đã gửi/đã đọc (✓/✓✓)

### 🎭 **Tính năng nâng cao**

- **Typing Indicator**: Hiển thị khi đối phương đang nhập tin nhắn
- **Emoji Picker**: Chọn emoji với nhiều danh mục (mặt cười, cử chỉ, trái tim, vật phẩm)
- **Online Status**: Hiển thị trạng thái kết nối realtime
- **Auto Scroll**: Tự động scroll xuống tin nhắn mới

### 🔔 **Thông báo**

- **Push Notifications**: Thông báo popup khi có tin nhắn mới (ngoài trang chat)
- **Chat Button**: Nút chat nổi để truy cập nhanh từ mọi trang
- **Unread Counter**: Đếm số tin nhắn chưa đọc

## 🏗️ Kiến trúc hệ thống

### **Backend (NestJS)**

```
📁 apps/backend/src/modules/chat/
├── 📄 chat.controller.ts    # REST API endpoints
├── 📄 chat.service.ts       # Business logic
├── 📄 chat.gateway.ts       # WebSocket gateway
├── 📄 chat.module.ts        # Module configuration
└── 📁 dto/
    └── 📄 chat.dto.ts       # Data transfer objects
```

**API Endpoints:**

- `GET /chat/conversations` - Lấy danh sách cuộc trò chuyện
- `POST /chat/conversations` - Tạo cuộc trò chuyện mới
- `GET /chat/conversations/:id/messages` - Lấy tin nhắn trong cuộc trò chuyện

**WebSocket Events:**

- `join_conversation` - Tham gia cuộc trò chuyện
- `send_message` - Gửi tin nhắn
- `typing_start/stop` - Bắt đầu/dừng nhập
- `new_message` - Nhận tin nhắn mới

### **Frontend (Next.js)**

```
📁 apps/frontend/src/
├── 📁 app/chat/
│   └── 📄 page.tsx          # Trang chat chính
├── 📁 components/
│   ├── 📄 ChatButton.tsx    # Nút chat nổi
│   ├── 📄 ChatInitiator.tsx # Component khởi tạo chat
│   ├── 📄 ChatNotification.tsx # Thông báo tin nhắn
│   └── 📄 EmojiPicker.tsx   # Bộ chọn emoji
└── 📁 hooks/
    └── 📄 useChat.ts        # Custom hook quản lý chat
```

### **Database Schema (Prisma)**

```javascript
model Conversation {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  participant1Id String  @db.ObjectId
  participant2Id String  @db.ObjectId
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  participant1 User      @relation("ConversationParticipant1")
  participant2 User      @relation("ConversationParticipant2")
  messages     Message[]
}

model Message {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  content       String
  isRead        Boolean  @default(false)
  createdAt     DateTime @default(now())

  conversation   Conversation @relation(fields: [conversationId])
  conversationId String       @db.ObjectId
  sender         User         @relation("SentMessages")
  senderId       String       @db.ObjectId
}
```

## 🚀 Cách sử dụng

### **Khởi tạo Chat từ Profile/Product**

```tsx
import ChatInitiator from "@/components/ChatInitiator";

<ChatInitiator user={seller}>
  <button className="btn-primary">Nhắn tin với người bán</button>
</ChatInitiator>;
```

### **Sử dụng Chat Hook**

```tsx
import { useChat } from "@/hooks/useChat";

const { conversations, messages, sendMessage, joinConversation, isConnected } =
  useChat();
```

## 🎨 UI/UX Features

### **Responsive Design**

- **Desktop**: Sidebar conversations + main chat window
- **Mobile**: Full-screen conversation list ↔ chat window
- **Tablet**: Optimized layout cho màn hình trung bình

### **Visual Indicators**

- 🟢 **Online**: Màu xanh cho trạng thái kết nối
- 🔴 **Offline**: Màu đỏ khi mất kết nối
- ✓ **Delivered**: Một dấu check
- ✓✓ **Read**: Hai dấu check
- 💬 **Typing**: Animation dots khi đang nhập

### **Animations**

- Slide-in cho thông báo mới
- Bounce animation cho typing indicator
- Smooth transitions cho UI elements

## 🔧 Configuration

### **Environment Variables**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### **Socket.io Configuration**

```typescript
const socket = io(API_BASE_URL, {
  auth: { token },
  transports: ["websocket"],
});
```

## 🚦 Trạng thái Implementation

✅ **Completed Features:**

- [x] Backend chat service với WebSocket
- [x] Giao diện chat responsive và đẹp mắt
- [x] Realtime messaging
- [x] Typing indicators
- [x] Emoji picker với nhiều categories
- [x] Message status (delivered/read)
- [x] Online status indicator
- [x] Chat notifications
- [x] Mobile optimization

🔄 **Future Enhancements:**

- [ ] File/image attachments
- [ ] Voice messages
- [ ] Message reactions
- [ ] Chat groups
- [ ] Message search
- [ ] Chat backup/export

## 📝 Notes

### **Performance Optimizations**

- Messages được lazy load với pagination
- WebSocket reconnection tự động
- Optimized re-renders với React hooks
- Efficient state management

### **Security Measures**

- JWT authentication cho WebSocket
- Input validation và sanitization
- Rate limiting cho tin nhắn
- User authorization checks

### **Browser Compatibility**

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized

---

💚 **GreenConnect Chat System** - Connecting farmers and buyers through seamless communication!
