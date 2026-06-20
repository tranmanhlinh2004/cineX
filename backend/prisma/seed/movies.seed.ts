import { prisma } from "./client";

const genres = {
  action: "H\u00e0nh \u0111\u1ed9ng",
  romance: "T\u00ecnh c\u1ea3m",
  horror: "Kinh d\u1ecb",
  comedy: "H\u00e0i",
  animation: "Ho\u1ea1t h\u00ecnh",
  adventure: "Phi\u00eau l\u01b0u",
  sciFi: "Khoa h\u1ecdc vi\u1ec5n t\u01b0\u1edfng",
  drama: "T\u00e2m l\u00fd",
  crime: "T\u1ed9i ph\u1ea1m",
  family: "Gia \u0111\u00ecnh",
  fantasy: "Gi\u1ea3 t\u01b0\u1edfng",
  history: "L\u1ecbch s\u1eed",
  mystery: "B\u00ed \u1ea9n",
  thriller: "Gi\u1eadt g\u00e2n",
  anime: "Anime",
} as const;

type MovieSeed = {
  title: string;
  slug: string;
  description: string;
  director: string;
  actors: string;
  duration: number;
  releaseDate: Date;
  language: string;
  country: string;
  ageLimit: string;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED";
  posterUrl?: string;
  bannerUrl?: string;
  genres: string[];
};

const folderByStatus = {
  COMING_SOON: "coming-soon",
  NOW_SHOWING: "now-showing",
  ENDED: "ended",
} as const;

