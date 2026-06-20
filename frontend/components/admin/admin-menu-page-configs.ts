import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Armchair,
  BadgePercent,
  Banknote,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  MessageSquare,
  ReceiptText,
  Rows3,
  Sofa,
  Star,
  TicketPercent,
  Undo2,
} from "lucide-react";

type AdminMenuPageStat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type AdminMenuPageConfig = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  searchPlaceholder: string;
  stats: AdminMenuPageStat[];
  filters: {
    label: string;
    options: string[];
  }[];
  tableTitle: string;
  tableDescription: string;
  columns: {
    key: string;
    label: string;
  }[];
  rows: Record<string, string>[];
  sideTitle: string;
  sideItems: string[];
  checklistTitle: string;
  checklist: string[];
};

export const adminMenuPageConfigs = {
  roomTypes: {
    eyebrow: "Quản lý rạp",
    title: "Loại phòng chiếu",
    description:
      "Quản lý nhóm phòng chiếu, định dạng trình chiếu, phụ thu và trạng thái áp dụng theo từng cụm rạp.",
    primaryAction: "Thêm loại phòng",
    searchPlaceholder: "Tìm loại phòng, định dạng, phụ thu...",
    stats: [
      {
        label: "Loại phòng",
        value: "4",
        helper: "2D, 3D, IMAX, Dolby",
        icon: Building2,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Phòng áp dụng",
        value: "18",
        helper: "Theo 3 cụm rạp",
        icon: Armchair,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Phụ thu cao nhất",
        value: "35.000đ",
        helper: "Áp dụng cho IMAX",
        icon: CircleDollarSign,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Đang mở bán",
        value: "16",
        helper: "Phòng đang hoạt động",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    filters: [
      { label: "Tất cả định dạng", options: ["2D", "3D", "IMAX", "Dolby 7.1"] },
      { label: "Tất cả trạng thái", options: ["Đang áp dụng", "Cần rà soát", "Tạm dừng"] },
    ],
    tableTitle: "Danh sách loại phòng chiếu",
    tableDescription:
      "Khung quản lý loại phòng để chuẩn hóa định dạng, giá phụ thu và cấu hình vận hành.",
    columns: [
      { key: "type", label: "Loại phòng" },
      { key: "format", label: "Định dạng" },
      { key: "surcharge", label: "Phụ thu" },
      { key: "rooms", label: "Số phòng" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { type: "Tiêu chuẩn 2D", format: "2D", surcharge: "0đ", rooms: "9", status: "Đang áp dụng" },
      { type: "Phòng 3D", format: "3D", surcharge: "15.000đ", rooms: "4", status: "Đang áp dụng" },
      { type: "IMAX", format: "IMAX", surcharge: "35.000đ", rooms: "2", status: "Đang áp dụng" },
      { type: "Dolby Premium", format: "Dolby 7.1", surcharge: "25.000đ", rooms: "3", status: "Cần rà soát" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Chuẩn hóa loại phòng chiếu theo định dạng và chính sách giá.",
      "Liên kết loại phòng với lịch chiếu, sơ đồ ghế và báo cáo doanh thu.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối dữ liệu loại phòng chiếu",
      "Thêm form cấu hình phụ thu",
      "Liên kết loại phòng với từng phòng chiếu",
    ],
  },
  seatMaps: {
    eyebrow: "Quản lý rạp",
    title: "Sơ đồ ghế",
    description:
      "Theo dõi sơ đồ ghế theo phòng chiếu, số ghế khả dụng, ghế bảo trì và trạng thái công bố.",
    primaryAction: "Tạo sơ đồ ghế",
    searchPlaceholder: "Tìm sơ đồ, phòng, cụm rạp...",
    stats: [
      {
        label: "Sơ đồ ghế",
        value: "18",
        helper: "Mỗi phòng một sơ đồ",
        icon: Rows3,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Tổng ghế",
        value: "2.024",
        helper: "Đang quản lý",
        icon: Armchair,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Ghế bảo trì",
        value: "38",
        helper: "Cần xử lý",
        icon: AlertTriangle,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Đã công bố",
        value: "16",
        helper: "Sẵn sàng bán vé",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    filters: [
      { label: "Tất cả cụm rạp", options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"] },
      { label: "Tất cả trạng thái", options: ["Đã công bố", "Bản nháp", "Bảo trì"] },
    ],
    tableTitle: "Danh sách sơ đồ ghế",
    tableDescription:
      "Khung danh sách sơ đồ trước khi mở trình chỉnh sửa vị trí ghế trực quan.",
    columns: [
      { key: "map", label: "Sơ đồ" },
      { key: "cinema", label: "Cụm rạp" },
      { key: "room", label: "Phòng" },
      { key: "layout", label: "Bố cục" },
      { key: "seats", label: "Ghế" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { map: "IMAX 01", cinema: "CineX Vinh Center", room: "IMAX 01", layout: "14 x 12", seats: "168", status: "Đã công bố" },
      { map: "Dolby 02", cinema: "CineX Vinh Center", room: "Dolby 02", layout: "12 x 9", seats: "108", status: "Đã công bố" },
      { map: "Lê Lợi 03", cinema: "CineX Lê Lợi", room: "Phòng 03", layout: "14 x 8", seats: "112", status: "Đã công bố" },
      { map: "Quang Trung 04", cinema: "CineX Quang Trung", room: "Phòng 04", layout: "12 x 10", seats: "120", status: "Bảo trì" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Thiết lập bố cục hàng, cột, lối đi và ghế không bán.",
      "Đồng bộ sơ đồ ghế với luồng đặt vé theo suất chiếu.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Dựng editor kéo thả ghế",
      "Thêm trạng thái ghế theo thời gian thực",
      "Kiểm tra xung đột khi đổi sơ đồ đang có vé bán",
    ],
  },
  seatTypes: {
    eyebrow: "Quản lý rạp",
    title: "Loại ghế",
    description:
      "Quản lý loại ghế, phụ thu, sức chứa và ghi chú vận hành cho từng nhóm ghế trong rạp.",
    primaryAction: "Thêm loại ghế",
    searchPlaceholder: "Tìm loại ghế, phụ thu, ghi chú...",
    stats: [
      {
        label: "Loại ghế",
        value: "4",
        helper: "Thường, VIP, đôi, khuyết tật",
        icon: Sofa,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Ghế VIP",
        value: "312",
        helper: "15,4% tổng ghế",
        icon: Star,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Ghế đôi",
        value: "64",
        helper: "Tính theo vị trí",
        icon: Armchair,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Đang áp dụng",
        value: "4",
        helper: "Không có loại tạm dừng",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    filters: [
      { label: "Tất cả nhóm ghế", options: ["Thường", "VIP", "Đôi", "Khuyết tật"] },
      { label: "Tất cả trạng thái", options: ["Đang áp dụng", "Tạm dừng"] },
    ],
    tableTitle: "Danh sách loại ghế",
    tableDescription:
      "Khung cấu hình loại ghế dùng để tính giá vé và hiển thị trong sơ đồ đặt chỗ.",
    columns: [
      { key: "type", label: "Loại ghế" },
      { key: "surcharge", label: "Phụ thu" },
      { key: "seats", label: "Số ghế" },
      { key: "note", label: "Ghi chú" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { type: "Ghế thường", surcharge: "0đ", seats: "1.562", note: "Khu vực tiêu chuẩn", status: "Đang áp dụng" },
      { type: "Ghế VIP", surcharge: "20.000đ", seats: "312", note: "Hàng giữa, vị trí đẹp", status: "Đang áp dụng" },
      { type: "Ghế đôi", surcharge: "45.000đ", seats: "64", note: "Tính theo cặp", status: "Đang áp dụng" },
      { type: "Ghế hỗ trợ", surcharge: "0đ", seats: "86", note: "Ưu tiên tiếp cận", status: "Đang áp dụng" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Cấu hình phụ thu theo từng loại ghế.",
      "Hiển thị chú giải loại ghế trong luồng đặt vé.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối loại ghế với sơ đồ ghế",
      "Thêm màu hiển thị từng loại ghế",
      "Kiểm soát phụ thu theo ngày lễ",
    ],
  },
  paymentTransactions: {
    eyebrow: "Quản lý thanh toán",
    title: "Lịch sử giao dịch",
    description:
      "Theo dõi giao dịch thanh toán, kênh xử lý, thời điểm ghi nhận và trạng thái đối soát.",
    primaryAction: "Xuất giao dịch",
    searchPlaceholder: "Tìm mã giao dịch, khách hàng, kênh thanh toán...",
    stats: [
      {
        label: "Giao dịch",
        value: "1.248",
        helper: "Trong tháng hiện tại",
        icon: CreditCard,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Thành công",
        value: "1.196",
        helper: "95,8% giao dịch",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Doanh thu",
        value: "184,2 tr",
        helper: "Sau mã giảm giá",
        icon: CircleDollarSign,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Chờ đối soát",
        value: "24",
        helper: "Ví điện tử và thẻ",
        icon: ClipboardCheck,
        tone: "bg-amber-50 text-amber-700",
      },
    ],
    filters: [
      { label: "Tất cả kênh", options: ["Ví điện tử", "Thẻ ngân hàng", "Quầy vé", "Chuyển khoản"] },
      { label: "Tất cả trạng thái", options: ["Đã thanh toán", "Chờ đối soát", "Đã hủy"] },
    ],
    tableTitle: "Danh sách giao dịch",
    tableDescription:
      "Khung dữ liệu giao dịch phục vụ tra cứu, đối soát và xuất báo cáo thanh toán.",
    columns: [
      { key: "code", label: "Mã giao dịch" },
      { key: "customer", label: "Khách hàng" },
      { key: "channel", label: "Kênh" },
      { key: "amount", label: "Giá trị" },
      { key: "paidAt", label: "Thời điểm" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { code: "PAY-240613-1024", customer: "Nguyễn Hoàng Minh", channel: "Ví điện tử", amount: "420.000đ", paidAt: "13/06/2026 09:42", status: "Đã thanh toán" },
      { code: "PAY-240613-1021", customer: "Trần Bảo Ngọc", channel: "Thẻ ngân hàng", amount: "310.000đ", paidAt: "13/06/2026 09:18", status: "Đã thanh toán" },
      { code: "PAY-240613-1018", customer: "Lê Đức Anh", channel: "Quầy vé", amount: "180.000đ", paidAt: "13/06/2026 08:55", status: "Chờ đối soát" },
      { code: "PAY-240613-1012", customer: "Phạm Thu Hà", channel: "Ví điện tử", amount: "260.000đ", paidAt: "12/06/2026 21:20", status: "Đã hủy" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Tra cứu giao dịch theo kênh, thời gian và trạng thái.",
      "Đối soát giao dịch thanh toán với đơn đặt vé.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối API giao dịch thanh toán",
      "Thêm xuất Excel/PDF",
      "Thêm bộ lọc theo khoảng ngày",
    ],
  },
  refundApprovals: {
    eyebrow: "Quản lý thanh toán",
    title: "Phê duyệt hoàn tiền",
    description:
      "Quản lý yêu cầu hoàn tiền, lý do hoàn, giá trị hoàn và trạng thái phê duyệt nội bộ.",
    primaryAction: "Tạo yêu cầu hoàn tiền",
    searchPlaceholder: "Tìm mã yêu cầu, mã đơn, khách hàng...",
    stats: [
      {
        label: "Chờ duyệt",
        value: "12",
        helper: "Cần xử lý hôm nay",
        icon: Undo2,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Đã duyệt",
        value: "86",
        helper: "Trong tháng hiện tại",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Giá trị hoàn",
        value: "18,4 tr",
        helper: "Đã phê duyệt",
        icon: Banknote,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Quá hạn",
        value: "3",
        helper: "Cần rà soát",
        icon: AlertTriangle,
        tone: "bg-red-50 text-red-700",
      },
    ],
    filters: [
      { label: "Tất cả lý do", options: ["Khách hủy vé", "Lỗi thanh toán", "Hủy suất chiếu", "Khác"] },
      { label: "Tất cả trạng thái", options: ["Chờ duyệt", "Đã duyệt", "Từ chối"] },
    ],
    tableTitle: "Danh sách yêu cầu hoàn tiền",
    tableDescription:
      "Khung duyệt hoàn tiền trước khi tích hợp cổng thanh toán và luồng thông báo khách hàng.",
    columns: [
      { key: "request", label: "Mã yêu cầu" },
      { key: "orderCode", label: "Mã đơn" },
      { key: "customer", label: "Khách hàng" },
      { key: "amount", label: "Giá trị hoàn" },
      { key: "reason", label: "Lý do" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { request: "RF-240613-021", orderCode: "CX240613-1012", customer: "Phạm Thu Hà", amount: "260.000đ", reason: "Khách hủy vé", status: "Chờ duyệt" },
      { request: "RF-240613-020", orderCode: "CX240613-1009", customer: "Nguyễn Bảo Trâm", amount: "180.000đ", reason: "Lỗi thanh toán", status: "Đã duyệt" },
      { request: "RF-240612-019", orderCode: "CX240612-0988", customer: "Trần Minh Quân", amount: "320.000đ", reason: "Hủy suất chiếu", status: "Đã duyệt" },
      { request: "RF-240612-018", orderCode: "CX240612-0976", customer: "Lê Thùy Linh", amount: "95.000đ", reason: "Khác", status: "Từ chối" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Theo dõi yêu cầu hoàn tiền theo trạng thái xử lý.",
      "Ghi nhận lý do hoàn tiền và lịch sử phê duyệt.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Thêm luồng duyệt nhiều cấp",
      "Nối API hoàn tiền",
      "Gửi thông báo sau khi duyệt",
    ],
  },
  invoices: {
    eyebrow: "Quản lý thanh toán",
    title: "Xuất hóa đơn",
    description:
      "Quản lý hóa đơn, trạng thái phát hành, giá trị thanh toán và lỗi cần xử lý khi xuất hóa đơn.",
    primaryAction: "Xuất hóa đơn",
    searchPlaceholder: "Tìm mã hóa đơn, mã đơn, khách hàng...",
    stats: [
      {
        label: "Chờ xuất",
        value: "32",
        helper: "Đủ điều kiện xuất",
        icon: ReceiptText,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Đã phát hành",
        value: "684",
        helper: "Trong tháng hiện tại",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Giá trị",
        value: "96,8 tr",
        helper: "Tổng hóa đơn",
        icon: CircleDollarSign,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Lỗi xuất",
        value: "5",
        helper: "Cần xử lý lại",
        icon: AlertTriangle,
        tone: "bg-amber-50 text-amber-700",
      },
    ],
    filters: [
      { label: "Tất cả loại hóa đơn", options: ["Cá nhân", "Doanh nghiệp"] },
      { label: "Tất cả trạng thái", options: ["Chờ xuất", "Đã phát hành", "Lỗi xuất"] },
    ],
    tableTitle: "Danh sách hóa đơn",
    tableDescription:
      "Khung xuất hóa đơn cho các giao dịch đã thanh toán và cần chứng từ.",
    columns: [
      { key: "invoice", label: "Mã hóa đơn" },
      { key: "orderCode", label: "Mã đơn" },
      { key: "customer", label: "Khách hàng" },
      { key: "amount", label: "Giá trị" },
      { key: "issuedAt", label: "Ngày xuất" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { invoice: "INV-240613-084", orderCode: "CX240613-1024", customer: "Nguyễn Hoàng Minh", amount: "420.000đ", issuedAt: "13/06/2026", status: "Đã phát hành" },
      { invoice: "INV-240613-083", orderCode: "CX240613-1021", customer: "Trần Bảo Ngọc", amount: "310.000đ", issuedAt: "13/06/2026", status: "Đã phát hành" },
      { invoice: "INV-240613-082", orderCode: "CX240613-1018", customer: "Lê Đức Anh", amount: "180.000đ", issuedAt: "Chưa xuất", status: "Chờ xuất" },
      { invoice: "INV-240612-078", orderCode: "CX240612-0976", customer: "Lê Thùy Linh", amount: "95.000đ", issuedAt: "12/06/2026", status: "Lỗi xuất" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Xuất hóa đơn cho giao dịch đủ điều kiện.",
      "Theo dõi lỗi phát hành hóa đơn và thao tác xuất lại.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối nhà cung cấp hóa đơn điện tử",
      "Thêm xuất hàng loạt",
      "Tải PDF hóa đơn",
    ],
  },
  promotions: {
    eyebrow: "Marketing",
    title: "Khuyến mãi",
    description:
      "Quản lý mã giảm giá, chiến dịch khuyến mãi, số lượt sử dụng và thời hạn áp dụng cho đặt vé.",
    primaryAction: "Tạo khuyến mãi",
    searchPlaceholder: "Tìm mã khuyến mãi, chiến dịch, điều kiện...",
    stats: [
      {
        label: "Chiến dịch",
        value: "8",
        helper: "Đang chạy",
        icon: BadgePercent,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Mã hoạt động",
        value: "24",
        helper: "Có thể áp dụng",
        icon: TicketPercent,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Giảm giá",
        value: "38,6 tr",
        helper: "Trong tháng",
        icon: CircleDollarSign,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Sắp hết hạn",
        value: "5",
        helper: "Trong 7 ngày",
        icon: AlertTriangle,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    filters: [
      { label: "Tất cả loại", options: ["Giảm phần trăm", "Giảm cố định", "Combo", "Thành viên"] },
      { label: "Tất cả trạng thái", options: ["Đang chạy", "Sắp chạy", "Hết hạn", "Tạm dừng"] },
    ],
    tableTitle: "Danh sách khuyến mãi",
    tableDescription:
      "Khung quản lý mã khuyến mãi trước khi đồng bộ điều kiện áp dụng trong luồng đặt vé.",
    columns: [
      { key: "code", label: "Mã" },
      { key: "campaign", label: "Chiến dịch" },
      { key: "discount", label: "Ưu đãi" },
      { key: "usage", label: "Lượt dùng" },
      { key: "endsAt", label: "Hết hạn" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { code: "CINEX20", campaign: "Cuối tuần rực rỡ", discount: "20%", usage: "342/1.000", endsAt: "30/06/2026", status: "Đang chạy" },
      { code: "FAMILY50", campaign: "Vé gia đình", discount: "50.000đ", usage: "128/500", endsAt: "28/06/2026", status: "Đang chạy" },
      { code: "MEMBER10", campaign: "Thành viên mới", discount: "10%", usage: "864/2.000", endsAt: "31/07/2026", status: "Đang chạy" },
      { code: "IMAXPLUS", campaign: "Trải nghiệm IMAX", discount: "Combo bắp nước", usage: "76/300", endsAt: "20/06/2026", status: "Sắp hết hạn" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Quản lý mã giảm giá và chiến dịch áp dụng trong đặt vé.",
      "Theo dõi lượt sử dụng, thời hạn và trạng thái khuyến mãi.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối API tạo mã khuyến mãi",
      "Thêm điều kiện áp dụng theo phim/rạp",
      "Theo dõi ngân sách chiến dịch",
    ],
  },
  movieReviews: {
    eyebrow: "Quản lý đánh giá",
    title: "Quản lý đánh giá",
    description:
      "Theo dõi đánh giá phim từ khách hàng, điểm sao, nội dung bình luận và trạng thái kiểm duyệt.",
    primaryAction: "Tạo phản hồi",
    searchPlaceholder: "Tìm phim, khách hàng, nội dung đánh giá...",
    stats: [
      {
        label: "Đánh giá",
        value: "1.086",
        helper: "Từ khách đã đặt vé",
        icon: MessageSquare,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Điểm trung bình",
        value: "4,6/5",
        helper: "Toàn bộ phim",
        icon: Star,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Chờ duyệt",
        value: "27",
        helper: "Cần kiểm tra",
        icon: ClipboardCheck,
        tone: "bg-red-50 text-red-700",
      },
      {
        label: "Đã phản hồi",
        value: "218",
        helper: "Bởi đội vận hành",
        icon: FileText,
        tone: "bg-emerald-50 text-emerald-700",
      },
    ],
    filters: [
      { label: "Tất cả điểm sao", options: ["5 sao", "4 sao", "3 sao", "1-2 sao"] },
      { label: "Tất cả trạng thái", options: ["Hiển thị", "Chờ duyệt", "Đã ẩn", "Đã báo cáo"] },
    ],
    tableTitle: "Danh sách đánh giá phim",
    tableDescription:
      "Khung kiểm duyệt đánh giá trước khi nối dữ liệu bình luận phim từ website.",
    columns: [
      { key: "movie", label: "Phim" },
      { key: "customer", label: "Khách hàng" },
      { key: "rating", label: "Điểm" },
      { key: "comment", label: "Bình luận" },
      { key: "submittedAt", label: "Ngày gửi" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      { movie: "Dune: Part Two", customer: "Nguyễn Hoàng Minh", rating: "5 sao", comment: "Hình ảnh và âm thanh rất tốt", submittedAt: "13/06/2026", status: "Hiển thị" },
      { movie: "Inside Out 2", customer: "Trần Bảo Ngọc", rating: "5 sao", comment: "Phù hợp đi xem cùng gia đình", submittedAt: "13/06/2026", status: "Hiển thị" },
      { movie: "Deadpool & Wolverine", customer: "Lê Đức Anh", rating: "4 sao", comment: "Cần kiểm tra ngôn từ", submittedAt: "12/06/2026", status: "Chờ duyệt" },
      { movie: "A Quiet Place: Day One", customer: "Phạm Thu Hà", rating: "3 sao", comment: "Suất chiếu hơi trễ", submittedAt: "12/06/2026", status: "Đã phản hồi" },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Kiểm duyệt nội dung đánh giá trước khi hiển thị công khai.",
      "Theo dõi điểm đánh giá để hỗ trợ vận hành danh mục phim.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối API đánh giá phim",
      "Thêm thao tác ẩn/hiện đánh giá",
      "Thêm phản hồi quản trị viên",
    ],
  },
  contactMessages: {
    eyebrow: "Hỗ trợ khách hàng",
    title: "Tin nhắn liên hệ",
    description:
      "Theo dõi tin nhắn khách hàng gửi về CineX qua form liên hệ, hotline, Zalo và các kênh hỗ trợ trực tuyến.",
    primaryAction: "Soạn phản hồi",
    searchPlaceholder: "Tìm khách hàng, email, số điện thoại, nội dung tin nhắn...",
    stats: [
      {
        label: "Tin nhắn",
        value: "148",
        helper: "Trong tháng hiện tại",
        icon: MessageSquare,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        label: "Chờ phản hồi",
        value: "18",
        helper: "Cần xử lý hôm nay",
        icon: AlertTriangle,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        label: "Đã phản hồi",
        value: "126",
        helper: "85,1% đã xử lý",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Cần theo dõi",
        value: "4",
        helper: "Liên quan thanh toán/vé",
        icon: FileText,
        tone: "bg-red-50 text-red-700",
      },
    ],
    filters: [
      { label: "Tất cả kênh liên hệ", options: ["Website", "Zalo", "Hotline", "Email"] },
      { label: "Tất cả trạng thái", options: ["Chờ phản hồi", "Đang xử lý", "Đã phản hồi", "Cần theo dõi"] },
    ],
    tableTitle: "Danh sách tin nhắn liên hệ",
    tableDescription:
      "Khung quản lý tin nhắn liên hệ để đội chăm sóc khách hàng tiếp nhận, phân loại và phản hồi yêu cầu hỗ trợ.",
    columns: [
      { key: "customer", label: "Khách hàng" },
      { key: "contact", label: "Liên hệ" },
      { key: "channel", label: "Kênh" },
      { key: "subject", label: "Chủ đề" },
      { key: "receivedAt", label: "Thời gian gửi" },
      { key: "status", label: "Trạng thái" },
    ],
    rows: [
      {
        customer: "Nguyễn Hoàng Minh",
        contact: "minh@example.com",
        channel: "Website",
        subject: "Không nhận được vé điện tử",
        receivedAt: "20/06/2026 09:24",
        status: "Chờ phản hồi",
      },
      {
        customer: "Trần Bảo Ngọc",
        contact: "0906 770 123",
        channel: "Zalo",
        subject: "Đổi suất chiếu sau khi thanh toán",
        receivedAt: "20/06/2026 08:58",
        status: "Đang xử lý",
      },
      {
        customer: "Lê Đức Anh",
        contact: "ducanh@example.com",
        channel: "Email",
        subject: "Hỏi chính sách hoàn tiền",
        receivedAt: "19/06/2026 21:12",
        status: "Đã phản hồi",
      },
      {
        customer: "Phạm Thu Hà",
        contact: "0908 990 125",
        channel: "Hotline",
        subject: "Thanh toán thành công nhưng đơn bị hủy",
        receivedAt: "19/06/2026 18:35",
        status: "Cần theo dõi",
      },
    ],
    sideTitle: "Phạm vi chức năng",
    sideItems: [
      "Tiếp nhận tin nhắn từ các kênh liên hệ của khách hàng.",
      "Phân loại yêu cầu hỗ trợ theo vé, thanh toán, tài khoản và trải nghiệm tại rạp.",
      "Ghi nhận trạng thái phản hồi để đội chăm sóc khách hàng theo dõi tiếp.",
    ],
    checklistTitle: "Việc cần dựng tiếp",
    checklist: [
      "Nối API lưu tin nhắn liên hệ",
      "Thêm chi tiết hội thoại và lịch sử phản hồi",
      "Gửi email/Zalo sau khi nhân viên phản hồi",
    ],
  },
} satisfies Record<string, AdminMenuPageConfig>;
