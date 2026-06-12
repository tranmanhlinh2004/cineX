import { prisma } from "./client";

export async function seedCinemas() {
  const cinemas = [
    {
      name: "CineX Vinh Center",
      slug: "cinex-vinh",
      address: "182 Le Duan, TP. Vinh, Nghe An",
      city: "Vinh",
      district: "Trung Do",
      ward: "Ben Thuy",
      phone: "0238000001",
      email: "vinh@cinex.com",
      description: "Rap trung tam cua CineX tai TP. Vinh.",
      imageUrl: "/cinemas/cinex-vinh-center.jpg",
    },
    {
      name: "CineX Le Loi",
      slug: "cinex-le-loi",
      address: "18 Le Loi, TP. Vinh, Nghe An",
      city: "Vinh",
      district: "Le Loi",
      ward: "Le Loi",
      phone: "0238000002",
      email: "leloi@cinex.com",
      description: "Rap gan khu pho di bo, phu hop cac suat toi va cuoi tuan.",
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
      description: "Cum rap gia dinh voi phong chieu 2D, 3D va phong premium.",
      imageUrl: "/cinemas/cinex-quang-trung.jpg",
    },
    {
      name: "CineX Ha Noi",
      slug: "cinex-ha-noi",
      address: "Cau Giay, Ha Noi",
      city: "Ha Noi",
      district: "Cau Giay",
      ward: "Dich Vong Hau",
      phone: "0240000001",
      email: "hanoi@cinex.com",
      description: "Rap CineX tai Ha Noi cho du lieu mo rong he thong.",
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
