import { prisma } from "./client";

const reviewPlans = [
  {
    email: "minhanh@example.com",
    movieSlug: "dune-part-two",
    rating: 5,
    comment: "Hinh anh va am thanh rat dang xem o phong premium.",
  },
  {
    email: "hoangnam@example.com",
    movieSlug: "lat-mat-8",
    rating: 4,
    comment: "Phim Viet de xem, nhieu khoanh khac cam xuc.",
  },
  {
    email: "thuha@example.com",
    movieSlug: "mai",
    rating: 5,
    comment: "Dien xuat tot, dat ghe va thanh toan nhanh.",
  },
  {
    email: "giabao@example.com",
    movieSlug: "exhuma",
    rating: 4,
    comment: "Khong khi cang thang, phu hop xem suat toi.",
  },
  {
    email: "minhanh@example.com",
    movieSlug: "suzume",
    rating: 5,
    comment: "Anime dep, am nhac va mau sac rat cuon.",
  },
  {
    email: "hoangnam@example.com",
    movieSlug: "oppenheimer",
    rating: 5,
    comment: "Noi dung nang nhung rat dang trai nghiem tren man lon.",
  },
  {
    email: "thuha@example.com",
    movieSlug: "godzilla-minus-one",
    rating: 4,
    comment: "Phan quai vat an tuong, nhip phim chac.",
  },
  {
    email: "giabao@example.com",
    movieSlug: "dragon-ball-super-broly",
    rating: 5,
    comment: "Tran danh da mat, phu hop fan anime hanh dong.",
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

  console.log(`Seed reviews thanh cong (${seededReviews} danh gia)`);
}
