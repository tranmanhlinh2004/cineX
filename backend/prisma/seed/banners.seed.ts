import { prisma } from "./client";

const banners = [
  {
    title: "Dune: Part Two dang chieu",
    imageUrl: "/movies/banner/now-showing/dune-part-two.jpg",
    linkUrl: "/movies/now-showing",
    position: "home-hero",
    sortOrder: 1,
    status: "ACTIVE" as const,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-06-15T23:59:59.000+07:00"),
  },
  {
    title: "Lat Mat 8 tai CineX",
    imageUrl: "/movies/banner/now-showing/lat-mat-8.jpg",
    linkUrl: "/ticket-booking?movie=lat-mat-8",
    position: "home-hero",
    sortOrder: 2,
    status: "ACTIVE" as const,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-06-30T23:59:59.000+07:00"),
  },
  {
    title: "Avengers Secret Wars sap ra mat",
    imageUrl: "/movies/banner/coming-soon/avengers-secret-wars.jpg",
    linkUrl: "/movies/coming-soon",
    position: "coming-soon",
    sortOrder: 1,
    status: "ACTIVE" as const,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-07-31T23:59:59.000+07:00"),
  },
  {
    title: "Uu dai thanh vien moi",
    imageUrl: "/movies/banner/now-showing/mai.jpg",
    linkUrl: "/register",
    position: "promotion",
    sortOrder: 1,
    status: "ACTIVE" as const,
    startDate: new Date("2026-05-01T00:00:00.000+07:00"),
    endDate: new Date("2026-12-31T23:59:59.000+07:00"),
  },
];

export async function seedBanners() {
  for (const banner of banners) {
    const existingBanner = await prisma.banner.findFirst({
      where: {
        title: banner.title,
        position: banner.position,
      },
    });

    if (existingBanner) {
      await prisma.banner.update({
        where: { id: existingBanner.id },
        data: banner,
      });
    } else {
      await prisma.banner.create({
        data: banner,
      });
    }
  }

  console.log(`Seed banners thanh cong (${banners.length} banner)`);
}
