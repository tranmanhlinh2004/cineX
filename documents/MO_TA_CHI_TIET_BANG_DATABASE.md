# Mô tả chi tiết bảng Database CineX

Cập nhật ngày: 18/06/2026

Nguồn kiểm tra: truy vấn trực tiếp PostgreSQL từ `backend/.env` với schema `public`, đối chiếu thêm `backend/prisma/schema.prisma` và các file migration Prisma.

Tổng số bảng được mô tả: 26 bảng nghiệp vụ. Bảng `_prisma_migrations` là bảng kỹ thuật của Prisma nên không đưa vào phần mô tả chi tiết.

## Mô tả chi tiết từng bảng


### 1. Bảng `audit_logs`

Bảng `audit_logs` dùng để lưu lịch sử thao tác, thay đổi dữ liệu và thông tin phục vụ kiểm tra/audit trong hệ thống.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã nhật ký audit. |
| `userId` | integer | Khóa ngoại -> `users(id)`; Có thể null; ON DELETE SET NULL | Người dùng thực hiện thao tác, có thể rỗng nếu là thao tác hệ thống. |
| `action` | text | Không null | Hành động được ghi nhận. |
| `tableName` | text | Có thể null | Tên bảng bị tác động. |
| `recordId` | text | Có thể null | Mã bản ghi bị tác động. |
| `oldValue` | jsonb | Có thể null | Giá trị dữ liệu trước khi thay đổi. |
| `newValue` | jsonb | Có thể null | Giá trị dữ liệu sau khi thay đổi. |
| `ipAddress` | text | Có thể null | Địa chỉ IP thực hiện thao tác. |
| `userAgent` | text | Có thể null | Thông tin trình duyệt/thiết bị thực hiện thao tác. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm ghi nhật ký. |

### 2. Bảng `banners`

Bảng `banners` dùng để lưu các banner quảng bá, liên kết điều hướng và thời gian hiển thị trên giao diện website.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã banner. |
| `title` | text | Không null | Tiêu đề banner. |
| `imageUrl` | text | Không null | Đường dẫn hình ảnh banner. |
| `linkUrl` | text | Có thể null | Đường dẫn khi người dùng bấm vào banner. |
| `position` | text | Có thể null | Vị trí hiển thị banner trên website. |
| `sortOrder` | integer | Không null; Mặc định `0` | Thứ tự sắp xếp banner. |
| `status` | BannerStatus enum | Không null; Mặc định `ACTIVE` | Trạng thái banner: `ACTIVE`, `HIDDEN`. |
| `startDate` | timestamp(3) | Có thể null | Thời điểm bắt đầu hiển thị. |
| `endDate` | timestamp(3) | Có thể null | Thời điểm kết thúc hiển thị. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo banner. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật banner gần nhất. |

### 3. Bảng `booking_details`

