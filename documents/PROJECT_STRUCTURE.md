# Cau truc tong quat project CineX

Tai lieu nay mo ta cau truc chinh cua project CineX o muc tong quan. Cac thu muc sinh tu dong hoac co dung luong lon nhu `.git`, `node_modules`, `.next`, file log va build output duoc luoc bo de cay thu muc de doc hon.

## Tong quan

CineX la he thong dat ve xem phim va quan tri rap chieu phim, gom 4 phan chinh:

- `frontend`: ung dung Next.js/React phuc vu giao dien khach hang va trang quan tri.
- `backend`: server Node.js TypeScript su dung Prisma de lam viec voi co so du lieu PostgreSQL.
- `database`: file SQL va so do co so du lieu.
- `documents`: tai lieu phan tich, bao cao, mo ta bang va nghiep vu.

## Cay thu muc rut gon

```text
CineX/
|-- backend/
|   |-- package.json
|   |-- package-lock.json
|   |-- prisma.config.ts
|   |-- src/
|   |   `-- server.ts
|   `-- prisma/
|       |-- schema.prisma
|       |-- migrations/
|       |   |-- 20260501191705_init/
|       |   |-- 20260501204652_add_permission/
|       |   |-- 20260501210647_add_permissions/
|       |   |-- 20260615090000_add_showtime_no_overlap_constraint/
|       |   |-- 20260619090000_use_seat_holds_for_booking_locks/
|       |   `-- migration_lock.toml
|       `-- seed/
|           |-- seed.ts
|           |-- index.ts
|           |-- client.ts
|           |-- users.seed.ts
|           |-- movies.seed.ts
|           |-- cinemas.seed.ts
|           |-- rooms.seed.ts
|           |-- seats.seed.ts
|           |-- showtimes.seed.ts
|           |-- bookings.seed.ts
|           |-- reviews.seed.ts
|           |-- promotions.seed.ts
|           |-- roles.seed.ts
|           |-- permissions.seed.ts
|           `-- ...
|
|-- frontend/
|   |-- package.json
|   |-- package-lock.json
|   |-- next.config.ts
|   |-- tsconfig.json
|   |-- postcss.config.mjs
|   |-- eslint.config.mjs
|   |-- README.md
|   |-- AGENTS.md
|   |-- CLAUDE.md
|   |-- scripts/
|   |   `-- set-dev-session.mjs
|   |-- app/
|   |   |-- layout.tsx
|   |   |-- globals.css
|   |   |-- favicon.ico
|   |   |-- loading/
|   |   |   `-- page.tsx
|   |   |-- (site)/
|   |   |   |-- layout.tsx
|   |   |   |-- page.tsx
|   |   |   |-- about/
|   |   |   |-- login/
|   |   |   |-- register/
|   |   |   |-- genres/
|   |   |   |-- showtimes/
|   |   |   |-- ticket-booking/
|   |   |   |-- account/
|   |   |   |   |-- booking/
|   |   |   |   `-- profile/
|   |   |   `-- movies/
|   |   |       |-- now-showing/
|   |   |       |-- coming-soon/
|   |   |       `-- [id]/
|   |   `-- (admin)/
|   |       `-- admin/
|   |           |-- layout.tsx
|   |           |-- page.tsx
|   |           |-- admin-crud-config.ts
|   |           |-- dashboard/
|   |           |-- accounts/
|   |           |-- bookings/
|   |           |-- cinemas/
|   |           |   |-- room-types/
|   |           |   |-- seat-maps/
|   |           |   `-- seat-types/
|   |           |-- movies/
|   |           |   |-- new/
|   |           |   |-- now-showing/
|   |           |   |-- coming-soon/
|   |           |   |-- genres/
|   |           |   |-- reviews/
|   |           |   `-- [id]/
|   |           |       `-- edit/
|   |           |-- showtimes/
|   |           |   |-- schedules/
|   |           |   `-- sessions/
|   |           |-- payments/
|   |           |   |-- invoices/
|   |           |   |-- refund-approvals/
|   |           |   `-- transactions/
|   |           |-- permissions/
|   |           |-- promotions/
|   |           |-- revenue/
|   |           |-- rooms/
|   |           |-- tickets/
|   |           `-- [module]/
|   |               |-- new/
|   |               `-- [id]/
|   |                   `-- edit/
|   |-- components/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- card/
|   |   |-- layout/
|   |   |-- navigation/
|   |   |-- support/
|   |   |-- MovieCatalogPage.tsx
|   |   |-- MovieDetailPage.tsx
|   |   |-- MovieRecommendationsSection.tsx
|   |   |-- MovieReviewsSection.tsx
|   |   |-- QuickBookingPanel.tsx
|   |   `-- ...
|   |-- lib/
|   |   |-- auth.ts
|   |   |-- auth-api.ts
|   |   |-- chatbot-api.ts
|   |   |-- home-movies.ts
|   |   |-- movie-recommendations-api.ts
|   |   |-- movie-reviews-api.ts
|   |   |-- ticket-booking-api.ts
|   |   |-- youtube.ts
|   |   |-- admin-accounts-api.ts
|   |   |-- admin-genres-api.ts
|   |   |-- admin-movies-api.ts
|   |   `-- admin-showtimes-api.ts
|   `-- public/
|       |-- file.svg
|       |-- globe.svg
|       |-- next.svg
|       |-- vercel.svg
|       |-- window.svg
|       `-- movies/
|           |-- banner/
|           |   |-- coming-soon/
|           |   |-- ended/
|           |   `-- now-showing/
|           `-- poster/
|               |-- coming-soon/
|               |-- ended/
|               |-- now-showing/
|               `-- uploaded/
|
|-- database/
|   |-- insert-data.sql
|   `-- cineX_diagram.pgerd
|
`-- documents/
    |-- BAO_CAO_KIEM_TRA_DATABASE.md
    |-- CHUC_NANG_HIEN_CO.md
    |-- DANH_SACH_BANG_DATABASE.md
    |-- LOGIC_VA_LUONG_HOAT_DONG_CINEX.md
    |-- MO_TA_CHI_TIET_BANG_DATABASE.md
    |-- THU_VIEN_VA_PACKAGE_SU_DUNG.md
    |-- Tong quan de tai.docx
    |-- Phan tich nghiep vu khach hang.docx
    |-- Phan tich nghiep vu quan tri.docx
    |-- diagram.png
    `-- ...
```

