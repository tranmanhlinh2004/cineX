import AdminModulePage from "@/components/admin/AdminModulePage";
import { AlertTriangle, CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function AdminPermissionsPage() {
  return (
    <AdminModulePage
      eyebrow="3.4.2"
      title="Quản lý phân quyền"
      description="Khung quản lý vai trò, nhóm quyền và phạm vi truy cập của từng nhóm người dùng trong hệ thống quản trị."
      primaryAction="Thêm vai trò"
      searchPlaceholder="Tìm vai trò, mã quyền, nhóm người dùng..."
      stats={[
        {
          label: "Vai trò",
          value: "6",
          helper: "Theo mô hình RBAC",
          icon: ShieldCheck,
          tone: "bg-red-50 text-red-700",
        },
        {
          label: "Nhóm quyền",
          value: "42",
          helper: "Theo từng module quản trị",
          icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Tài khoản nội bộ",
          value: "38",
          helper: "Đang được gán quyền",
          icon: Users,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Quyền nhạy cảm",
          value: "9",
          helper: "Cần kiểm tra định kỳ",
          icon: AlertTriangle,
          tone: "bg-amber-50 text-amber-700",
        },
      ]}
      filters={[
        { label: "Tất cả module", options: ["Tài khoản", "Phim", "Rạp", "Doanh thu"] },
        { label: "Tất cả trạng thái", options: ["Đang hoạt động", "Tạm dừng", "Chờ rà soát"] },
      ]}
      tableTitle="Danh sách vai trò"
      tableDescription="Khung quyền mẫu để chuẩn bị màn hình phân quyền chi tiết."
      columns={[
        { key: "role", label: "Vai trò" },
        { key: "scope", label: "Phạm vi" },
        { key: "users", label: "Số tài khoản" },
        { key: "permissions", label: "Số quyền" },
        { key: "status", label: "Trạng thái" },
      ]}
      rows={[
        {
          role: "Super Admin",
          scope: "Toàn hệ thống",
          users: "2",
          permissions: "42",
          status: "Đang hoạt động",
        },
        {
          role: "Quản lý rạp",
          scope: "Cụm rạp được gán",
          users: "8",
          permissions: "24",
          status: "Đang hoạt động",
        },
        {
          role: "Nhân viên bán vé",
          scope: "Đặt vé, thanh toán, vé",
          users: "18",
          permissions: "12",
          status: "Đang hoạt động",
        },
        {
          role: "Kế toán",
          scope: "Doanh thu, thanh toán",
          users: "4",
          permissions: "10",
          status: "Chờ rà soát",
        },
      ]}
      sideTitle="Phạm vi chức năng"
      sideItems={[
        "Tạo vai trò và nhóm quyền theo module.",
        "Gán quyền xem, thêm, sửa, xóa, xuất báo cáo.",
        "Rà soát quyền nhạy cảm như doanh thu và phân quyền.",
      ]}
      checklistTitle="Việc cần dựng tiếp"
      checklist={[
        "Thiết kế ma trận quyền theo module",
        "Thêm form tạo vai trò",
        "Thêm màn gán tài khoản vào vai trò",
        "Ghi log thay đổi phân quyền",
      ]}
    />
  );
}
