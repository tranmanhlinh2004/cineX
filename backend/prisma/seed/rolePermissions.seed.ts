import { prisma } from "./client";

const rolePermissionNames = {
  MANAGER: [
    "admin.access",
    "movie.view",
    "movie.create",
    "movie.update",
    "movie.delete",
    "genre.view",
    "genre.create",
    "genre.manage",
    "cinema.view",
    "cinema.create",
    "cinema.update",
    "room.manage",
    "showtime.view",
    "showtime.manage",
    "showtime.schedule.create",
    "showtime.session.create",
    "booking.view",
    "booking.manage",
    "booking.create",
    "booking.cancel",
    "booking.pay",
    "booking.refund",
    "refund.manage",
    "payment.view",
    "invoice.export",
    "promotion.manage",
    "banner.manage",
    "news.manage",
    "review.manage",
    "review.reply",
    "support.message.view",
    "support.message.reply",
    "report.view",
    "report.revenue.view",
    "report.revenue.export",
    "audit.view",
  ],
  CASHIER: [
    "admin.access",
    "movie.view",
    "cinema.view",
    "showtime.view",
    "booking.view",
    "booking.create",
    "booking.cancel",
    "booking.pay",
    "booking.refund",
    "refund.manage",
    "payment.view",
    "invoice.export",
  ],
  MOVIE_MANAGER: [
    "admin.access",
    "movie.view",
    "movie.create",
    "movie.update",
    "movie.delete",
    "genre.view",
    "genre.create",
    "genre.manage",
    "cinema.view",
    "room.manage",
    "showtime.view",
    "showtime.manage",
    "showtime.schedule.create",
    "showtime.session.create",
  ],
  ACCOUNTANT: [
    "admin.access",
    "booking.view",
    "payment.view",
    "invoice.export",
    "report.view",
    "report.revenue.view",
    "report.revenue.export",
  ],
  CUSTOMER_SUPPORT: [
    "admin.access",
    "user.view",
    "booking.view",
    "review.manage",
    "review.reply",
    "support.message.view",
    "support.message.reply",
  ],
  CUSTOMER: [
    "site.access",
    "account.manage",
    "movie.view",
    "genre.view",
    "cinema.view",
    "showtime.view",
    "booking.view",
    "booking.create",
    "booking.pay",
    "booking.refund.request",
    "review.create",
    "notification.view",
  ],
} as const;

async function syncRolePermissions(roleName: string, permissionNames: readonly string[]) {
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
  const permissionIds = permissions.map((permission) => permission.id);

  if (permissions.length !== permissionNames.length) {
    const foundPermissionNames = new Set(permissions.map((permission) => permission.name));
    const missingPermissionNames = permissionNames.filter(
      (permissionName) => !foundPermissionNames.has(permissionName),
    );

    throw new Error(
      `Missing permissions for role ${roleName}: ${missingPermissionNames.join(", ")}`,
    );
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId: role.id,
      permissionId: {
        notIn: permissionIds,
      },
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
  const allPermissions = await prisma.permission.findMany();

  await syncRolePermissions(
    "ADMIN",
    allPermissions.map((permission) => permission.name),
  );

  for (const [roleName, permissionNames] of Object.entries(rolePermissionNames)) {
    await syncRolePermissions(roleName, permissionNames);
  }

  console.log("Seed role permissions thanh cong");
}