## Mo ta cac phan chinh

### `backend/`

Chua server API va lop truy cap du lieu. Server hien duoc dat tap trung trong `src/server.ts`, su dung `http` cua Node.js, Prisma Client va adapter PostgreSQL.

Nhung vung quan trong:

- `src/server.ts`: khoi tao server, ket noi database, xu ly API, authentication, booking, showtime, thanh toan, quan tri va cac tac vu nghiep vu lien quan.
- `prisma/schema.prisma`: dinh nghia schema database va cac model Prisma.
- `prisma/migrations/`: lich su thay doi cau truc database.
- `prisma/seed/`: du lieu mau cho role, permission, user, phim, rap, phong, ghe, suat chieu, booking, promotion, review, banner, news...
- `package.json`: script backend gom `dev`, `start`, `seed`.

Nhom model chinh trong Prisma:

```text
Role, Permission, RolePermission, User, RefreshToken,
Movie, Genre, MovieGenre, MovieImage,
Cinema, Room, SeatType, Seat,
Showtime, ShowtimePrice,
Booking, BookingDetail, SeatHold,
Payment, Ticket, Promotion, BookingPromotion,
Review, Banner, News, AuditLog
```

### `frontend/`

Chua ung dung Next.js App Router, chia route thanh hai nhom lon:

- `(site)`: giao dien khach hang nhu trang chu, danh sach phim, chi tiet phim, lich chieu, dat ve, dang nhap, dang ky, tai khoan.
- `(admin)`: giao dien quan tri nhu dashboard, quan ly phim, rap/phong/ghe, suat chieu, booking, tai khoan, phan quyen, thanh toan, doanh thu, khuyen mai.

Nhung vung quan trong:

- `app/`: cau truc route cua Next.js.
- `components/`: cac component dung chung va component theo module.
- `components/admin/`: khung trang admin, form phim, trang CRUD, cau hinh menu/module admin.
- `components/layout/`: header, footer va layout chung cua site.
- `components/navigation/`: xu ly dieu huong va man hinh loading/redirect.
- `components/support/`: widget ho tro noi tren giao dien.
- `lib/`: cac ham goi API va helper cho auth, movie, booking, admin, chatbot, YouTube.
- `public/movies/`: anh poster va banner phim, chia theo trang thai `now-showing`, `coming-soon`, `ended`, va anh upload.
- `scripts/set-dev-session.mjs`: script ho tro phien dev truoc khi chay `next dev`.

### `database/`

Chua tai nguyen database doc lap voi Prisma:

- `insert-data.sql`: script chen du lieu SQL.
- `cineX_diagram.pgerd`: so do database dung voi pgAdmin/ERD.

### `documents/`

Chua cac tai lieu phan tich va bao cao cua do an:

- Mo ta bang database va danh sach bang.
- Bao cao kiem tra database.
- Tai lieu logic va luong hoat dong CineX.
- Tai lieu chuc nang hien co.
- Danh muc hinh, danh muc bang, so do, file Word phan tich nghiep vu va tong quan de tai.

## Ghi chu van hanh nhanh

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Seed database:

```powershell
cd backend
npm run seed
```

Bien moi truong backend can co `DATABASE_URL`; co the cau hinh them `PORT` va `CORS_ORIGIN` neu can thay doi cong server hoac nguon frontend duoc phep truy cap.
