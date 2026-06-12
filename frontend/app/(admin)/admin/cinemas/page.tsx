import AdminModulePage from "@/components/admin/AdminModulePage";
import { Armchair, Building2, CheckCircle2, Ticket } from "lucide-react";

export default function AdminCinemasPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.4"
      title="Quản lý rạp"
      description="Khung quản lý cụm rạp, địa chỉ, số phòng chiếu, định dạng chiếu và trạng thái vận hành."
      primaryAction="Thêm cụm rạp"
      searchPlaceholder="Tìm cụm rạp, địa chỉ, người quản lý..."
      stats={[
        {
          label: "Tổng cụm rạp",
          value: "3",
          helper: "Đang cấu hình trong hệ thống",
          icon: Building2,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Tổng phòng",
          value: "18",
          helper: "Theo 3 cụm rạp",
          icon: Armchair,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Đang hoạt động",
          value: "2",
          helper: "Mở bán vé bình thường",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Vé đang bán",
          value: "42",
          helper: "Suất chiếu đã mở",
          icon: Ticket,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả trạng thái", options: ["Đang hoạt động", "Cần cập nhật", "Tạm dừng"] },
        { label: "Tất cả định dạng", options: ["2D", "3D", "IMAX", "Dolby 7.1"] },
      ]}
      tableTitle="Danh sách cụm rạp"
      tableDescription="Bảng CRUD quản lý rạp, chưa nối database."
      columns={[
        { key: "name", label: "Cụm rạp" },
        { key: "address", label: "Địa chỉ" },
        { key: "rooms", label: "Phòng chiếu" },
        { key: "formats", label: "Định dạng" },
        { key: "manager", label: "Quản lý" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          name: "CineX Vinh Center",
          address: "69 Hồ Tùng Mậu, TP. Vinh",
          rooms: "7",
          formats: "2D, 3D, IMAX, Dolby 7.1",
          manager: "Nguyễn Minh Anh",
          status: "Đang hoạt động",
        },
        {
          name: "CineX Lê Lợi",
          address: "18 Lê Lợi, TP. Vinh",
          rooms: "5",
          formats: "2D, Dolby 7.1",
          manager: "Trần Bảo Châu",
          status: "Đang hoạt động",
        },
        {
          name: "CineX Quang Trung",
          address: "72 Quang Trung, TP. Vinh",
          rooms: "6",
          formats: "2D, 3D, IMAX",
          manager: "Lê Thanh Phong",
          status: "Cần cập nhật",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Quản lý thông tin cụm rạp và người phụ trách.",
        "Cấu hình định dạng chiếu và trạng thái vận hành.",
        "Liên kết rạp với phòng chiếu, lịch chiếu và doanh thu.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Thêm form tạo và sửa cụm rạp",
        "Thêm quản lý địa chỉ chi tiết",
        "Liên kết cụm rạp với phòng chiếu",
        "Nối API trạng thái vận hành",
      ]}
    />
  );
}
