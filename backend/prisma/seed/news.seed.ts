import { prisma } from "./client";

const newsItems = [
  {
    title: "CineX mo ban lich chieu thang 5",
    slug: "cinex-mo-ban-lich-chieu-thang-5",
    summary: "Nhieu suat chieu moi da san sang tai cac cum rap CineX Vinh.",
    content:
      "CineX cap nhat lich chieu moi cho cac phim dang hot trong thang 5. Khach hang co the dat ve truc tuyen, chon ghe va thanh toan qua nhieu phuong thuc.",
    thumbnail: "/movies/poster/now-showing/dune-part-two.jpg",
    authorName: "CineX Editorial",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-05T09:00:00.000+07:00"),
  },
  {
    title: "Huong dan dat ve va nhan QR ticket",
    slug: "huong-dan-dat-ve-va-nhan-qr-ticket",
    summary: "Cac buoc dat ve nhanh, chon ghe, thanh toan va su dung ve dien tu.",
    content:
      "Sau khi thanh toan thanh cong, ve dien tu va ma QR se duoc gan vao don dat ve. Khach hang chi can dua ma QR tai quay soat ve truoc gio chieu.",
    thumbnail: "/movies/poster/now-showing/mai.jpg",
    authorName: "CineX Support",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-06T10:30:00.000+07:00"),
  },
  {
    title: "Uu dai CINEX20 cho thanh vien moi",
    slug: "uu-dai-cinex20-cho-thanh-vien-moi",
    summary: "Giam 20% cho don dat ve dau tien cua thanh vien moi.",
    content:
      "Nhap ma CINEX20 tai buoc thanh toan de nhan uu dai cho don hang dau tien. Chuong trinh ap dung trong thoi gian gioi han va tuy theo so luong ma con lai.",
    thumbnail: "/movies/poster/coming-soon/avengers-secret-wars.jpg",
    authorName: "CineX Marketing",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-07T08:45:00.000+07:00"),
  },
  {
    title: "CineX Quang Trung nang cap phong premium",
    slug: "cinex-quang-trung-nang-cap-phong-premium",
    summary: "Phong premium moi co ghe VIP, am thanh tot hon va lich chieu toi uu.",
    content:
      "Cum rap CineX Quang Trung bo sung phong premium danh cho cac bom tan va suat chieu cuoi tuan. Du lieu phong va ghe da duoc cap nhat tren he thong dat ve.",
    thumbnail: "/movies/poster/now-showing/godzilla-minus-one.jpg",
    authorName: "CineX Operations",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-08T14:00:00.000+07:00"),
  },
];

export async function seedNews() {
  for (const news of newsItems) {
    await prisma.news.upsert({
      where: { slug: news.slug },
      update: news,
      create: news,
    });
  }

  console.log(`Seed news thanh cong (${newsItems.length} bai)`);
}
