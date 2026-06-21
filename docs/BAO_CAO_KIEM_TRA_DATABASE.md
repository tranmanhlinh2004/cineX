# Bao cao kiem tra database CineX

Cap nhat ngay: 10/06/2026 15:34:07 ICT (+07)

Nguon kiem tra:

- Schema mong doi: `backend/prisma/schema.prisma`
- Database thuc te: `postgresql://postgres:****@localhost:5432/cinex_db`
- PostgreSQL schema: `public`
- Cach kiem tra cot: doi chieu field scalar/enum trong Prisma model voi cot thuc te trong `information_schema.columns`
- Cach kiem tra du lieu: dem dong tung bang bang `select count(*)`

## Tom tat

| Hang muc | Ket qua |
| --- | --- |
| So bang ung dung theo Prisma | 26 |
| So bang thuc te trong `public` | 27 |
| Bang ky thuat ngoai Prisma | `_prisma_migrations` |
| Bang ung dung bi thieu | Không có |
| Bang ung dung thieu cot | Không có |
| Bang ung dung co cot du so voi Prisma | Không có |
| Bang chua co du lieu | Không có |

Ghi chu: `_prisma_migrations` la bang ky thuat cua Prisma de luu lich su migration, khong duoc khai bao trong `schema.prisma`.

## Bang thieu cot

Không có bang ung dung nao thieu cot theo `backend/prisma/schema.prisma`.

## Bang co cot du so voi Prisma

Không có bang ung dung nao co cot du so voi `backend/prisma/schema.prisma`.

## Bang chua co du lieu

Không có. Tat ca bang trong PostgreSQL schema `public` deu co it nhat 1 dong du lieu.

## Chi tiet tung bang

| STT | Bang                 | Model Prisma       | So dong | Cot thieu     | Cot du        |
| --- | -------------------- | ------------------ | ------- | ------------- | ------------- |
| 1   | `_prisma_migrations` | Ngoai Prisma       | 3       | Khong ap dung | Khong ap dung |
| 2   | `audit_logs`         | `AuditLog`         | 2       | Không có      | Không có      |
| 3   | `banners`            | `Banner`           | 4       | Không có      | Không có      |
| 4   | `booking_details`    | `BookingDetail`    | 11      | Không có      | Không có      |
| 5   | `booking_promotions` | `BookingPromotion` | 2       | Không có      | Không có      |
| 6   | `bookings`           | `Booking`          | 6       | Không có      | Không có      |
| 7   | `cinemas`            | `Cinema`           | 4       | Không có      | Không có      |
| 8   | `genres`             | `Genre`            | 20      | Không có      | Không có      |
| 9   | `movie_genres`       | `MovieGenre`       | 302     | Không có      | Không có      |
| 10  | `movie_images`       | `MovieImage`       | 104     | Không có      | Không có      |
| 11  | `movies`             | `Movie`            | 104     | Không có      | Không có      |
| 12  | `news`               | `News`             | 4       | Không có      | Không có      |
| 13  | `payments`           | `Payment`          | 6       | Không có      | Không có      |
| 14  | `permissions`        | `Permission`       | 21      | Không có      | Không có      |
| 15  | `promotions`         | `Promotion`        | 4       | Không có      | Không có      |
| 16  | `refresh_tokens`     | `RefreshToken`     | 14      | Không có      | Không có      |
| 17  | `reviews`            | `Review`           | 10      | Không có      | Không có      |
| 18  | `role_permissions`   | `RolePermission`   | 45      | Không có      | Không có      |
| 19  | `roles`              | `Role`             | 4       | Không có      | Không có      |
| 20  | `rooms`              | `Room`             | 9       | Không có      | Không có      |
| 21  | `seat_holds`         | `SeatHold`         | 3       | Không có      | Không có      |
| 22  | `seat_types`         | `SeatType`         | 3       | Không có      | Không có      |
| 23  | `seats`              | `Seat`             | 800     | Không có      | Không có      |
| 24  | `showtime_prices`    | `ShowtimePrice`    | 26320   | Không có      | Không có      |
| 25  | `showtimes`          | `Showtime`         | 303     | Không có      | Không có      |
| 26  | `tickets`            | `Ticket`           | 5       | Không có      | Không có      |
| 27  | `users`              | `User`             | 15      | Không có      | Không có      |

## Ket luan

Database `cinex_db` dang khop voi Prisma schema hien tai ve mat bang va cot ung dung. Du lieu seed/du lieu nghiep vu hien co tren tat ca bang public, khong phat hien bang rong.
