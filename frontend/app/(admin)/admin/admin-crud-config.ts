export type AdminCrudModuleKey =
  | "accounts"
  | "permissions"
  | "cinemas"
  | "rooms"
  | "showtimes"
  | "bookings"
  | "tickets";

export type AdminCrudColumn = {
  key: string;
  label: string;
};

export type AdminCrudField = {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "select" | "textarea";
  placeholder?: string;
  options?: string[];
  span?: "full";
};

export type AdminCrudRow = Record<string, string> & {
  id: string;
};

export type AdminCrudConfig = {
  key: AdminCrudModuleKey;
  basePath: string;
  title: string;
  singularTitle: string;
  description: string;
  createAction: string;
  updateAction: string;
  columns: AdminCrudColumn[];
  fields: AdminCrudField[];
  rows: AdminCrudRow[];
};

export const adminCrudConfigs: Record<AdminCrudModuleKey, AdminCrudConfig> = {
  accounts: {
    key: "accounts",
    basePath: "/admin/accounts",
    title: "Quản lý tài khoản",
    singularTitle: "tài khoản",
    description:
      "Cập nhật thông tin người dùng, vai trò truy cập và trạng thái tài khoản trong hệ thống.",
    createAction: "Tạo tài khoản",
    updateAction: "Lưu tài khoản",
    columns: [
      { key: "name", label: "Họ tên" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
      { key: "lastLogin", label: "Đăng nhập gần nhất" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "name", label: "Họ tên", placeholder: "Nhập họ tên" },
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "email@cinex.vn",
      },
      {
        key: "phone",
        label: "Số điện thoại",
        type: "tel",
        placeholder: "0900 000 000",
      },
      {
        key: "role",
        label: "Vai trò",
        type: "select",
        options: [
          "Khách hàng",
          "Nhân viên thu ngân",
          "Nhân viên quản lý phim",
          "Nhân viên kế toán",
          "Nhân viên chăm sóc khách hàng",
          "Quản lý",
          "Quản trị viên",
        ],
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Đang hoạt động", "Chờ xác minh", "Bị khóa"],
      },
      {
        key: "lastLogin",
        label: "Đăng nhập gần nhất",
        placeholder: "13/06/2026 08:15",
      },
      {
        key: "note",
        label: "Ghi chú nội bộ",
        type: "textarea",
        span: "full",
        placeholder: "Nhập ghi chú cho tài khoản",
      },
    ],
    rows: [
      {
        id: "admin-minh-anh",
        name: "Nguyễn Minh Anh",
        email: "minhanh@cinex.vn",
        phone: "0901 220 118",
        role: "Quản trị viên",
        lastLogin: "13/06/2026 08:15",
        status: "Đang hoạt động",
        note: "Có toàn quyền quản trị hệ thống.",
      },
      {
        id: "staff-bao-chau",
        name: "Trần Bảo Châu",
        email: "baochau@cinex.vn",
        phone: "0902 330 119",
        role: "Nhân viên thu ngân",
        lastLogin: "13/06/2026 07:52",
        status: "Đang hoạt động",
        note: "Phụ trách quầy vé CineX Lê Lợi.",
      },
      {
        id: "customer-duc-anh",
        name: "Lê Đức Anh",
        email: "ducanh@example.com",
        phone: "0903 440 120",
        role: "Khách hàng",
        lastLogin: "12/06/2026 21:18",
        status: "Chờ xác minh",
        note: "Cần xác minh email trước khi mở đầy đủ quyền đặt vé.",
      },
      {
        id: "customer-thu-ha",
        name: "Phạm Thu Hà",
        email: "thuha@example.com",
        phone: "0904 550 121",
        role: "Khách hàng",
        lastLogin: "10/06/2026 14:06",
        status: "Bị khóa",
        note: "Tài khoản bị khóa tạm thời do nhiều lần thanh toán lỗi.",
      },
    ],
  },
  permissions: {
    key: "permissions",
    basePath: "/admin/permissions",
    title: "Quản lý phân quyền",
    singularTitle: "vai trò",
    description:
      "Cấu hình vai trò, phạm vi truy cập và số quyền được gán cho từng nhóm người dùng.",
    createAction: "Tạo vai trò",
    updateAction: "Lưu vai trò",
    columns: [
      { key: "role", label: "Vai trò" },
      { key: "scope", label: "Phạm vi" },
      { key: "users", label: "Số tài khoản" },
      { key: "permissions", label: "Số quyền" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "role", label: "Vai trò", placeholder: "Tên vai trò" },
      { key: "scope", label: "Phạm vi", placeholder: "Phạm vi truy cập" },
      {
        key: "users",
        label: "Số tài khoản",
        type: "number",
        placeholder: "0",
      },
      {
        key: "permissions",
        label: "Số quyền",
        type: "number",
        placeholder: "0",
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Đang hoạt động", "Chờ rà soát", "Tạm dừng"],
      },
      {
        key: "description",
        label: "Mô tả quyền",
        type: "textarea",
        span: "full",
        placeholder: "Mô tả quyền hạn và giới hạn thao tác",
      },
    ],
    rows: [
      {
        id: "admin",
        role: "Quản trị viên",
        scope: "Toàn hệ thống",
        users: "2",
        permissions: "Tất cả",
        status: "Đang hoạt động",
        description: "Có toàn quyền xem, thêm, sửa, xóa và xuất báo cáo.",
      },
      {
        id: "manager",
        role: "Quản lý",
        scope: "Cụm rạp được gán",
        users: "8",
        permissions: "36",
        status: "Đang hoạt động",
        description: "Quản lý vận hành tổng quan hệ thống rạp phim.",
      },
      {
        id: "cashier",
        role: "Nhân viên thu ngân",
        scope: "Đặt vé, thanh toán, vé",
        users: "18",
        permissions: "12",
        status: "Đang hoạt động",
        description: "Tạo đơn, hỗ trợ thanh toán và kiểm tra trạng thái vé.",
      },
      {
        id: "movie-manager",
        role: "Nhân viên quản lý phim",
        scope: "Phim, thể loại, lịch chiếu",
        users: "5",
        permissions: "14",
        status: "Đang hoạt động",
        description: "Quản lý danh sách phim, thể loại, lịch chiếu và suất chiếu.",
      },
      {
        id: "accountant",
        role: "Nhân viên kế toán",
        scope: "Doanh thu, thanh toán",
        users: "4",
        permissions: "7",
        status: "Đang hoạt động",
        description: "Xem báo cáo doanh thu và đối soát giao dịch thanh toán.",
      },
      {
        id: "customer-support",
        role: "Nhân viên chăm sóc khách hàng",
        scope: "Bình luận, đánh giá, liên hệ",
        users: "6",
        permissions: "7",
        status: "Đang hoạt động",
        description: "Trả lời đánh giá và tin nhắn của khách hàng qua các kênh liên hệ.",
      },
      {
        id: "customer",
        role: "Khách hàng",
        scope: "Website người dùng",
        users: "1.240",
        permissions: "12",
        status: "Đang hoạt động",
        description: "Truy cập đầy đủ chức năng website người dùng.",
      },
    ],
  },
  cinemas: {
    key: "cinemas",
    basePath: "/admin/cinemas",
    title: "Quản lý rạp",
    singularTitle: "cụm rạp",
    description:
      "Cập nhật thông tin cụm rạp, địa chỉ, định dạng chiếu và người phụ trách vận hành.",
    createAction: "Tạo cụm rạp",
    updateAction: "Lưu cụm rạp",
    columns: [
      { key: "name", label: "Cụm rạp" },
      { key: "address", label: "Địa chỉ" },
      { key: "rooms", label: "Phòng chiếu" },
      { key: "formats", label: "Định dạng" },
      { key: "manager", label: "Quản lý" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "name", label: "Tên cụm rạp", placeholder: "CineX Vinh Center" },
      { key: "manager", label: "Quản lý", placeholder: "Người phụ trách" },
      {
        key: "address",
        label: "Địa chỉ",
        span: "full",
        placeholder: "Nhập địa chỉ cụm rạp",
      },
      {
        key: "rooms",
        label: "Số phòng chiếu",
        type: "number",
        placeholder: "0",
      },
      {
        key: "formats",
        label: "Định dạng chiếu",
        placeholder: "2D, 3D, IMAX",
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Đang hoạt động", "Cần cập nhật", "Tạm dừng"],
      },
      {
        key: "description",
        label: "Mô tả vận hành",
        type: "textarea",
        span: "full",
        placeholder: "Ghi chú về khu vực, thiết bị, giờ vận hành",
      },
    ],
    rows: [
      {
        id: "vinh-center",
        name: "CineX Vinh Center",
        address: "69 Hồ Tùng Mậu, TP. Vinh",
        rooms: "7",
        formats: "2D, 3D, IMAX, Dolby 7.1",
        manager: "Nguyễn Minh Anh",
        status: "Đang hoạt động",
        description: "Cụm rạp trung tâm, có phòng IMAX và Dolby.",
      },
      {
        id: "le-loi",
        name: "CineX Lê Lợi",
        address: "18 Lê Lợi, TP. Vinh",
        rooms: "5",
        formats: "2D, Dolby 7.1",
        manager: "Trần Bảo Châu",
        status: "Đang hoạt động",
        description: "Cụm rạp nội thành, phục vụ suất chiếu phổ thông.",
      },
      {
        id: "quang-trung",
        name: "CineX Quang Trung",
        address: "72 Quang Trung, TP. Vinh",
        rooms: "6",
        formats: "2D, 3D, IMAX",
        manager: "Lê Thanh Phong",
        status: "Cần cập nhật",
        description: "Đang rà soát lại thông tin phòng và thiết bị chiếu.",
      },
    ],
  },
  rooms: {
    key: "rooms",
    basePath: "/admin/rooms",
    title: "Quản lý phòng chiếu và ghế",
    singularTitle: "phòng chiếu",
    description:
      "Quản lý phòng chiếu, định dạng, số ghế và trạng thái vận hành theo từng cụm rạp.",
    createAction: "Tạo phòng chiếu",
    updateAction: "Lưu phòng chiếu",
    columns: [
      { key: "room", label: "Phòng" },
      { key: "cinema", label: "Cụm rạp" },
      { key: "format", label: "Định dạng" },
      { key: "seats", label: "Số ghế" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "room", label: "Tên phòng", placeholder: "IMAX 01" },
      {
        key: "cinema",
        label: "Cụm rạp",
        type: "select",
        options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"],
      },
      {
        key: "format",
        label: "Định dạng",
        type: "select",
        options: ["2D", "3D", "IMAX", "Dolby 7.1"],
      },
      {
        key: "seats",
        label: "Số ghế",
        type: "number",
        placeholder: "120",
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Đang hoạt động", "Bảo trì", "Tạm dừng"],
      },
      {
        key: "seatNote",
        label: "Ghi chú sơ đồ ghế",
        type: "textarea",
        span: "full",
        placeholder: "Mô tả loại ghế, khu VIP, ghế bảo trì",
      },
    ],
    rows: [
      {
        id: "imax-01",
        room: "IMAX 01",
        cinema: "CineX Vinh Center",
        format: "IMAX",
        seats: "168",
        status: "Đang hoạt động",
        seatNote: "Có 24 ghế VIP ở hàng giữa.",
      },
      {
        id: "dolby-02",
        room: "Dolby 02",
        cinema: "CineX Vinh Center",
        format: "Dolby 7.1",
        seats: "108",
        status: "Đang hoạt động",
        seatNote: "Âm thanh Dolby, ghế đôi ở hàng cuối.",
      },
      {
        id: "room-03",
        room: "Phòng 03",
        cinema: "CineX Lê Lợi",
        format: "2D",
        seats: "112",
        status: "Đang hoạt động",
        seatNote: "Phòng tiêu chuẩn cho suất chiếu phổ thông.",
      },
      {
        id: "room-04",
        room: "Phòng 04",
        cinema: "CineX Quang Trung",
        format: "3D",
        seats: "120",
        status: "Bảo trì",
        seatNote: "Đang bảo trì máy chiếu và 8 ghế hàng F.",
      },
    ],
  },
  showtimes: {
    key: "showtimes",
    basePath: "/admin/showtimes",
    title: "Quản lý lịch chiếu và giá vé",
    singularTitle: "suất chiếu",
    description:
      "Cấu hình phim, rạp, phòng, thời gian chiếu và giá vé trước khi mở bán.",
    createAction: "Tạo suất chiếu",
    updateAction: "Lưu suất chiếu",
    columns: [
      { key: "movie", label: "Phim" },
      { key: "cinema", label: "Cụm rạp" },
      { key: "room", label: "Phòng" },
      { key: "time", label: "Thời gian" },
      { key: "price", label: "Giá vé" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "movie", label: "Phim", placeholder: "Tên phim" },
      {
        key: "cinema",
        label: "Cụm rạp",
        type: "select",
        options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"],
      },
      { key: "room", label: "Phòng", placeholder: "IMAX 01" },
      {
        key: "time",
        label: "Thời gian chiếu",
        placeholder: "13/06/2026 09:30",
      },
      { key: "price", label: "Giá vé", placeholder: "120.000đ" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Đang mở bán", "Chờ mở bán", "Tạm dừng"],
      },
      {
        key: "note",
        label: "Ghi chú suất chiếu",
        type: "textarea",
        span: "full",
        placeholder: "Ghi chú về phụ đề, định dạng, giới hạn đặt vé",
      },
    ],
    rows: [
      {
        id: "dune-0930",
        movie: "Dune: Part Two",
        cinema: "CineX Vinh Center",
        room: "IMAX 01",
        time: "13/06/2026 09:30",
        price: "120.000đ",
        status: "Đang mở bán",
        note: "Suất IMAX có phụ đề tiếng Việt.",
      },
      {
        id: "inside-out-1115",
        movie: "Inside Out 2",
        cinema: "CineX Lê Lợi",
        room: "Phòng 03",
        time: "13/06/2026 11:15",
        price: "90.000đ",
        status: "Đang mở bán",
        note: "Suất chiếu gia đình cuối tuần.",
      },
      {
        id: "deadpool-1845",
        movie: "Deadpool & Wolverine",
        cinema: "CineX Quang Trung",
        room: "Phòng 06",
        time: "13/06/2026 18:45",
        price: "110.000đ",
        status: "Chờ mở bán",
        note: "Chờ duyệt phân loại độ tuổi.",
      },
      {
        id: "quiet-place-2020",
        movie: "A Quiet Place: Day One",
        cinema: "CineX Vinh Center",
        room: "Dolby 02",
        time: "14/06/2026 20:20",
        price: "100.000đ",
        status: "Tạm dừng",
        note: "Tạm dừng để điều chỉnh lịch phòng.",
      },
    ],
  },
  bookings: {
    key: "bookings",
    basePath: "/admin/bookings",
    title: "Quản lý đặt vé và thanh toán",
    singularTitle: "đơn đặt vé",
    description:
      "Theo dõi đơn đặt vé, khách hàng, kênh thanh toán, giá trị giao dịch và trạng thái xử lý.",
    createAction: "Tạo đơn đặt vé",
    updateAction: "Lưu đơn đặt vé",
    columns: [
      { key: "code", label: "Mã đơn" },
      { key: "customer", label: "Khách hàng" },
      { key: "movie", label: "Phim" },
      { key: "channel", label: "Kênh thanh toán" },
      { key: "amount", label: "Giá trị" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "code", label: "Mã đơn", placeholder: "CX240613-1024" },
      { key: "customer", label: "Khách hàng", placeholder: "Tên khách hàng" },
      {
        key: "phone",
        label: "Số điện thoại",
        type: "tel",
        placeholder: "0900 000 000",
      },
      { key: "movie", label: "Phim", placeholder: "Tên phim" },
      {
        key: "channel",
        label: "Kênh thanh toán",
        type: "select",
        options: ["Ví điện tử", "Thẻ ngân hàng", "Quầy vé", "Chuyển khoản"],
      },
      { key: "amount", label: "Giá trị", placeholder: "420.000đ" },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          "Đã thanh toán",
          "Chờ thanh toán",
          "Chờ đối soát",
          "Đã hủy",
        ],
      },
      {
        key: "note",
        label: "Ghi chú thanh toán",
        type: "textarea",
        span: "full",
        placeholder: "Thông tin đối soát, hoàn tiền hoặc hỗ trợ khách hàng",
      },
    ],
    rows: [
      {
        id: "cx240613-1024",
        code: "CX240613-1024",
        customer: "Nguyễn Hoàng Minh",
        phone: "0905 660 122",
        movie: "Dune: Part Two",
        channel: "Ví điện tử",
        amount: "420.000đ",
        status: "Đã thanh toán",
        note: "Giao dịch thành công, đã phát hành 2 vé.",
      },
      {
        id: "cx240613-1021",
        code: "CX240613-1021",
        customer: "Trần Bảo Ngọc",
        phone: "0906 770 123",
        movie: "Inside Out 2",
        channel: "Thẻ ngân hàng",
        amount: "310.000đ",
        status: "Đã thanh toán",
        note: "Thanh toán qua thẻ ngân hàng nội địa.",
      },
      {
        id: "cx240613-1018",
        code: "CX240613-1018",
        customer: "Lê Đức Anh",
        phone: "0907 880 124",
        movie: "Deadpool & Wolverine",
        channel: "Quầy vé",
        amount: "180.000đ",
        status: "Chờ đối soát",
        note: "Cần đối soát ca bán vé tại quầy.",
      },
      {
        id: "cx240613-1012",
        code: "CX240613-1012",
        customer: "Phạm Thu Hà",
        phone: "0908 990 125",
        movie: "A Quiet Place: Day One",
        channel: "Ví điện tử",
        amount: "260.000đ",
        status: "Đã hủy",
        note: "Khách hủy đơn trước thời hạn thanh toán.",
      },
    ],
  },
  tickets: {
    key: "tickets",
    basePath: "/admin/tickets",
    title: "Quản lý vé",
    singularTitle: "vé",
    description:
      "Quản lý vé điện tử, mã đơn, ghế, suất chiếu và trạng thái hợp lệ.",
    createAction: "Phát hành vé",
    updateAction: "Lưu vé",
    columns: [
      { key: "ticketCode", label: "Mã vé" },
      { key: "orderCode", label: "Mã đơn" },
      { key: "movie", label: "Phim" },
      { key: "seat", label: "Ghế" },
      { key: "showtime", label: "Suất chiếu" },
      { key: "status", label: "Trạng thái" },
    ],
    fields: [
      { key: "ticketCode", label: "Mã vé", placeholder: "TK-8842-A01" },
      { key: "orderCode", label: "Mã đơn", placeholder: "CX240613-1024" },
      { key: "customer", label: "Khách hàng", placeholder: "Tên khách hàng" },
      { key: "movie", label: "Phim", placeholder: "Tên phim" },
      { key: "seat", label: "Ghế", placeholder: "A01" },
      {
        key: "showtime",
        label: "Suất chiếu",
        placeholder: "13/06/2026 09:30",
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: ["Vé hợp lệ", "Vé không hợp lệ"],
      },
      {
        key: "note",
        label: "Ghi chú vé",
        type: "textarea",
        span: "full",
        placeholder: "Ghi chú QR, lịch sử soát vé hoặc hỗ trợ khách hàng",
      },
    ],
    rows: [
      {
        id: "tk-8842-a01",
        ticketCode: "TK-8842-A01",
        orderCode: "CX240613-1024",
        customer: "Nguyễn Hoàng Minh",
        movie: "Dune: Part Two",
        seat: "A01",
        showtime: "13/06/2026 09:30",
        status: "Vé hợp lệ",
        note: "Vé điện tử đã gửi email cho khách.",
      },
      {
        id: "tk-8842-a02",
        ticketCode: "TK-8842-A02",
        orderCode: "CX240613-1024",
        customer: "Nguyễn Hoàng Minh",
        movie: "Dune: Part Two",
        seat: "A02",
        showtime: "13/06/2026 09:30",
        status: "Vé hợp lệ",
        note: "Đã quét QR tại cổng 1.",
      },
      {
        id: "tk-8841-c08",
        ticketCode: "TK-8841-C08",
        orderCode: "CX240613-1021",
        customer: "Trần Bảo Ngọc",
        movie: "Inside Out 2",
        seat: "C08",
        showtime: "13/06/2026 11:15",
        status: "Vé hợp lệ",
        note: "Vé còn hiệu lực.",
      },
      {
        id: "tk-8836-f12",
        ticketCode: "TK-8836-F12",
        orderCode: "CX240613-1012",
        customer: "Phạm Thu Hà",
        movie: "A Quiet Place: Day One",
        seat: "F12",
        showtime: "14/06/2026 20:20",
        status: "Vé không hợp lệ",
        note: "Vé bị hủy theo đơn đặt vé.",
      },
    ],
  },
};

export function toAdminRouteId(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isAdminCrudModuleKey(
  value: string,
): value is AdminCrudModuleKey {
  return Object.prototype.hasOwnProperty.call(adminCrudConfigs, value);
}

export function getAdminCrudConfig(key: AdminCrudModuleKey) {
  return adminCrudConfigs[key];
}

export function getAdminCrudItem(config: AdminCrudConfig, id: string) {
  return config.rows.find((row) => {
    const primaryKey = config.columns[0]?.key;
    const candidates = [
      row.id,
      primaryKey ? row[primaryKey] : "",
      row.code,
      row.ticketCode,
      row.role,
      row.name,
      row.room,
      row.movie,
    ].filter(Boolean);

    return candidates.some((value) => value === id || toAdminRouteId(value) === id);
  });
}
