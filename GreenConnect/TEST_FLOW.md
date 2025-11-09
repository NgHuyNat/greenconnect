# GreenConnect API Test Flow

## Chuẩn bị test

1. Đảm bảo server backend đã chạy trên `http://localhost:3001`
2. Đảm bảo MongoDB đã được kết nối

## Test Flow có thứ tự

### 1. Authentication Flow

1. **Register** - Tạo tài khoản test mới
   - Chạy `Auth/Register.bru`
   - Token sẽ được lưu tự động vào `{{authToken}}`

2. **Login** - Đăng nhập với tài khoản có sẵn
   - Chạy `Auth/Login.bru`
   - Token sẽ được lưu tự động vào `{{authToken}}`

3. **Get Profile** - Lấy thông tin profile
   - Chạy `Auth/Get Profile.bru`

### 2. Products Flow

1. **Get Categories** - Lấy danh sách categories
   - Chạy `Products/Get Categories.bru`

2. **Get All Products** - Lấy danh sách sản phẩm
   - Chạy `Products/Get All Products.bru`

3. **Create Product** - Tạo sản phẩm mới (cần auth)
   - Chạy `Products/Create Product.bru`
   - Product ID sẽ được lưu vào `{{createdProductId}}`

4. **Get Product by ID** - Xem chi tiết sản phẩm
   - Chạy `Products/Get Product by ID.bru`

5. **Get Featured Products** - Lấy sản phẩm nổi bật
   - Chạy `Products/Get Featured Products.bru`

### 3. Users Flow

1. **Get My Profile** - Lấy profile của user hiện tại
   - Chạy `Users/Get My Profile.bru`
   - User ID sẽ được lưu vào `{{userId}}`

2. **Update Profile** - Cập nhật thông tin profile
   - Chạy `Users/Update Profile.bru`

3. **Get User by ID** - Xem profile public của user khác
   - Chạy `Users/Get User by ID.bru`

### 4. Reviews Flow

1. **Get Product Reviews** - Xem review của sản phẩm
   - Chạy `Reviews/Get Product Reviews.bru`

2. **Create Review** - Tạo review cho sản phẩm (cần auth)
   - Chạy `Reviews/Create Review.bru`
   - Review ID sẽ được lưu vào `{{createdReviewId}}`

3. **Get My Reviews** - Xem review của mình
   - Chạy `Reviews/Get My Reviews.bru`

### 5. Orders Flow

1. **Create Order** - Tạo đơn hàng (cần auth)
   - Chạy `Orders/Create Order.bru`
   - Order ID sẽ được lưu vào `{{createdOrderId}}`

2. **Get My Orders** - Xem đơn hàng của buyer
   - Chạy `Orders/Get My Orders.bru`

3. **Get Seller Orders** - Xem đơn hàng của seller
   - Chạy `Orders/Get Seller Orders.bru`

4. **Get Order by ID** - Xem chi tiết đơn hàng
   - Chạy `Orders/Get Order by ID.bru`

5. **Update Order Status** - Cập nhật trạng thái đơn hàng
   - Chạy `Orders/Update Order Status.bru`

### 6. Upload Flow

1. **Upload Single File** - Upload một file (cần auth)
   - Chạy `Upload/Upload Single File.bru`
   - File URL sẽ được lưu vào `{{uploadedFileUrl}}`

2. **Upload Multiple Files** - Upload nhiều file (cần auth)
   - Chạy `Upload/Upload Multiple Files.bru`

## Lưu ý

- Tất cả các requests cần authentication sử dụng Bearer token từ `{{authToken}}`
- Các ID được tạo ra sẽ tự động lưu vào variables để sử dụng cho các requests khác
- Chạy Login hoặc Register trước để có token
- Tạo Product trước khi test Orders và Reviews
