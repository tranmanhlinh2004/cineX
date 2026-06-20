import { prisma } from "./client";

const newsItems = [
  {
    title: "CineX mở bán lịch chiếu tháng 5",
    slug: "cinex-mo-ban-lich-chieu-thang-5",
    summary: "Nhiều suất chiếu mới đã sẵn sàng tại các cụm rạp CineX Vinh.",
    content:
      "CineX cập nhật lịch chiếu mới cho các phim đang hot trong tháng 5. Khách hàng có thể đặt vé trực tuyến, chọn ghế và thanh toán qua nhiều phương thức.",
    thumbnail: "/movies/poster/now-showing/dune-part-two.jpg",
    authorName: "CineX Editorial",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-05T09:00:00.000+07:00"),
  },
  {
    title: "Hướng dẫn đặt vé và nhận QR ticket",
    slug: "huong-dan-dat-ve-va-nhan-qr-ticket",
    summary: "Các bước đặt vé nhanh, chọn ghế, thanh toán và sử dụng vé điện tử.",
    content:
      "Sau khi thanh toán thành công, vé điện tử và mã QR sẽ được gắn vào đơn đặt vé. Khách hàng chỉ cần đưa mã QR tại quầy soát vé trước giờ chiếu.",
    thumbnail: "/movies/poster/now-showing/mai.jpg",
    authorName: "CineX Support",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-06T10:30:00.000+07:00"),
  },
  {
    title: "Ưu đãi CINEX20 cho thành viên mới",
    slug: "uu-dai-cinex20-cho-thanh-vien-moi",
    summary: "Giảm 20% cho đơn đặt vé đầu tiên của thành viên mới.",
    content:
      "Nhập mã CINEX20 tại bước thanh toán để nhận ưu đãi cho đơn hàng đầu tiên. Chương trình áp dụng trong thời gian giới hạn và tùy theo số lượng mã còn lại.",
    thumbnail: "/movies/poster/coming-soon/avengers-secret-wars.jpg",
    authorName: "CineX Marketing",
    status: "PUBLISHED" as const,
    publishedAt: new Date("2026-05-07T08:45:00.000+07:00"),
  },
  {
    title: "CineX Quang Trung nâng cấp phòng premium",
    slug: "cinex-quang-trung-nang-cap-phong-premium",
    summary: "Phòng premium mới có ghế VIP, âm thanh tốt hơn và lịch chiếu tối ưu.",
    content:
      "Cụm rạp CineX Quang Trung bổ sung phòng premium dành cho các bom tấn và suất chiếu cuối tuần. Dữ liệu phòng và ghế đã được cập nhật trên hệ thống đặt vé.",
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
