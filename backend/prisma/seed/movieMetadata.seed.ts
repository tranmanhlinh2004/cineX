import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "./client";

const genres = {
  action: "Hành động",
  romance: "Tình cảm",
  horror: "Kinh dị",
  comedy: "Hài",
  animation: "Hoạt hình",
  adventure: "Phiêu lưu",
  sciFi: "Khoa học viễn tưởng",
  drama: "Tâm lý",
  crime: "Tội phạm",
  family: "Gia đình",
  fantasy: "Giả tưởng",
  history: "Lịch sử",
  war: "Chiến tranh",
  mystery: "Bí ẩn",
  thriller: "Giật gân",
  music: "Âm nhạc",
  documentary: "Tài liệu",
  western: "Viễn Tây",
  anime: "Anime",
  sport: "Thể thao",
} as const;

const genreDescriptions = new Map<string, string>([
  [genres.action, "Phim hành động, chiến đấu, rượt đuổi"],
  [genres.romance, "Phim tình cảm, lãng mạn"],
  [genres.horror, "Phim kinh dị, giật gân"],
  [genres.comedy, "Phim hài hước, giải trí"],
  [genres.animation, "Phim hoạt hình dành cho mọi lứa tuổi"],
  [genres.adventure, "Phim khám phá, hành trình, mạo hiểm"],
  [genres.sciFi, "Phim giả tưởng, công nghệ, tương lai"],
  [genres.drama, "Phim tâm lý, đời sống, xã hội"],
  [genres.crime, "Phim điều tra, băng nhóm, thế giới ngầm"],
  [genres.family, "Phim phù hợp gia đình và thiếu nhi"],
  [genres.fantasy, "Phim phép thuật, thần thoại, thế giới tưởng tượng"],
  [genres.history, "Phim lấy bối cảnh hoặc nhân vật lịch sử"],
  [genres.war, "Phim chiến tranh, quân sự, chiến trường"],
  [genres.mystery, "Phim bí ẩn, phá án, điều tra"],
  [genres.thriller, "Phim hồi hộp, căng thẳng, truy đuổi"],
  [genres.music, "Phim âm nhạc, nghệ sĩ, biểu diễn"],
  [genres.documentary, "Phim tài liệu, ghi chép hiện thực"],
  [genres.western, "Phim cao bồi, miền Tây"],
  [genres.anime, "Phim hoạt hình Nhật Bản"],
  [genres.sport, "Phim thể thao, thi đấu, truyền cảm hứng"],
]);

