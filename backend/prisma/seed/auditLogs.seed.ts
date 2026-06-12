import { prisma } from "./client";

const auditPlans = [
  {
    userEmail: "admin@gmail.com",
    action: "SEED_DATABASE",
    tableName: "system",
    recordId: "seed-2026-05",
    oldValue: null,
    newValue: { status: "completed", source: "prisma-seed" },
    ipAddress: "127.0.0.1",
    userAgent: "CineX Seed",
  },
  {
    userEmail: "manager@gmail.com",
    action: "UPDATE_SHOWTIMES",
    tableName: "showtimes",
    recordId: "sample-schedule",
    oldValue: null,
    newValue: { days: 5, status: "ACTIVE" },
    ipAddress: "127.0.0.1",
    userAgent: "CineX Seed",
  },
] as const;

export async function seedAuditLogs() {
  let seededLogs = 0;

  for (const plan of auditPlans) {
    const user = await prisma.user.findUnique({
      where: { email: plan.userEmail },
    });
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: plan.action,
        tableName: plan.tableName,
        recordId: plan.recordId,
      },
    });
    const data = {
      userId: user?.id ?? null,
      action: plan.action,
      tableName: plan.tableName,
      recordId: plan.recordId,
      oldValue: plan.oldValue,
      newValue: plan.newValue,
      ipAddress: plan.ipAddress,
      userAgent: plan.userAgent,
    };

    if (existingLog) {
      await prisma.auditLog.update({
        where: { id: existingLog.id },
        data,
      });
    } else {
      await prisma.auditLog.create({
        data,
      });
    }

    seededLogs += 1;
  }

  console.log(`Seed audit logs thanh cong (${seededLogs} log)`);
}
