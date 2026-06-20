import { prisma } from "./client";

const roleDefinitions = [
  {
    name: "ADMIN",
    description: "Quản trị viên - truy cập đầy đủ chức năng website quản trị",
  },
  {
    name: "MANAGER",
    description: "Quản lý - quản lý vận hành tổng quan hệ thống rạp phim",
  },
  {
    name: "CASHIER",
    description: "Nhân viên thu ngân - tạo đơn, xem đơn, hủy đơn, hoàn tiền và xuất hóa đơn",
  },
  {
    name: "MOVIE_MANAGER",
    description: "Nhân viên quản lý phim - quản lý phim, thể loại, lịch chiếu và suất chiếu",
  },
  {
    name: "ACCOUNTANT",
    description: "Nhân viên kế toán - xem giao dịch, thống kê và xuất báo cáo doanh thu",
  },
  {
    name: "CUSTOMER_SUPPORT",
    description: "Nhân viên chăm sóc khách hàng - phản hồi đánh giá và tin nhắn liên hệ",
  },
  {
    name: "CUSTOMER",
    description: "Khách hàng - truy cập đầy đủ chức năng website người dùng",
  },
] as const;

export async function seedRoles() {
  for (const role of roleDefinitions) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  const legacyStaffRole = await prisma.role.findUnique({
    where: { name: "STAFF" },
  });
  const cashierRole = await prisma.role.findUnique({
    where: { name: "CASHIER" },
  });

  if (legacyStaffRole && cashierRole) {
    await prisma.user.updateMany({
      where: { roleId: legacyStaffRole.id },
      data: { roleId: cashierRole.id },
    });
    await prisma.rolePermission.deleteMany({
      where: { roleId: legacyStaffRole.id },
    });
    await prisma.role.delete({
      where: { id: legacyStaffRole.id },
    });
  }

  console.log("Seed roles thành công");
}