const movieGenres = new Map<string, string[]>([
  ["3-idiots", [genres.comedy, genres.drama, genres.family]],
  ["a-taxi-driver", [genres.drama, genres.history, genres.action]],
  ["along-with-the-gods-the-two-worlds", [genres.fantasy, genres.action, genres.drama]],
  ["amelie", [genres.romance, genres.comedy, genres.drama]],
  ["anatomy-of-a-fall", [genres.drama, genres.crime, genres.mystery]],
  ["aquaman", [genres.action, genres.adventure, genres.fantasy]],
  ["avatar", [genres.sciFi, genres.adventure, genres.action]],
  ["avatar-the-way-of-water", [genres.sciFi, genres.adventure, genres.action]],
  ["avengers-age-of-ultron", [genres.action, genres.adventure, genres.sciFi]],
  ["avengers-endgame", [genres.action, genres.adventure, genres.sciFi]],
  ["avengers-infinity-war", [genres.action, genres.adventure, genres.sciFi]],
  ["avengers-secret-wars", [genres.action, genres.sciFi, genres.adventure]],
  ["baahubali-2-the-conclusion", [genres.action, genres.adventure, genres.drama]],
  ["bad-genius", [genres.thriller, genres.crime, genres.drama]],
  ["bajrangi-bhaijaan", [genres.drama, genres.family, genres.comedy]],
  ["barbie", [genres.comedy, genres.adventure, genres.fantasy]],
  ["beauty-and-the-beast-2017", [genres.family, genres.fantasy, genres.romance]],
  ["black-panther", [genres.action, genres.adventure, genres.sciFi]],
  ["captain-america-civil-war", [genres.action, genres.adventure, genres.sciFi]],
  ["cinema-paradiso", [genres.drama, genres.romance]],
  ["city-of-god", [genres.crime, genres.drama]],
  ["crouching-tiger-hidden-dragon", [genres.action, genres.adventure, genres.romance]],
  ["dad-im-sorry", [genres.comedy, genres.drama, genres.family]],
  ["dangal", [genres.drama, genres.sport, genres.family]],
  ["deadpool-and-wolverine", [genres.action, genres.comedy, genres.sciFi]],
  ["demon-slayer-mugen-train", [genres.anime, genres.action, genres.fantasy]],
  ["detective-chinatown-3", [genres.comedy, genres.mystery, genres.action]],
  ["dreamy-eyes", [genres.romance, genres.drama]],
  ["dune-part-two", [genres.sciFi, genres.adventure, genres.drama]],
  ["elite-squad", [genres.action, genres.crime, genres.thriller]],
  ["exhuma", [genres.horror, genres.mystery, genres.thriller]],
  ["extreme-job", [genres.comedy, genres.action, genres.crime]],
  ["face-off-6-the-ticket-of-destiny", [genres.action, genres.comedy, genres.drama]],
  ["face-off-7-one-wish", [genres.drama, genres.family]],
  ["frozen", [genres.animation, genres.family, genres.fantasy]],
  ["frozen-ii", [genres.animation, genres.family, genres.fantasy]],
  ["full-river-red", [genres.history, genres.mystery, genres.comedy]],
  ["furie", [genres.action, genres.crime, genres.thriller]],
  ["furious-7", [genres.action, genres.crime, genres.thriller]],
  ["godzilla-minus-one", [genres.sciFi, genres.action, genres.drama]],
  ["harry-potter-and-the-deathly-hallows-part-2", [genres.fantasy, genres.adventure]],
  ["hi-mom", [genres.comedy, genres.family, genres.drama]],
  ["howls-moving-castle", [genres.anime, genres.fantasy, genres.adventure]],
  ["inception", [genres.sciFi, genres.action, genres.thriller]],
  ["incendies", [genres.drama, genres.mystery, genres.war]],
  ["incredibles-2", [genres.animation, genres.family, genres.action]],
  ["inside-out-2", [genres.animation, genres.family, genres.comedy]],
  ["interstellar", [genres.sciFi, genres.adventure, genres.drama]],
  ["iron-man-3", [genres.action, genres.adventure, genres.sciFi]],
  ["jawan", [genres.action, genres.thriller, genres.drama]],
  ["joker", [genres.crime, genres.drama, genres.thriller]],
  ["jurassic-world", [genres.adventure, genres.sciFi, genres.action]],
  ["jurassic-world-fallen-kingdom", [genres.adventure, genres.sciFi, genres.action]],
  ["kalki-2898-ad", [genres.sciFi, genres.action, genres.fantasy]],
  ["kantara", [genres.action, genres.drama, genres.fantasy]],
  ["kgf-chapter-2", [genres.action, genres.crime, genres.drama]],
  ["kung-fu-hustle", [genres.comedy, genres.action, genres.fantasy]],
  ["lagaan", [genres.drama, genres.history, genres.music]],
  ["lat-mat-8", [genres.action, genres.drama, genres.family]],
  ["life-is-beautiful", [genres.comedy, genres.drama, genres.war]],
  ["mai", [genres.drama, genres.romance]],
  ["minions", [genres.animation, genres.family, genres.comedy]],
  ["ne-zha", [genres.animation, genres.fantasy, genres.adventure]],
  ["ne-zha-2", [genres.animation, genres.fantasy, genres.adventure]],
  ["ode-to-my-father", [genres.drama, genres.family, genres.history]],
  ["one-piece-film-red", [genres.anime, genres.action, genres.adventure]],
  ["oppenheimer", [genres.history, genres.drama]],
  ["pans-labyrinth", [genres.fantasy, genres.drama, genres.war]],
  ["parasite", [genres.drama, genres.thriller, genres.comedy]],
  ["pathaan", [genres.action, genres.thriller, genres.adventure]],
  ["portrait-of-a-lady-on-fire", [genres.drama, genres.romance, genres.history]],
  ["princess-mononoke", [genres.anime, genres.adventure, genres.fantasy]],
  ["pushpa-2-the-rule", [genres.action, genres.crime, genres.drama]],
  ["rrr", [genres.action, genres.drama, genres.history]],
  ["spider-man-no-way-home", [genres.action, genres.adventure, genres.sciFi]],
  ["spirited-away", [genres.anime, genres.fantasy, genres.adventure]],
  ["star-wars-the-force-awakens", [genres.sciFi, genres.adventure, genres.action]],
  ["star-wars-the-last-jedi", [genres.sciFi, genres.adventure, genres.action]],
  ["suzume", [genres.anime, genres.adventure, genres.fantasy]],
  ["the-admiral-roaring-currents", [genres.war, genres.history, genres.action]],
  ["the-battle-at-lake-changjin", [genres.war, genres.history, genres.action]],
  ["the-dark-knight", [genres.action, genres.crime, genres.drama]],
  ["the-fate-of-the-furious", [genres.action, genres.crime, genres.thriller]],
  ["the-first-slam-dunk", [genres.anime, genres.drama, genres.family]],
  ["the-house-of-no-man", [genres.comedy, genres.drama, genres.family]],
  ["the-intouchables", [genres.comedy, genres.drama]],
  ["the-kings-speech", [genres.history, genres.drama]],
  ["the-lion-king-2019", [genres.animation, genres.family, genres.adventure]],
  ["the-raid", [genres.action, genres.crime, genres.thriller]],
  ["the-roundup", [genres.action, genres.crime, genres.thriller]],
  ["the-secret-in-their-eyes", [genres.mystery, genres.crime, genres.drama]],
  ["the-super-mario-bros-movie", [genres.animation, genres.family, genres.adventure]],
  ["the-wandering-earth", [genres.sciFi, genres.action, genres.adventure]],
  ["the-wandering-earth-2", [genres.sciFi, genres.action, genres.adventure]],
  ["titanic", [genres.romance, genres.drama, genres.history]],
  ["top-gun-maverick", [genres.action, genres.drama]],
  ["train-to-busan", [genres.horror, genres.action, genres.thriller]],
  ["veteran", [genres.action, genres.crime, genres.comedy]],
  ["weathering-with-you", [genres.anime, genres.romance, genres.fantasy]],
  ["wolf-warrior-2", [genres.action, genres.war, genres.drama]],
  ["yellow-flowers-on-the-green-grass", [genres.drama, genres.family, genres.romance]],
  ["your-name", [genres.anime, genres.romance, genres.fantasy]],
]);

