import { prisma } from "./client";

export async function seedRoles() {
  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Quản trị viên hệ thống",
    },
  });

  await prisma.role.upsert({
    where: { name: "MANAGER" },
    update: {},
    create: {
      name: "MANAGER",
      description: "Quản lý rạp phim",
    },
  });

  await prisma.role.upsert({
    where: { name: "STAFF" },
    update: {},
    create: {
      name: "STAFF",
      description: "Nhân viên rạp phim",
    },
  });

  await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: {
      name: "CUSTOMER",
      description: "Khách hàng",
    },
  });

  console.log("Seed roles thành công");
}
