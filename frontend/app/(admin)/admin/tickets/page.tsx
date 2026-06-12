import AdminModulePage from "@/components/admin/AdminModulePage";
import { AlertTriangle, CheckCircle2, Clock3, Ticket } from "lucide-react";

export default function AdminTicketsPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.8"
      title="Quản lý vé"
      description="Khung quản lý vé điện tử, mã QR, trạng thái soát vé và lịch sử sử dụng vé."
      primaryAction="Phát hành vé"
      searchPlaceholder="Tìm mã vé, mã đơn, khách hàng, ghế..."
      stats={[
        {
          label: "Vé phát hành",
          value: "3.842",
          helper: "Theo tháng hiện tại",
          icon: Ticket,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Đã soát vé",
          value: "2.916",
          helper: "Qua cổng kiểm soát",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Chưa sử dụng",
          value: "812",
          helper: "Vé còn hiệu lực",
          icon: Clock3,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Vé lỗi",
          value: "14",
          helper: "Cần kiểm tra mã QR",
          icon: AlertTriangle,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả cụm rạp", options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"] },
        { label: "Tất cả trạng thái", options: ["Đã phát hành", "Đã soát vé", "Chưa sử dụng", "Đã hủy"] },
      ]}
      tableTitle="Danh sách vé"
      tableDescription="Khung dữ liệu vé để chuẩn bị màn hình tra cứu và kiểm soát vào rạp."
      columns={[
        { key: "ticketCode", label: "Mã vé" },
        { key: "orderCode", label: "Mã đơn" },
        { key: "movie", label: "Phim" },
        { key: "seat", label: "Ghế" },
        { key: "showtime", label: "Suất chiếu" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          ticketCode: "TK-8842-A01",
          orderCode: "CX240613-1024",
          movie: "Dune: Part Two",
          seat: "A01",
          showtime: "13/06/2026 09:30",
          status: "Đã phát hành",
        },
        {
          ticketCode: "TK-8842-A02",
          orderCode: "CX240613-1024",
          movie: "Dune: Part Two",
          seat: "A02",
          showtime: "13/06/2026 09:30",
          status: "Đã soát vé",
        },
        {
          ticketCode: "TK-8841-C08",
          orderCode: "CX240613-1021",
          movie: "Inside Out 2",
          seat: "C08",
          showtime: "13/06/2026 11:15",
          status: "Chưa sử dụng",
        },
        {
          ticketCode: "TK-8836-F12",
          orderCode: "CX240613-1012",
          movie: "A Quiet Place: Day One",
          seat: "F12",
          showtime: "14/06/2026 20:20",
          status: "Đã hủy",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Tra cứu vé theo mã vé, mã đơn và khách hàng.",
        "Quản lý trạng thái phát hành, soát vé, hủy vé.",
        "Chuẩn bị luồng quét QR và ghi nhận lịch sử sử dụng vé.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Thêm modal QR vé",
        "Thêm màn lịch sử soát vé",
        "Nối API phát hành vé",
        "Thêm quyền kiểm soát vé theo nhân viên",
      ]}
    />
  );
}
