# Chuc Nang Hien Co Cua CineX

Cap nhat ngay: 02/06/2026

Tai thoi diem kiem tra, project da duoc chay voi:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`
- Backend health check: `GET /health` tra ve `200`
- Cac trang frontend chinh da kiem tra deu tra ve `200`, tru `/account/tickets` tra ve `404`

## 1. Tong Quan Project

CineX la he thong website rap phim gom 2 phan:

- `backend`: Node.js/TypeScript, HTTP server tu viet, ket noi PostgreSQL bang Prisma.
- `frontend`: Next.js, React, Tailwind CSS, giao dien website khach hang va mot khu admin co ban.

Du lieu backend hien dang co:

- 104 phim trong API trang chu.
- 41 phim dang chieu, phan trang 5 trang.
- 21 phim sap chieu, phan trang 3 trang.
- 4 cum rap trong du lieu quick booking/trang chu.
- 0 suat chieu dang mo ban theo ngay hien tai, nen man hinh dat ve dong hien trang thai chua co suat chieu.

## 2. Chuc Nang Phia Khach Hang

### 2.1. Dieu Huong Va Tai Khoan Tren Header

- Menu dieu huong den: Trang chu, Phim dang chieu, Phim sap chieu, Lich chieu, The loai, Gioi thieu, Dat ve.
- O tim kiem tren header va mobile header. Hien tai la thanh nhap giao dien, chua co luong tim kiem toan site.
- Nut dang nhap, dang ky khi chua dang nhap.
- Khi da dang nhap: hien loi chao, avatar, thong bao, menu tai khoan.
- Menu tai khoan co: Thong tin ca nhan, Lich su dat ve, QR code ve cua toi, Dang xuat.
- Chuc nang dang xuat xoa thong tin localStorage va dieu huong ve trang chu.

### 2.2. Trang Chu `/`

- Hero slider phim noi bat tu database, co tu dong chuyen slide va nut chuyen slide.
- Moi phim tren hero co thong tin: trang thai, diem danh gia, thoi luong, ngon ngu, the loai.
- Co hanh dong: Dat ve ngay, Chi tiet phim, Xem trailer.
- Khung tim suat nhanh theo ngay chieu va chi nhanh rap.
- Danh sach phim dang chieu noi bat.
- Danh sach phim sap chieu noi bat.
- Khu vuc rap dang mo ban, ve dien tu, phong chieu da dinh dang, combo bap nuoc.
- Lien ket nhanh sang lich chieu va dat ve.

### 2.3. Danh Sach Phim Dang Chieu `/movies/now-showing`

- Lay du lieu tu API `GET /api/movies/now-showing`.
- Hien phim noi bat dau danh sach.
- Loc phim theo the loai va ngon ngu.
- Tim kiem trong danh sach phim hien tai.
- Phan trang danh sach phim.
- Moi phim co poster, trang thai, gioi han tuoi, diem danh gia, mo ta ngan, trailer, nut dat ve va chi tiet phim.

### 2.4. Danh Sach Phim Sap Chieu `/movies/coming-soon`

- Lay du lieu tu API `GET /api/movies/coming-soon`.
- Hien phim sap chieu noi bat.
- Loc phim theo thang khoi chieu, the loai va ngon ngu.
- Tim kiem trong danh sach phim hien tai.
- Phan trang danh sach phim.
- Moi phim co nut trailer va nut nhac toi/dat theo phim sap chieu.

### 2.5. Chi Tiet Phim `/movies/[id]`

- Lay du lieu tu API `GET /api/movies/:id`.
- Hien poster, banner, trang thai phim, diem danh gia, gioi han tuoi.
- Hien thong tin phim: dao dien, dien vien, the loai, thoi luong, ngay phat hanh, ngon ngu, quoc gia, so review.
- Hien trailer bang iframe YouTube neu URL hop le; neu khong co embed thi co lien ket mo trailer.
- Hien tom tat noi dung phim.
- Hien cac suat chieu gan nhat neu phim co suat dang ban.
- Nut Dat ve voi phim dang chieu; nut Nhac toi voi phim sap chieu.

### 2.6. Lich Chieu `/showtimes`

- Trang lich chieu hien tai dung du lieu tinh tren frontend.
- Co danh sach 3 cum rap mau: CineX Vinh Center, CineX Le Loi, CineX Quang Trung.
- Loc lich theo rap, ngay, dinh dang chieu va tu khoa.
- Hien thong tin rap: dia chi, gio mo cua, so phong, dinh dang.
- Hien phim, dinh dang suat chieu, gia ve, phong chieu, so ghe con lai.
- Nut dat ve theo tung suat chieu dieu huong sang man hinh dat ve.

### 2.7. The Loai `/genres`

- Trang the loai hien tai dung du lieu tinh tren frontend.
- Co 8 the loai: hanh dong, anime, khoa hoc, toi pham, gia dinh, hai, tinh cam, tam ly.
- Loc phim theo the loai.
- Loc theo trang thai: tat ca, dang chieu, sap chieu.
- Tim kiem phim theo ten, mo ta, quoc gia, dinh dang va the loai.
- Co goi y xem phim theo tam trang/nhu cau xem.
- Moi phim co lien ket chi tiet va dat ve/nhac toi theo trang thai.

### 2.8. Gioi Thieu `/about`

- Trang gioi thieu thuong hieu CineX.
- Hien so lieu, dac diem dich vu, cum rap noi bat, cam ket va cot moc phat trien.
- Trang nay la noi dung tinh tren frontend.

## 3. Chuc Nang Dat Ve

### 3.1. Man Hinh Dat Ve `/ticket-booking`

- Lay tuy chon dat ve tu API `GET /api/booking/options`.
- Ho tro doc tham so URL: `showtime`, `movie`, `time` de tu dong chon suat/phim phu hop.
- Loc/chon ngay chieu, rap, phim va suat chieu.
- Tai so do ghe theo suat chieu bang API `GET /api/booking/showtimes/:id/seats`.
- Hien so do ghe theo hang, co phan biet ghe thuong, VIP, ghe doi, ghe dang chon va ghe khong kha dung.
- Chon/bo chon ghe truc tiep tren so do.
- Tinh tong tien theo ghe da chon.
- Chon phuong thuc thanh toan: CASH, MOMO, VNPAY, ZALOPAY, BANKING, CARD.
- Tao don dat ve bang API `POST /api/booking/checkout`.
- Bat buoc dang nhap truoc khi tao don.
- Sau khi tao don thanh cong, don o trang thai cho thanh toan trong 5 phut va dieu huong sang lich su dat ve.

Trang thai du lieu hien tai:

- API dat ve tra ve danh sach phuong thuc thanh toan.
- Hien tai khong co suat chieu dang mo ban theo ngay 02/06/2026, nen trang dat ve hien thong bao chua co suat chieu de dat ve.

### 3.2. Kiem Tra Ghe Va Tao Don Tren Backend

Backend da co logic:

- Kiem tra user da dang nhap bang Bearer token.
- Gioi han moi don toi da 10 ghe.
- Kiem tra suat chieu dang ACTIVE.
- Kiem tra ghe thuoc dung phong va dang ACTIVE.
- Chan dat ghe da co booking pending/confirmed hoac dang bi hold.
- Tao booking code rieng dang `CX...`.
- Tao booking, booking detail va payment pending trong transaction.
- Don pending tu dong het han sau 5 phut neu chua thanh toan.

## 4. Dang Nhap, Dang Ky Va Tai Khoan

### 4.1. Dang Nhap `/login`

- Dang nhap bang email hoac so dien thoai va mat khau.
- Co tuy chon ghi nho tai khoan.
- Luu token va user vao localStorage sau khi dang nhap thanh cong.
- Dieu huong theo role:
  - ADMIN, MANAGER, STAFF: `/admin`
  - Role khac: `/`
- Backend kiem tra mat khau thuong hoac bcrypt hash, kiem tra tai khoan dang active.

### 4.2. Dang Ky `/register`

- Dang ky bang ho ten, email, so dien thoai tuy chon, mat khau va xac nhan mat khau.
- Frontend kiem tra mat khau xac nhan.
- Backend yeu cau ho ten, email, mat khau.
- Mat khau toi thieu 6 ky tu.
- Email khong duoc trung.
- User moi duoc gan role CUSTOMER.
- Mat khau duoc hash bang bcrypt.
- Dang ky thanh cong thi tao token va dang nhap ngay.

### 4.3. Ho So Ca Nhan `/account/profile`

- Yeu cau dang nhap; neu khong co token thi dieu huong ve `/login`.
- Tai thong tin user tu API `GET /api/account/profile`.
- Cap nhat ho ten, email, so dien thoai va avatar bang API `PUT /api/account/profile`.
- Upload avatar dang data URL voi dinh dang JPEG, PNG, WEBP.
- Gioi han avatar 10 MB.
- Xoa avatar tren form.
- Doi mat khau bang API `PUT /api/account/password`.
- Kiem tra mat khau moi toi thieu 6 ky tu va xac nhan khop.

### 4.4. Lich Su Dat Ve `/account/booking`

- Yeu cau dang nhap; neu khong co token thi dieu huong ve `/login`.
- Tai lich su booking bang API `GET /api/account/bookings`.
- Hien thong ke tong don, don cho thanh toan, don da thanh toan va tong tien da thanh toan.
- Hien card phim da dat ve.
- Hien bang don hang voi ma don, khach hang, tong tien, thoi gian thanh toan, trang thai, phuong thuc thanh toan.
- Co dem nguoc cho don dang cho thanh toan.
- Cho doi phuong thuc thanh toan cho don pending.
- Thanh toan don pending bang API `POST /api/account/bookings/:id/pay`.
- Khi thanh toan thanh cong:
  - Payment chuyen sang SUCCESS.
  - Booking chuyen sang CONFIRMED.
  - Backend tao/cap nhat ticket va QR code dang `QR-...`.

## 5. Khu Quan Tri Admin

### 5.1. Layout Admin `/admin`

- Co layout rieng cho khu quan tri.
- Sidebar desktop va nav mobile.
- Menu admin hien co:
  - Tong quan
  - Quan ly rap
- Lien ket quay ve website.

### 5.2. Dashboard Admin `/admin`

- Hien thong ke mau: rap dang van hanh, phim dang ban ve, suat chieu hom nay, ve da dat.
- Hien bang tinh trang cum rap.
- Co nut chuyen sang man hinh quan ly rap.
- Du lieu dashboard hien tai la du lieu tinh trong frontend, chua ket noi API admin.

### 5.3. Quan Ly Rap `/admin/cinemas`

- Hien danh sach cum rap mau.
- Co form tim rap theo ten/dia chi.
- Co select loc theo trang thai va nut loc.
- Co nut them rap.
- Hien card tung rap voi dia chi, trang thai, so phong va dinh dang.
- Hien tai cac nut/tim kiem/loc/them rap moi la giao dien, chua co CRUD backend.

## 6. Backend API Hien Co

### 6.1. Public API

- `GET /health`: kiem tra backend dang chay.
- `GET /api/home`: du lieu trang chu, hero movies, phim dang chieu, phim sap chieu, rap va quick booking.
- `GET /api/movies/now-showing`: danh sach phim dang chieu co phan trang.
- `GET /api/movies/coming-soon`: danh sach phim sap chieu co phan trang.
- `GET /api/movies/:id`: chi tiet phim.
- `GET /api/booking/options`: ngay, phim, rap, suat chieu va phuong thuc thanh toan cho man hinh dat ve.
- `GET /api/booking/showtimes/:id/seats`: so do ghe theo suat chieu.

### 6.2. Auth API

- `POST /api/auth/login`: dang nhap bang email/so dien thoai va mat khau.
- `POST /api/auth/register`: dang ky tai khoan customer.

### 6.3. Account API Can Bearer Token

- `GET /api/account/profile`: lay ho so user dang dang nhap.
- `PUT /api/account/profile`: cap nhat ho so va avatar.
- `PUT /api/account/password`: doi mat khau.
- `GET /api/account/bookings`: lay lich su dat ve.
- `POST /api/account/bookings/:id/pay`: thanh toan don pending.

### 6.4. Booking API Can Bearer Token

- `POST /api/booking/checkout`: tao don dat ve pending.

## 7. Database/Model Da Co Trong Prisma

Schema Prisma hien co cac nhom du lieu:

- Role, Permission, RolePermission.
- User, RefreshToken.
- Movie, Genre, MovieGenre, MovieImage.
- Cinema, Room, SeatType, Seat.
- Showtime, ShowtimePrice.
- Booking, BookingDetail, SeatHold.
- Payment, Ticket.
- Promotion, BookingPromotion.
- Review.
- Banner, News.
- AuditLog.

Dieu nay cho thay database da san sang cho nhieu module lon hon giao dien hien tai, nhu quyen han, khuyen mai, tin tuc, banner, review va audit log. Tuy nhien khong phai tat ca cac module nay da co man hinh/API CRUD hoan chinh trong project hien tai.

## 8. Chuc Nang Dang Co Mot Phan Hoac Chua Hoan Chinh

- O tim kiem tren header moi la UI, chua co logic tim kiem toan site.
- `/showtimes` dang dung du lieu tinh tren frontend, chua lay tu backend.
- `/genres` dang dung du lieu tinh tren frontend, chua lay tu backend.
- `/about` la trang noi dung tinh.
- Khu admin hien moi co dashboard va quan ly rap dang mock UI, chua co API CRUD admin.
- Menu tai khoan co link `/account/tickets` cho QR code ve, nhung route nay hien tra ve `404`.
- Backend co model Promotion, News, Banner, Review, Permission, AuditLog, nhung chua co endpoint CRUD rieng trong server hien tai.
- API dat ve da co logic day du, nhung du lieu hien tai khong co suat chieu future/active nen nguoi dung chua the tao don moi trong ngay kiem tra.

## 9. Cac Route Frontend Da Kiem Tra

- `/`
- `/movies/now-showing`
- `/movies/coming-soon`
- `/movies/[id]`
- `/showtimes`
- `/ticket-booking`
- `/login`
- `/register`
- `/account/profile`
- `/account/booking`
- `/about`
- `/genres`
- `/admin`
- `/admin/cinemas`
- `/loading`

## 10. Lenh Chay Project

Backend:

```bash
cd backend
npm run start
```

Frontend:

```bash
cd frontend
npm run dev -- -p 3000
```

Backend can PostgreSQL va bien moi truong `DATABASE_URL` tro den database CineX.
