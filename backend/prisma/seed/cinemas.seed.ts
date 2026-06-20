import { prisma } from "./client";

export async function seedCinemas() {
  const cinemas = [
    {
      name: "CineX Vinh Center",
      slug: "cinex-vinh",
      address: "182 Lê Duẩn, TP. Vinh, Nghệ An",
      city: "Vinh",
      district: "Trung Đô",
      ward: "Bến Thủy",
      phone: "0238000001",
      email: "vinh@cinex.com",
      description: "Rạp trung tâm của CineX tại TP. Vinh.",
      imageUrl: "/cinemas/cinex-vinh-center.jpg",
    },
    {
      name: "CineX Lê Lợi",
      slug: "cinex-le-loi",
      address: "18 Lê Lợi, TP. Vinh, Nghệ An",
      city: "Vinh",
      district: "Lê Lợi",
      ward: "Lê Lợi",
      phone: "0238000002",
      email: "leloi@cinex.com",
      description: "Rạp gần khu phố đi bộ, phù hợp các suất tối và cuối tuần.",
      imageUrl: "/cinemas/cinex-le-loi.jpg",
    },
    {
      name: "CineX Quang Trung",
      slug: "cinex-quang-trung",
      address: "72 Quang Trung, TP. Vinh, Nghe An",
      city: "Vinh",
      district: "Quang Trung",
      ward: "Quang Trung",
      phone: "0238000003",
      email: "quangtrung@cinex.com",
      description: "Cụm rạp gia đình với phòng chiếu 2D, 3D và phòng premium.",
      imageUrl: "/cinemas/cinex-quang-trung.jpg",
    },
    {
      name: "CineX Hà Nội",
      slug: "cinex-ha-noi",
      address: "Cầu Giấy, Hà Nội",
      city: "Hà Nội",
      district: "Cầu Giấy",
      ward: "Dịch Vọng Hậu",
      phone: "0240000001",
      email: "hanoi@cinex.com",
      description: "Rạp CineX tại Hà Nội cho dữ liệu mở rộng hệ thống.",
      imageUrl: "/cinemas/cinex-ha-noi.jpg",
    },
  ];

  for (const cinema of cinemas) {
    await prisma.cinema.upsert({
      where: { slug: cinema.slug },
      update: cinema,
      create: cinema,
    });
  }

  console.log("Seed cinemas thanh cong");
}
