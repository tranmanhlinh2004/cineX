import bcrypt from "bcrypt";
import { prisma } from "./client";

const userPlans = [
  {
    roleName: "ADMIN",
    fullName: "Quan tri vien",
    email: "admin@gmail.com",
    phone: "0123456789",
    password: "quantri123",
    avatar: "/avatars/admin.jpg",
  },
  {
    roleName: "MANAGER",
    fullName: "Quan ly rap CineX",
    email: "manager@gmail.com",
    phone: "0911222333",
    password: "quanly123",
    avatar: "/avatars/manager.jpg",
  },
  {
    roleName: "STAFF",
    fullName: "Nhan vien CineX",
    email: "staff@gmail.com",
    phone: "0987654321",
    password: "nhanvien123",
    avatar: "/avatars/staff.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Nguyen Minh Anh",
    email: "minhanh@example.com",
    phone: "0901000001",
    password: "khachhang123",
    avatar: "/avatars/customer-1.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Tran Hoang Nam",
    email: "hoangnam@example.com",
    phone: "0901000002",
    password: "khachhang123",
    avatar: "/avatars/customer-2.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Le Thu Ha",
    email: "thuha@example.com",
    phone: "0901000003",
    password: "khachhang123",
    avatar: "/avatars/customer-3.jpg",
  },
  {
    roleName: "CUSTOMER",
    fullName: "Pham Gia Bao",
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
