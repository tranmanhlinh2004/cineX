import { prisma } from "./client";

const reviewPlans = [
  {
    email: "minhanh@example.com",
    movieSlug: "dune-part-two",
    rating: 5,
    comment: "Hình ảnh và âm thanh rất đáng xem ở phòng premium.",
  },
  {
    email: "hoangnam@example.com",
    movieSlug: "lat-mat-8",
    rating: 4,
    comment: "Phim Việt dễ xem, nhiều khoảnh khắc cảm xúc.",
  },
  {
    email: "thuha@example.com",
    movieSlug: "mai",
    rating: 5,
    comment: "Diễn xuất tốt, đặt ghế và thanh toán nhanh.",
  },
  {
    email: "giabao@example.com",
    movieSlug: "exhuma",
    rating: 4,
    comment: "Không khí căng thẳng, phù hợp xem suất tối.",
  },
  {
    email: "minhanh@example.com",
    movieSlug: "suzume",
    rating: 5,
    comment: "Anime đẹp, âm nhạc và màu sắc rất cuốn.",
  },
  {
    email: "hoangnam@example.com",
    movieSlug: "oppenheimer",
    rating: 5,
    comment: "Nội dung nặng nhưng rất đáng trải nghiệm trên màn lớn.",
  },
  {
    email: "thuha@example.com",
    movieSlug: "godzilla-minus-one",
    rating: 4,
    comment: "Phần quái vật ấn tượng, nhịp phim chắc.",
  },
  {
    email: "giabao@example.com",
    movieSlug: "dragon-ball-super-broly",
    rating: 5,
    comment: "Trận đánh đã mắt, phù hợp fan anime hành động.",
  },
] as const;

export async function seedReviews() {
  let seededReviews = 0;

  for (const plan of reviewPlans) {
    const user = await prisma.user.findUnique({
      where: { email: plan.email },
    });
    const movie = await prisma.movie.findUnique({
      where: { slug: plan.movieSlug },
    });

    if (!user || !movie) {
      continue;
    }

    await prisma.review.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: movie.id,
        },
      },
      update: {
        rating: plan.rating,
        comment: plan.comment,
        isHidden: false,
      },
      create: {
        userId: user.id,
        movieId: movie.id,
        rating: plan.rating,
        comment: plan.comment,
        isHidden: false,
      },
    });

    seededReviews += 1;
  }

  console.log(`Seed reviews thành công (${seededReviews} đánh giá)`);
}
