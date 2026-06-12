# Danh Sach Bang Database CineX

Cap nhat ngay: 02/06/2026

Nguon kiem tra: truy van truc tiep PostgreSQL tu `backend/.env` voi schema `public`.

Tong so bang: 27

| STT | Ten bang | Mo ta ngan |
| --- | --- | --- |
| 1 | `_prisma_migrations` | Bang ky thuat cua Prisma de luu lich su migration. |
| 2 | `audit_logs` | Luu lich su thao tac/he thong de phuc vu audit. |
| 3 | `banners` | Luu banner hien thi tren website. |
| 4 | `booking_details` | Luu chi tiet ghe va suat chieu trong tung don dat ve. |
| 5 | `booking_promotions` | Luu quan he giua don dat ve va ma khuyen mai da ap dung. |
| 6 | `bookings` | Luu don dat ve cua khach hang. |
| 7 | `cinemas` | Luu thong tin cum rap/chi nhanh rap. |
| 8 | `genres` | Luu danh muc the loai phim. |
| 9 | `movie_genres` | Bang lien ket nhieu-nhieu giua phim va the loai. |
| 10 | `movie_images` | Luu hinh anh phu cua phim. |
| 11 | `movies` | Luu thong tin phim. |
| 12 | `news` | Luu bai viet/tin tuc. |
| 13 | `payments` | Luu giao dich/thong tin thanh toan cua booking. |
| 14 | `permissions` | Luu danh sach quyen trong he thong. |
| 15 | `promotions` | Luu ma khuyen mai/chuong trinh uu dai. |
| 16 | `refresh_tokens` | Luu token dang nhap/duy tri phien cua nguoi dung. |
| 17 | `reviews` | Luu danh gia phim cua nguoi dung. |
| 18 | `role_permissions` | Bang lien ket role va permission. |
| 19 | `roles` | Luu vai tro nguoi dung. |
| 20 | `rooms` | Luu phong chieu thuoc tung rap. |
| 21 | `seat_holds` | Luu ghe dang duoc giu tam thoi khi dat ve. |
| 22 | `seat_types` | Luu loai ghe va phu thu theo loai ghe. |
| 23 | `seats` | Luu ghe trong tung phong chieu. |
| 24 | `showtime_prices` | Luu gia rieng theo ghe cho tung suat chieu. |
| 25 | `showtimes` | Luu suat chieu cua phim trong phong chieu. |
| 26 | `tickets` | Luu ve da phat sinh sau khi thanh toan thanh cong. |
| 27 | `users` | Luu tai khoan nguoi dung. |

## Danh Sach Ten Bang Thuan

```text
_prisma_migrations
audit_logs
banners
booking_details
booking_promotions
bookings
cinemas
genres
movie_genres
movie_images
movies
news
payments
permissions
promotions
refresh_tokens
reviews
role_permissions
roles
rooms
seat_holds
seat_types
seats
showtime_prices
showtimes
tickets
users
```
