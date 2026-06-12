import AdminModulePage from "@/components/admin/AdminModulePage";
import { CalendarClock, CheckCircle2, CircleDollarSign, Ticket } from "lucide-react";

export default function AdminShowtimesPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.6"
      title="Quản lý lịch chiếu và giá vé"
      description="Khung quản lý suất chiếu, phòng chiếu, khung giờ, loại vé và bảng giá theo từng cụm rạp."
      primaryAction="Tạo suất chiếu"
      searchPlaceholder="Tìm phim, phòng chiếu, khung giờ..."
      stats={[
        {
          label: "Suất hôm nay",
          value: "42",
          helper: "Đang mở bán theo 3 rạp",
          icon: CalendarClock,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Đang mở bán",
          value: "36",
          helper: "Có thể đặt vé online",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Mức giá",
          value: "8",
          helper: "Theo loại ghế và khung giờ",
          icon: CircleDollarSign,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Vé giữ chỗ",
          value: "214",
          helper: "Trong các suất sắp chiếu",
          icon: Ticket,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả cụm rạp", options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"] },
        { label: "Tất cả trạng thái", options: ["Đang mở bán", "Chờ mở bán", "Tạm dừng"] },
      ]}
      tableTitle="Danh sách suất chiếu"
      tableDescription="Khung quản lý lịch chiếu và giá vé trước khi nối lịch từ database."
      columns={[
        { key: "movie", label: "Phim" },
        { key: "cinema", label: "Cụm rạp" },
        { key: "room", label: "Phòng" },
        { key: "time", label: "Thời gian" },
        { key: "price", label: "Giá vé" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          movie: "Dune: Part Two",
          cinema: "CineX Vinh Center",
          room: "IMAX 01",
          time: "13/06/2026 09:30",
          price: "120.000đ",
          status: "Đang mở bán",
        },
        {
          movie: "Inside Out 2",
          cinema: "CineX Lê Lợi",
          room: "Phòng 03",
          time: "13/06/2026 11:15",
          price: "90.000đ",
          status: "Đang mở bán",
        },
        {
          movie: "Deadpool & Wolverine",
          cinema: "CineX Quang Trung",
          room: "Phòng 06",
          time: "13/06/2026 18:45",
          price: "110.000đ",
          status: "Chờ mở bán",
        },
        {
          movie: "A Quiet Place: Day One",
          cinema: "CineX Vinh Center",
          room: "Dolby 02",
          time: "14/06/2026 20:20",
          price: "100.000đ",
          status: "Tạm dừng",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Tạo và chỉnh sửa suất chiếu theo phim, rạp, phòng.",
        "Thiết lập bảng giá theo loại ghế, ngày lễ và khung giờ.",
        "Kiểm tra trùng lịch phòng trước khi mở bán.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Thêm calendar quản lý suất chiếu",
        "Thêm form cấu hình giá vé",
        "Thêm kiểm tra xung đột phòng",
        "Nối API mở bán và khóa suất",
      ]}
    />
  );
}