const movies: MovieSeed[] = [
  {
    title: "Lật Mặt 8",
    slug: "lat-mat-8",
    description: "Câu chuyện gia đình và những ngã rẽ cảm xúc trên hành trình trưởng thành.",
    director: "Lý Hải",
    actors: "Quách Ngọc Tuyên, Huy Khánh",
    duration: 120,
    releaseDate: new Date("2026-04-30"),
    language: "Tiếng Việt",
    country: "Việt Nam",
    ageLimit: "T16",
    status: "NOW_SHOWING" as const,
    genres: [genres.action, genres.drama, genres.family],
  },
  {
    title: "Mai",
    slug: "mai",
    description: "Bộ phim tâm lý Việt Nam về những tổn thương và hy vọng trong đời sống đô thị.",
    director: "Trấn Thành",
    actors: "Phương Anh Đào, Tuấn Trần",
    duration: 131,
    releaseDate: new Date("2024-02-10"),
    language: "Tiếng Việt",
    country: "Việt Nam",
    ageLimit: "T18",
    status: "NOW_SHOWING" as const,
    genres: [genres.drama, genres.romance],
  },
  {
    title: "Dune: Part Two",
    slug: "dune-part-two",
    description: "Paul Atreides tiếp tục hành trình trên Arrakis và đối mặt với số phận của mình.",
    director: "Denis Villeneuve",
    actors: "Timothee Chalamet, Zendaya, Rebecca Ferguson",
    duration: 166,
    releaseDate: new Date("2024-03-01"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T13",
    status: "NOW_SHOWING" as const,
    genres: [genres.sciFi, genres.adventure, genres.drama],
  },
  {
    title: "Exhuma",
    slug: "exhuma",
    description: "Một vụ khai quật mộ cổ kéo theo những bí mật siêu nhiên đầy ám ảnh.",
    director: "Jang Jae-hyun",
    actors: "Choi Min-sik, Kim Go-eun, Yoo Hae-jin",
    duration: 134,
    releaseDate: new Date("2024-03-15"),
    language: "Tiếng Hàn",
    country: "Hàn Quốc",
    ageLimit: "T16",
    status: "NOW_SHOWING" as const,
    genres: [genres.horror, genres.mystery, genres.thriller],
  },
  {
    title: "Godzilla Minus One",
    slug: "godzilla-minus-one",
    description: "Nhật Bản hậu chiến đối mặt với thảm họa mới mang tên Godzilla.",
    director: "Takashi Yamazaki",
    actors: "Ryunosuke Kamiki, Minami Hamabe",
    duration: 125,
    releaseDate: new Date("2023-11-03"),
    language: "Tiếng Nhật",
    country: "Nhật Bản",
    ageLimit: "T13",
    status: "NOW_SHOWING" as const,
    genres: [genres.sciFi, genres.action, genres.drama],
  },
  {
    title: "Suzume",
    slug: "suzume",
    description: "Cô gái trẻ mở ra hành trình đóng những cánh cửa thảm họa khắp Nhật Bản.",
    director: "Makoto Shinkai",
    actors: "Nanoka Hara, Hokuto Matsumura",
    duration: 122,
    releaseDate: new Date("2022-11-11"),
    language: "Tiếng Nhật",
    country: "Nhật Bản",
    ageLimit: "T13",
    status: "NOW_SHOWING" as const,
    genres: [genres.anime, genres.adventure, genres.fantasy],
  },
  {
    title: "Avatar: The Way of Water",
    slug: "avatar-the-way-of-water",
    description: "Gia đình Sully tìm nơi an toàn mới giữa đại dương Pandora.",
    director: "James Cameron",
    actors: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
    duration: 192,
    releaseDate: new Date("2022-12-16"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T13",
    status: "NOW_SHOWING" as const,
    genres: [genres.sciFi, genres.adventure, genres.action],
  },
  {
    title: "Oppenheimer",
    slug: "oppenheimer",
    description: "Chân dung J. Robert Oppenheimer và dự án Manhattan làm thay đổi lịch sử.",
    director: "Christopher Nolan",
    actors: "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
    duration: 180,
    releaseDate: new Date("2023-07-21"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T16",
    status: "NOW_SHOWING" as const,
    genres: [genres.history, genres.drama],
  },
  {
    title: "Avengers: Secret Wars",
    slug: "avengers-secret-wars",
    description: "Sự kiện lớn của Marvel đưa nhiều dòng thời gian vào một cuộc chiến.",
    director: "Marvel Studios",
    actors: "Robert Downey Jr., Chris Hemsworth",
    duration: 150,
    releaseDate: new Date("2026-05-15"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T13",
    status: "COMING_SOON" as const,
    genres: [genres.action, genres.sciFi, genres.adventure],
  },
  {
    title: "Interstellar",
    slug: "interstellar",
    description: "Một nhóm phi hành gia vượt qua hố sâu không gian để tìm hy vọng mới.",
    director: "Christopher Nolan",
    actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    duration: 169,
    releaseDate: new Date("2014-11-07"),
    language: "Tiếng Anh",
    country: "Mỹ, Anh",
    ageLimit: "T13",
    status: "COMING_SOON" as const,
    genres: [genres.sciFi, genres.adventure, genres.drama],
  },
  {
    title: "Inside Out 2",
    slug: "inside-out-2",
    description: "Riley trưởng thành và những cảm xúc mới bắt đầu xuất hiện.",
    director: "Kelsey Mann",
    actors: "Amy Poehler, Maya Hawke",
    duration: 96,
    releaseDate: new Date("2024-06-14"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "P",
    status: "COMING_SOON" as const,
    genres: [genres.animation, genres.family, genres.comedy],
  },
  {
    title: "Demon Slayer: Infinity Castle",
    slug: "demon-slayer-infinity-castle",
    description: "Tanjiro và Sát Quỷ Đoàn tiến vào Vô Hạn Thành trong trận chiến quyết định.",
    director: "Haruo Sotozaki",
    actors: "Natsuki Hanae, Akari Kito, Hiro Shimono",
    duration: 165,
    releaseDate: new Date("2026-06-14"),
    language: "Tiếng Nhật",
    country: "Nhật Bản",
    ageLimit: "T16",
    status: "COMING_SOON" as const,
    genres: [genres.anime, genres.action, genres.fantasy],
  },
  {
    title: "Dragon Ball Super: Broly",
    slug: "dragon-ball-super-broly",
    description: "Goku và Vegeta đối đầu Broly, chiến binh Saiyan với sức mạnh bùng nổ.",
    director: "Tatsuya Nagamine",
    actors: "Masako Nozawa, Ryo Horikawa",
    duration: 101,
    releaseDate: new Date("2018-12-14"),
    language: "Tiếng Nhật",
    country: "Nhật Bản",
    ageLimit: "T13",
    status: "NOW_SHOWING" as const,
    genres: [genres.anime, genres.action, genres.adventure],
  },
  {
    title: "Avengers: Endgame",
    slug: "avengers-endgame",
    description: "Các siêu anh hùng còn lại tìm cách đảo ngược thảm họa của Thanos.",
    director: "Anthony Russo, Joe Russo",
    actors: "Robert Downey Jr., Chris Evans, Scarlett Johansson",
    duration: 181,
    releaseDate: new Date("2019-04-26"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T13",
    status: "ENDED" as const,
    genres: [genres.action, genres.adventure, genres.sciFi],
  },
  {
    title: "Inception",
    slug: "inception",
    description: "Một nhóm đạo chích xâm nhập giấc mơ để gieo một ý tưởng.",
    director: "Christopher Nolan",
    actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    duration: 148,
    releaseDate: new Date("2010-07-16"),
    language: "Tiếng Anh",
    country: "Mỹ, Anh",
    ageLimit: "T13",
    status: "ENDED" as const,
    genres: [genres.sciFi, genres.action, genres.thriller],
  },
  {
    title: "The Dark Knight",
    slug: "the-dark-knight",
    description: "Batman đối đầu Joker trong cuộc chiến căng thẳng tại Gotham.",
    director: "Christopher Nolan",
    actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
    duration: 152,
    releaseDate: new Date("2008-07-18"),
    language: "Tiếng Anh",
    country: "Mỹ",
    ageLimit: "T16",
    status: "ENDED" as const,
    genres: [genres.action, genres.crime, genres.drama],
  },
  {
    title: "Train to Busan",
    slug: "train-to-busan",
    description: "Chuyến tàu đến Busan biến thành cuộc chạy trốn sinh tử giữa đại dịch zombie.",
    director: "Yeon Sang-ho",
    actors: "Gong Yoo, Jung Yu-mi, Ma Dong-seok",
    duration: 118,
    releaseDate: new Date("2016-07-20"),
    language: "Tiếng Hàn",
    country: "Hàn Quốc",
    ageLimit: "T16",
    status: "ENDED" as const,
    genres: [genres.horror, genres.action, genres.thriller],
  },
  {
    title: "Your Name",
    slug: "your-name",
    description: "Hai người trẻ xa lạ bất ngờ hoán đổi cơ thể qua những giấc mơ.",
    director: "Makoto Shinkai",
    actors: "Ryunosuke Kamiki, Mone Kamishiraishi",
    duration: 107,
    releaseDate: new Date("2016-08-26"),
    language: "Tiếng Nhật",
    country: "Nhật Bản",
    ageLimit: "T13",
    status: "ENDED" as const,
    genres: [genres.anime, genres.romance, genres.fantasy],
  },
];

export async function seedMovies() {
  for (const movie of movies) {
    const { genres: movieGenres, posterUrl, bannerUrl, ...movieData } = movie;
    const folder = folderByStatus[movie.status];
    const assetUrls = {
      posterUrl: posterUrl ?? `/movies/poster/${folder}/${movie.slug}.jpg`,
      bannerUrl: bannerUrl ?? `/movies/banner/${folder}/${movie.slug}.jpg`,
    };

    const savedMovie = await prisma.movie.upsert({
      where: { slug: movie.slug },
      update: {
        ...movieData,
        ...assetUrls,
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${movie.title} official trailer`,
        )}`,
      },
      create: {
        ...movieData,
        ...assetUrls,
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${movie.title} official trailer`,
        )}`,
      },
    });

    const expectedGenreIds: number[] = [];

    for (const genreName of movieGenres) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: {
          name: genreName,
          description: null,
        },
      });

      expectedGenreIds.push(genre.id);

      await prisma.movieGenre.upsert({
        where: {
          movieId_genreId: {
            movieId: savedMovie.id,
            genreId: genre.id,
          },
        },
        update: {},
        create: {
          movieId: savedMovie.id,
          genreId: genre.id,
        },
      });
    }

    await prisma.movieGenre.deleteMany({
      where: {
        movieId: savedMovie.id,
        genreId: { notIn: expectedGenreIds },
      },
    });
  }

  console.log(`Seed movies thanh cong (${movies.length} phim)`);
}
