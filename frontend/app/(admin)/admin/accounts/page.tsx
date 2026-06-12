import AdminModulePage from "@/components/admin/AdminModulePage";
import { AlertTriangle, CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function AdminAccountsPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.1"
      title="Quản lý tài khoản"
      description="Khung quản trị tài khoản người dùng, nhân viên rạp và tài khoản quản trị hệ thống."
      primaryAction="Thêm tài khoản"
      searchPlaceholder="Tìm theo tên, email, số điện thoại..."
      stats={[
        {
          label: "Tổng tài khoản",
          value: "1.284",
          helper: "Bao gồm khách hàng và nhân viên",
          icon: Users,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Đang hoạt động",
          value: "1.196",
          helper: "93,1% tài khoản hợp lệ",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Quản trị viên",
          value: "12",
          helper: "Theo phân quyền nội bộ",
          icon: ShieldCheck,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Bị khóa",
          value: "8",
          helper: "Cần rà soát định kỳ",
          icon: AlertTriangle,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả vai trò", options: ["Khách hàng", "Nhân viên", "Quản trị viên"] },
        { label: "Tất cả trạng thái", options: ["Đang hoạt động", "Chờ xác minh", "Bị khóa"] },
      ]}
      tableTitle="Danh sách tài khoản"
      tableDescription="Dữ liệu mẫu để dựng luồng quản lý trước khi nối database."
      columns={[
        { key: "name", label: "Họ tên" },
        { key: "email", label: "Email" },
        { key: "role", label: "Vai trò" },
        { key: "lastLogin", label: "Đăng nhập gần nhất" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          name: "Nguyễn Minh Anh",
          email: "minhanh@cinex.vn",
          role: "Quản trị viên",
          lastLogin: "13/06/2026 08:15",
          status: "Đang hoạt động",
        },
        {
          name: "Trần Bảo Châu",
          email: "baochau@cinex.vn",
          role: "Nhân viên rạp",
          lastLogin: "13/06/2026 07:52",
          status: "Đang hoạt động",
        },
        {
          name: "Lê Đức Anh",
          email: "ducanh@example.com",
          role: "Khách hàng",
          lastLogin: "12/06/2026 21:18",
          status: "Chờ xác minh",
        },
        {
          name: "Phạm Thu Hà",
          email: "thuha@example.com",
          role: "Khách hàng",
          lastLogin: "10/06/2026 14:06",
          status: "Bị khóa",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Tạo, sửa, khóa và mở khóa tài khoản.",
        "Gán vai trò cho tài khoản nhân viên và quản trị viên.",
        "Theo dõi lịch sử đăng nhập và trạng thái xác minh.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Nối API danh sách tài khoản",
        "Thêm form tạo và sửa tài khoản",
        "Thêm xác nhận khóa tài khoản",
        "Ghi log thay đổi quyền truy cập",
      ]}
    />
  );
}
