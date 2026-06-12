import { prisma } from "./client";

const roomPlans = [
  { cinemaSlug: "cinex-vinh", name: "Ph\u00f2ng 1", totalRows: 8, totalColumns: 10 },
  { cinemaSlug: "cinex-vinh", name: "Ph\u00f2ng 2", totalRows: 10, totalColumns: 10 },
  { cinemaSlug: "cinex-vinh", name: "Ph\u00f2ng 3", totalRows: 8, totalColumns: 12 },
  { cinemaSlug: "cinex-le-loi", name: "Ph\u00f2ng 1", totalRows: 8, totalColumns: 10 },
  { cinemaSlug: "cinex-le-loi", name: "Ph\u00f2ng 2", totalRows: 7, totalColumns: 10 },
  { cinemaSlug: "cinex-quang-trung", name: "Ph\u00f2ng 1", totalRows: 9, totalColumns: 10 },
  { cinemaSlug: "cinex-quang-trung", name: "Ph\u00f2ng 2", totalRows: 8, totalColumns: 12 },
  { cinemaSlug: "cinex-ha-noi", name: "Ph\u00f2ng 1", totalRows: 9, totalColumns: 12 },
  { cinemaSlug: "cinex-ha-noi", name: "Ph\u00f2ng 2", totalRows: 8, totalColumns: 10 },
] as const;

export async function seedRooms() {
  for (const room of roomPlans) {
    const cinema = await prisma.cinema.findUnique({
      where: { slug: room.cinemaSlug },
    });

    if (!cinema) {
      throw new Error(`Cinema ${room.cinemaSlug} does not exist`);
    }

    await prisma.room.upsert({
      where: {
        cinemaId_name: {
          cinemaId: cinema.id,
          name: room.name,
        },
      },
      update: {
        totalRows: room.totalRows,
        totalColumns: room.totalColumns,
        totalSeats: room.totalRows * room.totalColumns,
        status: "ACTIVE",
      },
      create: {
        cinemaId: cinema.id,
        name: room.name,
        totalRows: room.totalRows,
        totalColumns: room.totalColumns,
        totalSeats: room.totalRows * room.totalColumns,
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed rooms thanh cong");
}
