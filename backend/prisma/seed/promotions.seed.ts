import { prisma } from "./client";

const promotions = [
  {
    code: "CINEX20",
    name: "Giam 20% ve dau tien",
    description: "Ap dung cho don tu 100.000d, toi da 50.000d.",
    type: "PERCENT" as const,
    discountPercent: 20,
    discountAmount: null,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    quantity: 500,
    usedQuantity: 0,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-06-30T23:59:59.000+07:00"),
    isActive: true,
  },
  {
    code: "WEEKEND30",
    name: "Cuoi tuan giam 30.000d",
    description: "Giam truc tiep cho cac suat chieu thu bay va chu nhat.",
    type: "AMOUNT" as const,
    discountPercent: null,
    discountAmount: 30000,
    minOrderAmount: 150000,
    maxDiscount: null,
    quantity: 300,
    usedQuantity: 0,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-08-31T23:59:59.000+07:00"),
    isActive: true,
  },
  {
    code: "FAMILY50",
    name: "Combo gia dinh",
    description: "Giam 50.000d cho don tu 4 ve.",
    type: "AMOUNT" as const,
    discountPercent: null,
    discountAmount: 50000,
    minOrderAmount: 280000,
    maxDiscount: null,
    quantity: 200,
    usedQuantity: 0,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-07-31T23:59:59.000+07:00"),
    isActive: true,
  },
  {
    code: "STUDENT15",
    name: "Uu dai hoc sinh sinh vien",
    description: "Giam 15% cho tai khoan xac minh sinh vien.",
    type: "PERCENT" as const,
    discountPercent: 15,
    discountAmount: null,
    minOrderAmount: 70000,
    maxDiscount: 30000,
    quantity: 600,
    usedQuantity: 0,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-12-31T23:59:59.000+07:00"),
    isActive: true,
  },
];

export async function seedPromotions() {
  for (const promotion of promotions) {
    await prisma.promotion.upsert({
      where: { code: promotion.code },
      update: promotion,
      create: promotion,
    });
  }

  console.log(`Seed promotions thanh cong (${promotions.length} ma)`);
}