const folderByStatus = {
  COMING_SOON: "coming-soon",
  NOW_SHOWING: "now-showing",
  ENDED: "ended",
} as const;

function findMovieAssets(movie: { slug: string; status: keyof typeof folderByStatus }) {
  const statusEntries = Object.entries(folderByStatus) as Array<
    [keyof typeof folderByStatus, (typeof folderByStatus)[keyof typeof folderByStatus]]
  >;
  const orderedStatusEntries = [
    [movie.status, folderByStatus[movie.status]],
    ...statusEntries.filter(([status]) => status !== movie.status),
  ] as typeof statusEntries;

  for (const [status, folder] of orderedStatusEntries) {
    const posterPath = path.resolve(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "movies",
      "poster",
      folder,
      `${movie.slug}.jpg`,
    );

    if (existsSync(posterPath)) {
      const bannerPath = path.resolve(
        process.cwd(),
        "..",
        "frontend",
        "public",
        "movies",
        "banner",
        folder,
        `${movie.slug}.jpg`,
      );

      return {
        status,
        posterUrl: `/movies/poster/${folder}/${movie.slug}.jpg`,
        bannerUrl: existsSync(bannerPath)
          ? `/movies/banner/${folder}/${movie.slug}.jpg`
          : undefined,
      };
    }
  }

  return null;
}

export async function syncMovieMetadata() {
  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
  });

  for (const movie of movies) {
    const expectedGenres = movieGenres.get(movie.slug);

    if (expectedGenres) {
      const expectedGenreIds: number[] = [];

      for (const genreName of expectedGenres) {
        const genre = await prisma.genre.upsert({
          where: { name: genreName },
          update: { description: genreDescriptions.get(genreName) ?? null },
          create: {
            name: genreName,
            description: genreDescriptions.get(genreName) ?? null,
          },
        });

        expectedGenreIds.push(genre.id);

        await prisma.movieGenre.upsert({
          where: {
            movieId_genreId: {
              movieId: movie.id,
              genreId: genre.id,
            },
          },
          update: {},
          create: {
            movieId: movie.id,
            genreId: genre.id,
          },
        });
      }

      await prisma.movieGenre.deleteMany({
        where: {
          movieId: movie.id,
          genreId: { notIn: expectedGenreIds },
        },
      });
    }

    const assets = findMovieAssets(movie);

    if (!assets) {
      continue;
    }

    await prisma.movieImage.deleteMany({
      where: {
        movieId: movie.id,
        sortOrder: { not: 0 },
      },
    });

    const existingImage = await prisma.movieImage.findFirst({
      where: {
        movieId: movie.id,
        sortOrder: 0,
      },
    });

    if (existingImage) {
      await prisma.movieImage.update({
        where: { id: existingImage.id },
        data: {
          imageUrl: assets.posterUrl,
          altText: movie.title,
          sortOrder: 0,
        },
      });
    } else {
      await prisma.movieImage.create({
        data: {
          movieId: movie.id,
          imageUrl: assets.posterUrl,
          altText: movie.title,
          sortOrder: 0,
        },
      });
    }

    await prisma.movie.update({
      where: { id: movie.id },
      data: {
        posterUrl: assets.posterUrl,
        ...(assets.bannerUrl ? { bannerUrl: assets.bannerUrl } : {}),
        status: assets.status,
      },
    });
  }

  await prisma.genre.deleteMany({
    where: {
      name: { contains: "?" },
      movieGenres: { none: {} },
    },
  });

  console.log("Đồng bộ metadata phim thành công");
}

if (require.main === module) {
  syncMovieMetadata()
    .catch((error) => {
      console.error("Đồng bộ metadata phim thất bại:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
