# Danh sách bảng Database CineX

Cập nhật ngày: 18/06/2026

Nguồn kiểm tra: truy vấn trực tiếp PostgreSQL từ `backend/.env` với schema `public`, đối chiếu thêm `backend/prisma/schema.prisma` và các file migration Prisma.

Tổng số bảng trong database: 27

Tổng số bảng nghiệp vụ: 26. Bảng `_prisma_migrations` là bảng kỹ thuật của Prisma nên không đưa vào phần mô tả chi tiết.

## Danh sách bảng

| STT | Tên bảng | Mô tả ngắn |
| --- | --- | --- |
| 1 | `audit_logs` | Lưu lịch sử thao tác và thay đổi dữ liệu trong hệ thống. |
| 2 | `banners` | Lưu banner quảng bá hiển thị trên website. |
| 3 | `booking_details` | Lưu chi tiết ghế, suất chiếu và giá trong từng đơn đặt vé. |
| 4 | `booking_promotions` | Lưu quan hệ giữa đơn đặt vé và khuyến mãi đã áp dụng. |
| 5 | `bookings` | Lưu thông tin đơn đặt vé của khách hàng. |
| 6 | `cinemas` | Lưu thông tin cụm rạp hoặc chi nhánh rạp. |
| 7 | `genres` | Lưu danh mục thể loại phim. |
| 8 | `movie_genres` | Lưu quan hệ nhiều-nhiều giữa phim và thể loại. |
| 9 | `movie_images` | Lưu thư viện hình ảnh phụ của phim. |
| 10 | `movies` | Lưu thông tin phim. |
| 11 | `news` | Lưu bài viết, tin tức và nội dung truyền thông. |
| 12 | `payments` | Lưu giao dịch thanh toán của đơn đặt vé. |
| 13 | `permissions` | Lưu danh sách quyền thao tác trong hệ thống. |
| 14 | `promotions` | Lưu mã khuyến mãi và chương trình ưu đãi. |
| 15 | `refresh_tokens` | Lưu token làm mới phiên đăng nhập của người dùng. |
| 16 | `reviews` | Lưu đánh giá phim của người dùng. |
| 17 | `role_permissions` | Lưu quan hệ giữa vai trò và quyền. |
| 18 | `roles` | Lưu vai trò người dùng. |
| 19 | `rooms` | Lưu phòng chiếu thuộc từng rạp. |
| 20 | `seat_holds` | Lưu ghế được giữ tạm thời trong quá trình đặt vé. |
| 21 | `seat_types` | Lưu loại ghế và phụ thu theo loại ghế. |
| 22 | `seats` | Lưu sơ đồ ghế trong từng phòng chiếu. |
| 23 | `showtime_prices` | Lưu giá riêng theo ghế cho từng suất chiếu. |
| 24 | `showtimes` | Lưu suất chiếu của phim trong phòng chiếu. |
| 25 | `tickets` | Lưu vé phát sinh sau khi đặt vé/thanh toán thành công. |
| 26 | `users` | Lưu tài khoản người dùng. |

Phần mô tả chi tiết từng bảng được tách riêng tại [MO_TA_CHI_TIET_BANG_DATABASE.md](MO_TA_CHI_TIET_BANG_DATABASE.md).
