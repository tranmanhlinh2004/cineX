import { prisma } from "./client";

const genres = [
  { name: "Hành động", description: "Phim hành động, chiến đấu, rượt đuổi" },
  { name: "Tình cảm", description: "Phim tình cảm, lãng mạn" },
  { name: "Kinh dị", description: "Phim kinh dị, giật gân" },
  { name: "Hài", description: "Phim hài hước, giải trí" },
  { name: "Hoạt hình", description: "Phim hoạt hình dành cho mọi lứa tuổi" },
  { name: "Phiêu lưu", description: "Phim khám phá, hành trình, mạo hiểm" },
  { name: "Khoa học viễn tưởng", description: "Phim giả tưởng, công nghệ, tương lai" },
  { name: "Tâm lý", description: "Phim tâm lý, đời sống, xã hội" },
  { name: "Tội phạm", description: "Phim điều tra, băng nhóm, thế giới ngầm" },
  { name: "Gia đình", description: "Phim phù hợp gia đình và thiếu nhi" },
  { name: "Giả tưởng", description: "Phim phép thuật, thần thoại, thế giới tưởng tượng" },
  { name: "Lịch sử", description: "Phim lấy bối cảnh hoặc nhân vật lịch sử" },
  { name: "Chiến tranh", description: "Phim chiến tranh, quân sự, chiến trường" },
  { name: "Bí ẩn", description: "Phim bí ẩn, phá án, điều tra" },
  { name: "Giật gân", description: "Phim hồi hộp, căng thẳng, truy đuổi" },
  { name: "Âm nhạc", description: "Phim âm nhạc, nghệ sĩ, biểu diễn" },
  { name: "Tài liệu", description: "Phim tài liệu, ghi chép hiện thực" },
  { name: "Viễn Tây", description: "Phim cao bồi, miền Tây" },
  { name: "Anime", description: "Phim hoạt hình Nhật Bản" },
  { name: "Thể thao", description: "Phim thể thao, thi đấu, truyền cảm hứng" },
];

export async function seedGenres() {
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { name: genre.name },
      update: { description: genre.description },
      create: genre,
    });
  }

  console.log("Seed genres thành công");
}
