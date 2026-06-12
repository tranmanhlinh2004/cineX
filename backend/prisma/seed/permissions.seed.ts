import { prisma } from "./client";

const permissions = [
  { name: "movie.view", description: "Xem danh sach phim" },
  { name: "movie.create", description: "Them phim" },
  { name: "movie.update", description: "Cap nhat phim" },
  { name: "movie.delete", description: "Xoa phim" },
  { name: "cinema.view", description: "Xem danh sach rap" },
  { name: "cinema.create", description: "Them rap" },
  { name: "cinema.update", description: "Cap nhat rap" },
  { name: "room.manage", description: "Quan ly phong chieu va ghe" },
  { name: "showtime.view", description: "Xem lich chieu" },
  { name: "showtime.manage", description: "Quan ly lich chieu" },
  { name: "booking.view", description: "Xem don dat ve" },
  { name: "booking.manage", description: "Quan ly dat ve" },
  { name: "promotion.manage", description: "Quan ly khuyen mai" },
  { name: "banner.manage", description: "Quan ly banner" },
  { name: "news.manage", description: "Quan ly tin tuc" },
  { name: "review.manage", description: "Quan ly danh gia" },
  { name: "user.view", description: "Xem nguoi dung" },
  { name: "user.manage", description: "Quan ly nguoi dung" },
  { name: "role.manage", description: "Quan ly vai tro va quyen" },
  { name: "report.view", description: "Xem bao cao thong ke" },
  { name: "audit.view", description: "Xem nhat ky he thong" },
];

export async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log(`Seed permissions thanh cong (${permissions.length} quyen)`);
}
