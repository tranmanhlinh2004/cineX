import { prisma } from "./client";

export async function seedSeatTypes() {
  await prisma.seatType.upsert({
    where: { name: "NORMAL" },
    update: {},
    create: {
      name: "NORMAL",
      description: "Ghế thường",
      priceExtra: 0,
    },
  });

  await prisma.seatType.upsert({
    where: { name: "VIP" },
    update: {},
    create: {
      name: "VIP",
      description: "Ghế VIP",
      priceExtra: 20000,
    },
  });

  await prisma.seatType.upsert({
    where: { name: "COUPLE" },
    update: {},
    create: {
      name: "COUPLE",
      description: "Ghế đôi",
      priceExtra: 40000,
    },
  });

  console.log("Seed seat types thành công");
}
