import bcrypt from "bcrypt";
import { prisma } from "./client";

const userPlans = [
  {
    roleName: "ADMIN",
    fullName: "Quản trị viên",
    email: "admin@gmail.com",
    phone: "0123456789",
    password: "quantri123",
    avatar: "/avatars/admin.jpg",
  },
  {
    roleName: "MANAGER",
    fullName: "Quản lý rạp CineX",
    email: "manager@gmail.com",
    phone: "0911222333",
    password: "quanly123",
    avatar: "/avatars/manager.jpg",
  },
  {
    roleName: "CASHIER",
    fullName: "Nhân viên thu ngân CineX",
    email: "cashier@gmail.com",
    phone: "0987654321",
    password: "nhanvien123",
    avatar: "/avatars/cashier.jpg",
  },
  {
    roleName: "MOVIE_MANAGER",
    fullName: "Nhân viên quản lý phim CineX",
    email: "movie.manager@gmail.com",
    phone: "0987000001",
    password: "nhanvien123",
    avatar: "/avatars/movie-manager.jpg",
  },
  {
    roleName: "ACCOUNTANT",
    fullName: "Nhân viên kế toán CineX",
    email: "accountant@gmail.com",
    phone: "0987000002",
    password: "nhanvien123",
    avatar: "/avatars/accountant.jpg",
  },
  {
    roleName: "CUSTOMER_SUPPORT",
    fullName: "Nhân viên chăm sóc khách hàng CineX",
    email: "support@gmail.com",
    phone: "0987000003",
    password: "nhanvien123",
    avatar: "/avatars/support.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Nguyễn Minh Anh",
    email: "minhanh@example.com",
    phone: "0901000001",
    password: "khachhang123",
    avatar: "/avatars/customer-1.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Trần Hoàng Nam",
    email: "hoangnam@example.com",
    phone: "0901000002",
    password: "khachhang123",
    avatar: "/avatars/customer-2.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Lê Thu Hà",
    email: "thuha@example.com",
    phone: "0901000003",
    password: "khachhang123",
    avatar: "/avatars/customer-3.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Phạm Gia Bảo",
    email: "giabao@example.com",
    phone: "0901000004",
    password: "khachhang123",
    avatar: "/avatars/customer-4.jpg",
  },
] as const;

export async function seedUsers() {
  const roles = await prisma.role.findMany();
  const roleByName = new Map(roles.map((role) => [role.name, role.id]));

  for (const user of userPlans) {
    const roleId = roleByName.get(user.roleName);

    if (!roleId) {
      throw new Error(`Role ${user.roleName} does not exist`);
    }

    const password = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        roleId,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        isActive: true,
      },
      create: {
        roleId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        password,
        avatar: user.avatar,
        isActive: true,
      },
    });
  }

  console.log("Seed users thanh cong");
}
