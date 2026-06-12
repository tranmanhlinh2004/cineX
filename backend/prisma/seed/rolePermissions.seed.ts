import { prisma } from "./client";

const rolePermissionNames = {
  MANAGER: [
    "movie.view",
    "movie.create",
    "movie.update",
    "cinema.view",
    "cinema.update",
    "room.manage",
    "showtime.view",
    "showtime.manage",
    "booking.view",
    "booking.manage",
    "promotion.manage",
    "banner.manage",
    "news.manage",
    "review.manage",
    "report.view",
  ],
  STAFF: [
    "movie.view",
    "cinema.view",
    "showtime.view",
    "booking.view",
    "booking.manage",
  ],
  CUSTOMER: ["movie.view", "cinema.view", "showtime.view", "booking.view"],
} as const;

async function grantPermissions(roleName: string, permissionNames: readonly string[]) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role ${roleName} does not exist`);
  }

  const permissions = await prisma.permission.findMany({
    where: {
      name: { in: [...permissionNames] },
    },
  });

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });
  }
}

export async function seedRolePermissions() {
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("Role ADMIN does not exist");
  }

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  for (const [roleName, permissionNames] of Object.entries(rolePermissionNames)) {
    await grantPermissions(roleName, permissionNames);
  }

  console.log("Seed role permissions thanh cong");
}