Bảng `booking_details` dùng để lưu từng ghế được chọn trong một đơn đặt vé, gắn với suất chiếu và giá tại thời điểm đặt.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã chi tiết đặt vé. |
| `bookingId` | integer | Khóa ngoại -> `bookings(id)`; Không null; ON DELETE CASCADE | Đơn đặt vé chứa chi tiết này. |
| `showtimeId` | integer | Khóa ngoại -> `showtimes(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Suất chiếu được đặt. |
| `seatId` | integer | Khóa ngoại -> `seats(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE RESTRICT | Ghế được đặt trong suất chiếu. |
| `price` | numeric(12,2) | Không null | Giá vé của ghế tại thời điểm đặt. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo chi tiết đặt vé. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật chi tiết đặt vé gần nhất. |

### 4. Bảng `booking_promotions`

Bảng `booking_promotions` dùng để lưu các mã khuyến mãi được áp dụng cho từng đơn đặt vé và số tiền đã giảm.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã bản ghi áp dụng khuyến mãi. |
| `bookingId` | integer | Khóa ngoại -> `bookings(id)`; Không null; Duy nhất ghép (`bookingId`, `promotionId`); ON DELETE CASCADE | Đơn đặt vé được áp dụng khuyến mãi. |
| `promotionId` | integer | Khóa ngoại -> `promotions(id)`; Không null; Duy nhất ghép (`bookingId`, `promotionId`); ON DELETE CASCADE | Khuyến mãi được áp dụng. |
| `discountAmount` | numeric(12,2) | Không null | Số tiền giảm thực tế cho đơn đặt vé. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm áp dụng khuyến mãi. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật bản ghi gần nhất. |

### 5. Bảng `bookings`

Bảng `bookings` dùng để lưu đơn đặt vé của khách hàng, tổng tiền, số tiền giảm, trạng thái xử lý và ghi chú liên quan.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã đơn đặt vé. |
| `userId` | integer | Khóa ngoại -> `users(id)`; Không null; ON DELETE RESTRICT | Người dùng tạo đơn đặt vé. |
| `bookingCode` | text | Không null; Duy nhất | Mã đặt vé dùng để tra cứu và đối soát. |
| `totalAmount` | numeric(12,2) | Không null | Tổng tiền trước khuyến mãi. |
| `discountAmount` | numeric(12,2) | Không null; Mặc định `0` | Số tiền được giảm. |
| `finalAmount` | numeric(12,2) | Không null | Số tiền cuối cùng cần thanh toán. |
| `status` | BookingStatus enum | Không null; Mặc định `PENDING` | Trạng thái đơn: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`. |
| `note` | text | Có thể null | Ghi chú của đơn đặt vé. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo đơn đặt vé. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật đơn đặt vé gần nhất. |

### 6. Bảng `cinemas`

Bảng `cinemas` dùng để lưu thông tin cụm rạp/chi nhánh như tên, địa chỉ, thông tin liên hệ và hình ảnh đại diện.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã rạp. |
| `name` | text | Không null | Tên rạp/cụm rạp. |
| `slug` | text | Không null; Duy nhất | Chuỗi định danh rạp dùng trên URL. |
| `address` | text | Không null | Địa chỉ chi tiết của rạp. |
| `city` | text | Không null | Tỉnh/thành phố của rạp. |
| `district` | text | Có thể null | Quận/huyện của rạp. |
| `ward` | text | Có thể null | Phường/xã của rạp. |
| `phone` | text | Có thể null | Số điện thoại liên hệ rạp. |
| `email` | text | Có thể null | Email liên hệ rạp. |
| `description` | text | Có thể null | Mô tả thêm về rạp. |
| `imageUrl` | text | Có thể null | Đường dẫn hình ảnh đại diện rạp. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo rạp. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật rạp gần nhất. |

### 7. Bảng `genres`

Bảng `genres` dùng để lưu danh mục thể loại phim, phục vụ phân loại và lọc phim.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã thể loại. |
| `name` | text | Không null; Duy nhất | Tên thể loại phim. |
| `description` | text | Có thể null | Mô tả thể loại phim. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo thể loại. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật thể loại gần nhất. |

### 8. Bảng `movie_genres`

Bảng `movie_genres` dùng để biểu diễn quan hệ nhiều-nhiều giữa phim và thể loại.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã liên kết phim-thể loại. |
| `movieId` | integer | Khóa ngoại -> `movies(id)`; Không null; Duy nhất ghép (`movieId`, `genreId`); ON DELETE CASCADE | Phim được gán thể loại. |
| `genreId` | integer | Khóa ngoại -> `genres(id)`; Không null; Duy nhất ghép (`movieId`, `genreId`); ON DELETE CASCADE | Thể loại được gán cho phim. |

### 9. Bảng `movie_images`

Bảng `movie_images` dùng để lưu các hình ảnh phụ của phim như ảnh hậu trường, ảnh chi tiết hoặc ảnh trình chiếu trong trang phim.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã hình ảnh phim. |
| `movieId` | integer | Khóa ngoại -> `movies(id)`; Không null; ON DELETE CASCADE | Phim sở hữu hình ảnh này. |
| `imageUrl` | text | Không null | Đường dẫn hình ảnh. |
| `altText` | text | Có thể null | Văn bản thay thế cho hình ảnh. |
| `sortOrder` | integer | Không null; Mặc định `0` | Thứ tự hiển thị hình ảnh. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm thêm hình ảnh. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật hình ảnh gần nhất. |

### 10. Bảng `movies`

Bảng `movies` dùng để lưu thông tin phim, bao gồm nội dung, thời lượng, lịch phát hành, tài nguyên truyền thông và trạng thái chiếu.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã phim. |
| `title` | text | Không null | Tên phim. |
| `slug` | text | Không null; Duy nhất | Chuỗi định danh phim dùng trên URL. |
| `description` | text | Có thể null | Mô tả hoặc tóm tắt nội dung phim. |
| `director` | text | Có thể null | Đạo diễn phim. |
| `actors` | text | Có thể null | Danh sách diễn viên chính. |
| `duration` | integer | Không null | Thời lượng phim, tính bằng phút. |
| `releaseDate` | timestamp(3) | Có thể null | Ngày khởi chiếu. |
| `endDate` | timestamp(3) | Có thể null | Ngày kết thúc chiếu dự kiến/thực tế. |
| `language` | text | Có thể null | Ngôn ngữ phim. |
| `country` | text | Có thể null | Quốc gia sản xuất. |
| `ageLimit` | text | Có thể null | Nhãn giới hạn độ tuổi. |
| `trailerUrl` | text | Có thể null | Đường dẫn trailer phim. |
| `posterUrl` | text | Có thể null | Đường dẫn poster phim. |
| `bannerUrl` | text | Có thể null | Đường dẫn banner phim. |
| `status` | MovieStatus enum | Không null; Mặc định `COMING_SOON` | Trạng thái phim: `COMING_SOON`, `NOW_SHOWING`, `ENDED`. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo phim. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật phim gần nhất. |

### 11. Bảng `news`

Bảng `news` dùng để lưu bài viết, tin tức, nội dung truyền thông hoặc thông báo hiển thị trên website.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã bài viết. |
| `title` | text | Không null | Tiêu đề bài viết. |
| `slug` | text | Không null; Duy nhất | Chuỗi định danh bài viết dùng trên URL. |
| `summary` | text | Có thể null | Tóm tắt ngắn của bài viết. |
| `content` | text | Không null | Nội dung chi tiết bài viết. |
| `thumbnail` | text | Có thể null | Đường dẫn ảnh đại diện bài viết. |
| `authorName` | text | Có thể null | Tên tác giả hoặc người đăng. |
| `status` | NewsStatus enum | Không null; Mặc định `DRAFT` | Trạng thái bài viết: `DRAFT`, `PUBLISHED`, `HIDDEN`. |
| `publishedAt` | timestamp(3) | Có thể null | Thời điểm công bố bài viết. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo bài viết. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật bài viết gần nhất. |

### 12. Bảng `payments`

Bảng `payments` dùng để lưu thông tin thanh toán của đơn đặt vé, phương thức thanh toán, trạng thái giao dịch và mã đối soát.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã thanh toán. |
| `bookingId` | integer | Khóa ngoại -> `bookings(id)`; Không null; ON DELETE CASCADE | Đơn đặt vé được thanh toán. |
| `method` | PaymentMethod enum | Không null | Phương thức thanh toán: `CASH`, `MOMO`, `VNPAY`, `ZALOPAY`, `BANKING`, `CARD`. |
| `status` | PaymentStatus enum | Không null; Mặc định `PENDING` | Trạng thái thanh toán: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`. |
| `amount` | numeric(12,2) | Không null | Số tiền thanh toán. |
| `transactionCode` | text | Có thể null | Mã giao dịch từ cổng thanh toán hoặc hệ thống đối soát. |
| `paymentUrl` | text | Có thể null | Đường dẫn thanh toán được tạo cho giao dịch. |
| `paidAt` | timestamp(3) | Có thể null | Thời điểm thanh toán thành công. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo giao dịch thanh toán. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật giao dịch gần nhất. |

### 13. Bảng `permissions`

Bảng `permissions` dùng để lưu danh sách quyền thao tác trong hệ thống, phục vụ phân quyền cho các vai trò.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã quyền. |
| `name` | text | Không null; Duy nhất | Tên quyền. |
| `description` | text | Có thể null | Mô tả ý nghĩa hoặc phạm vi quyền. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo quyền. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật quyền gần nhất. |

### 14. Bảng `promotions`

Bảng `promotions` dùng để lưu mã khuyến mãi, điều kiện áp dụng, thời gian hiệu lực và số lượng sử dụng.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã khuyến mãi. |
| `code` | text | Không null; Duy nhất | Mã coupon/khuyến mãi dùng khi đặt vé. |
| `name` | text | Không null | Tên chương trình khuyến mãi. |
| `description` | text | Có thể null | Mô tả chương trình khuyến mãi. |
| `type` | PromotionType enum | Không null | Kiểu giảm giá: `PERCENT`, `AMOUNT`. |
| `discountPercent` | integer | Có thể null | Phần trăm giảm giá nếu khuyến mãi theo phần trăm. |
| `discountAmount` | numeric(12,2) | Có thể null | Số tiền giảm cố định nếu khuyến mãi theo số tiền. |
| `minOrderAmount` | numeric(12,2) | Có thể null | Giá trị đơn tối thiểu để áp dụng khuyến mãi. |
| `maxDiscount` | numeric(12,2) | Có thể null | Số tiền giảm tối đa khi áp dụng khuyến mãi. |
| `quantity` | integer | Không null | Tổng số lượt khuyến mãi có thể sử dụng. |
| `usedQuantity` | integer | Không null; Mặc định `0` | Số lượt khuyến mãi đã được sử dụng. |
| `startDate` | timestamp(3) | Không null | Thời điểm bắt đầu hiệu lực. |
| `endDate` | timestamp(3) | Không null | Thời điểm hết hiệu lực. |
| `isActive` | boolean | Không null; Mặc định `true` | Trạng thái bật/tắt khuyến mãi. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo khuyến mãi. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật khuyến mãi gần nhất. |

### 15. Bảng `refresh_tokens`

Bảng `refresh_tokens` dùng để lưu token làm mới phiên đăng nhập, thời gian hết hạn và trạng thái thu hồi token.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã refresh token. |
| `userId` | integer | Khóa ngoại -> `users(id)`; Không null; ON DELETE CASCADE | Người dùng sở hữu token. |
| `token` | text | Không null; Duy nhất | Chuỗi refresh token. |
| `expiresAt` | timestamp(3) | Không null | Thời điểm token hết hạn. |
| `revoked` | boolean | Không null; Mặc định `false` | Cho biết token đã bị thu hồi hay chưa. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo token. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật token gần nhất. |

### 16. Bảng `reviews`

Bảng `reviews` dùng để lưu đánh giá và bình luận phim của người dùng.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã đánh giá. |
| `userId` | integer | Khóa ngoại -> `users(id)`; Không null; Duy nhất ghép (`userId`, `movieId`); ON DELETE CASCADE | Người dùng đánh giá phim. |
| `movieId` | integer | Khóa ngoại -> `movies(id)`; Không null; Duy nhất ghép (`userId`, `movieId`); ON DELETE CASCADE | Phim được đánh giá. |
| `rating` | integer | Không null | Điểm đánh giá. |
| `comment` | text | Có thể null | Nội dung bình luận. |
| `isHidden` | boolean | Không null; Mặc định `false` | Cho biết đánh giá có bị ẩn hay không. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo đánh giá. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật đánh giá gần nhất. |

### 17. Bảng `role_permissions`

Bảng `role_permissions` dùng để gán quyền cho vai trò, giúp xác định vai trò nào được phép thực hiện thao tác nào.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `roleId` | integer | Khóa ngoại -> `roles(id)`; Không null; Duy nhất ghép (`roleId`, `permissionId`); ON DELETE CASCADE | Vai trò được gán quyền. |
| `permissionId` | integer | Khóa ngoại -> `permissions(id)`; Không null; Duy nhất ghép (`roleId`, `permissionId`); ON DELETE CASCADE | Quyền được gán cho vai trò. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm gán quyền cho vai trò. |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã bản ghi gán quyền. |

### 18. Bảng `roles`

Bảng `roles` dùng để lưu các vai trò người dùng như khách hàng, nhân viên hoặc quản trị viên.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã vai trò. |
| `name` | text | Không null; Duy nhất | Tên vai trò. |
| `description` | text | Có thể null | Mô tả vai trò. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo vai trò. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật vai trò gần nhất. |

### 19. Bảng `rooms`

Bảng `rooms` dùng để lưu thông tin phòng chiếu thuộc từng rạp, bao gồm kích thước sơ đồ ghế, tổng số ghế và trạng thái hoạt động.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã phòng chiếu. |
| `cinemaId` | integer | Khóa ngoại -> `cinemas(id)`; Không null; Duy nhất ghép (`cinemaId`, `name`); ON DELETE CASCADE | Rạp chứa phòng chiếu. |
| `name` | text | Không null; Duy nhất ghép (`cinemaId`, `name`) | Tên phòng chiếu trong rạp. |
| `totalRows` | integer | Không null | Tổng số hàng ghế. |
| `totalColumns` | integer | Không null | Tổng số cột ghế. |
| `totalSeats` | integer | Không null | Tổng số ghế trong phòng. |
| `status` | RoomStatus enum | Không null; Mặc định `ACTIVE` | Trạng thái phòng: `ACTIVE`, `MAINTENANCE`, `CLOSED`. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo phòng chiếu. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật phòng chiếu gần nhất. |

### 20. Bảng `seat_holds`

Bảng `seat_holds` dùng để lưu ghế được giữ tạm thời khi người dùng đang đặt vé, tránh nhiều người cùng chọn một ghế trong cùng suất chiếu.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã giữ ghế. |
| `userId` | integer | Có thể null | Người dùng đang giữ ghế, nếu có. |
| `showtimeId` | integer | Khóa ngoại -> `showtimes(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Suất chiếu có ghế được giữ. |
| `seatId` | integer | Khóa ngoại -> `seats(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Ghế đang được giữ. |
| `holdCode` | text | Không null; Duy nhất | Mã giữ ghế. |
| `status` | HoldStatus enum | Không null; Mặc định `HOLDING` | Trạng thái giữ ghế: `HOLDING`, `EXPIRED`, `RELEASED`, `BOOKED`. |
| `expiresAt` | timestamp(3) | Không null | Thời điểm hết hạn giữ ghế. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm bắt đầu giữ ghế. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật giữ ghế gần nhất. |

### 21. Bảng `seat_types`

Bảng `seat_types` dùng để lưu các loại ghế như thường, VIP hoặc đôi, kèm phụ thu theo loại ghế.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã loại ghế. |
| `name` | text | Không null; Duy nhất | Tên loại ghế. |
| `description` | text | Có thể null | Mô tả loại ghế. |
| `priceExtra` | numeric(12,2) | Không null; Mặc định `0` | Phụ thu thêm so với giá cơ bản. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo loại ghế. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật loại ghế gần nhất. |

### 22. Bảng `seats`

Bảng `seats` dùng để lưu từng ghế trong phòng chiếu, bao gồm hàng, số ghế, mã ghế, loại ghế và trạng thái sử dụng.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã ghế. |
| `roomId` | integer | Khóa ngoại -> `rooms(id)`; Không null; Duy nhất ghép (`roomId`, `seatCode`); Duy nhất ghép (`roomId`, `rowName`, `seatNumber`); ON DELETE CASCADE | Phòng chiếu chứa ghế. |
| `seatTypeId` | integer | Khóa ngoại -> `seat_types(id)`; Không null; ON DELETE RESTRICT | Loại ghế. |
| `rowName` | text | Không null; Duy nhất ghép (`roomId`, `rowName`, `seatNumber`) | Tên hàng ghế. |
| `seatNumber` | integer | Không null; Duy nhất ghép (`roomId`, `rowName`, `seatNumber`) | Số thứ tự ghế trong hàng. |
| `seatCode` | text | Không null; Duy nhất ghép (`roomId`, `seatCode`) | Mã ghế hiển thị, ví dụ A1. |
| `status` | SeatStatus enum | Không null; Mặc định `ACTIVE` | Trạng thái ghế: `ACTIVE`, `BROKEN`, `LOCKED`. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo ghế. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật ghế gần nhất. |

### 23. Bảng `showtime_prices`

Bảng `showtime_prices` dùng để lưu giá riêng cho từng ghế trong từng suất chiếu, hỗ trợ giá thay đổi theo ghế hoặc loại ghế.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã giá ghế theo suất chiếu. |
| `showtimeId` | integer | Khóa ngoại -> `showtimes(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Suất chiếu áp dụng giá. |
| `seatId` | integer | Khóa ngoại -> `seats(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Ghế áp dụng giá. |
| `price` | numeric(12,2) | Không null | Giá cuối cùng của ghế trong suất chiếu. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo giá ghế. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật giá ghế gần nhất. |

### 24. Bảng `showtimes`

Bảng `showtimes` dùng để lưu lịch chiếu phim theo phòng, thời gian bắt đầu/kết thúc, giá cơ bản và trạng thái suất chiếu.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã suất chiếu. |
| `movieId` | integer | Khóa ngoại -> `movies(id)`; Không null; ON DELETE CASCADE | Phim được chiếu. |
| `roomId` | integer | Khóa ngoại -> `rooms(id)`; Không null; Tham gia ràng buộc chống trùng lịch; ON DELETE CASCADE | Phòng chiếu của suất chiếu. |
| `startTime` | timestamp(3) | Không null; Tham gia ràng buộc chống trùng lịch | Thời điểm bắt đầu suất chiếu. |
| `endTime` | timestamp(3) | Không null; Tham gia ràng buộc chống trùng lịch | Thời điểm kết thúc suất chiếu. |
| `basePrice` | numeric(12,2) | Không null | Giá vé cơ bản của suất chiếu. |
| `status` | ShowtimeStatus enum | Không null; Mặc định `ACTIVE` | Trạng thái suất chiếu: `ACTIVE`, `CANCELLED`, `FINISHED`. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo suất chiếu. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật suất chiếu gần nhất. |

Ràng buộc bổ sung: `showtimes_room_time_no_overlap` ngăn hai suất chiếu trong cùng một phòng bị chồng thời gian khi trạng thái khác `CANCELLED`.

### 25. Bảng `tickets`

Bảng `tickets` dùng để lưu vé đã phát sinh từ đơn đặt vé, bao gồm mã vé, mã QR, ghế, suất chiếu, giá và trạng thái sử dụng.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã vé. |
| `bookingId` | integer | Khóa ngoại -> `bookings(id)`; Không null; ON DELETE CASCADE | Đơn đặt vé phát sinh vé. |
| `showtimeId` | integer | Khóa ngoại -> `showtimes(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE CASCADE | Suất chiếu của vé. |
| `seatId` | integer | Khóa ngoại -> `seats(id)`; Không null; Duy nhất ghép (`showtimeId`, `seatId`); ON DELETE RESTRICT | Ghế của vé. |
| `ticketCode` | text | Không null; Duy nhất | Mã vé dùng để kiểm tra/tra cứu. |
| `qrCode` | text | Có thể null | Dữ liệu hoặc đường dẫn mã QR của vé. |
| `price` | numeric(12,2) | Không null | Giá vé. |
| `status` | TicketStatus enum | Không null; Mặc định `ACTIVE` | Trạng thái vé: `ACTIVE`, `USED`, `CANCELLED`. |
| `usedAt` | timestamp(3) | Có thể null | Thời điểm vé được sử dụng. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo vé. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật vé gần nhất. |

### 26. Bảng `users`

Bảng `users` dùng để lưu tài khoản người dùng, thông tin liên hệ, mật khẩu đã mã hóa và vai trò trong hệ thống.

| Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
| --- | --- | --- | --- |
| `id` | integer | Khóa chính; Không null; Tự tăng | Mã người dùng. |
| `roleId` | integer | Khóa ngoại -> `roles(id)`; Không null; ON DELETE RESTRICT | Vai trò của người dùng. |
| `fullName` | text | Không null | Họ tên người dùng. |
| `email` | text | Không null; Duy nhất | Email đăng nhập/liên hệ. |
| `phone` | text | Có thể null | Số điện thoại người dùng. |
| `password` | text | Không null | Mật khẩu đã mã hóa. |
| `avatar` | text | Có thể null | Đường dẫn ảnh đại diện. |
| `createdAt` | timestamp(3) | Không null; Mặc định `CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản. |
| `updatedAt` | timestamp(3) | Không null; Cập nhật bởi ứng dụng/Prisma | Thời điểm cập nhật tài khoản gần nhất. |
| `isActive` | boolean | Không null; Mặc định `true` | Trạng thái kích hoạt tài khoản. |
