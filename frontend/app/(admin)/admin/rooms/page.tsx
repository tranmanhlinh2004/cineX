import AdminModulePage from "@/components/admin/AdminModulePage";
import { AlertTriangle, Armchair, Building2, CheckCircle2 } from "lucide-react";

export default function AdminRoomsPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.5"
      title="Quản lý phòng chiếu và ghế"
      description="Khung quản lý phòng chiếu, sơ đồ ghế, loại ghế và trạng thái ghế theo từng cụm rạp."
      primaryAction="Thêm phòng chiếu"
      searchPlaceholder="Tìm phòng, mã ghế, cụm rạp..."
      stats={[
        {
          label: "Tổng phòng",
          value: "18",
          helper: "Theo 3 cụm rạp",
          icon: Building2,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Tổng ghế",
          value: "2.024",
          helper: "Bao gồm ghế thường và VIP",
          icon: Armchair,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Ghế hoạt động",
          value: "1.986",
          helper: "98,1% ghế khả dụng",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Ghế bảo trì",
          value: "38",
          helper: "Cần xử lý trong tuần",
          icon: AlertTriangle,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả cụm rạp", options: ["CineX Vinh Center", "CineX Lê Lợi", "CineX Quang Trung"] },
        { label: "Tất cả trạng thái", options: ["Đang hoạt động", "Bảo trì", "Tạm dừng"] },
      ]}
      tableTitle="Danh sách phòng chiếu"
      tableDescription="Khung danh sách phòng và trạng thái ghế trước khi dựng sơ đồ ghế chi tiết."
      columns={[
        { key: "room", label: "Phòng" },
        { key: "cinema", label: "Cụm rạp" },
        { key: "format", label: "Định dạng" },
        { key: "seats", label: "Số ghế" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          room: "IMAX 01",
          cinema: "CineX Vinh Center",
          format: "IMAX",
          seats: "168",
          status: "Đang hoạt động",
        },
        {
          room: "Dolby 02",
          cinema: "CineX Vinh Center",
          format: "Dolby 7.1",
          seats: "108",
          status: "Đang hoạt động",
        },
        {
          room: "Phòng 03",
          cinema: "CineX Lê Lợi",
          format: "2D",
          seats: "112",
          status: "Đang hoạt động",
        },
        {
          room: "Phòng 04",
          cinema: "CineX Quang Trung",
          format: "3D",
          seats: "120",
          status: "Bảo trì",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Quản lý cấu hình phòng chiếu theo từng cụm rạp.",
        "Thiết lập sơ đồ ghế, loại ghế và khu vực ghế.",
        "Cập nhật trạng thái ghế: khả dụng, đã đặt, bảo trì, khóa.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Dựng sơ đồ ghế trực quan",
        "Thêm form tạo phòng chiếu",
        "Thêm thao tác khóa/mở ghế",
        "Liên kết phòng với lịch chiếu",
      ]}
    />
  );
}
