import "dotenv/config";
import bcrypt from "bcrypt";
import {
  BookingStatus,
  HoldStatus,
  PrismaClient,
  ShowtimeStatus,
  type MovieStatus,
  type Prisma,
  type Promotion,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { URL } from "node:url";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const adminRoles = new Set(["ADMIN", "MANAGER", "STAFF", "ACCOUNTANT"]);
const homeSectionLimit = 9;
const catalogPageSize = 9;
const maxCatalogPageSize = 24;
const movieRecommendationLimit = 6;
const maxJsonBodyLength = 15_000_000;
const avatarMaxBytes = 10 * 1024 * 1024;
const avatarDataUrlPattern = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const movieImageMaxBytes = 10 * 1024 * 1024;
const movieImageDataUrlPattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const movieImageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pendingPaymentWindowMs = 5 * 60 * 1000;
const paymentMethods = ["CASH", "MOMO", "VNPAY", "ZALOPAY", "BANKING", "CARD"] as const;
const ticketBookingPaymentMethods = [
  "VNPAY",
  "BANKING",
] as const satisfies readonly (typeof paymentMethods)[number][];
const paymentMethodSet = new Set<string>(paymentMethods);
const ticketBookingPaymentMethodSet = new Set<string>(ticketBookingPaymentMethods);
const demoShowtimeRefreshDayCount = 5;
const showtimeChangeoverMinutes = 15;
const dayInMs = 24 * 60 * 60 * 1000;
const catalogDateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const recommendedMovieStatuses = ["NOW_SHOWING", "COMING_SOON"] satisfies MovieStatus[];

type JsonBody = Record<string, unknown>;

type UserWithRole = {
  id: number;
  roleId: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: {
    name: string;
  };
};

const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: vietnamTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateLabelFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});
const fullDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const timePartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: vietnamTimeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function setCorsHeaders(response: ServerResponse) {
  response.setHeader("Access-Control-Allow-Origin", corsOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(response: ServerResponse, statusCode: number, data: unknown) {
  setCorsHeaders(response);
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function readJson(request: IncomingMessage): Promise<JsonBody> {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");

      if (body.length > maxJsonBodyLength) {
        request.destroy();
        reject(new Error("Payload is too large"));
      }
    });

    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body) as JsonBody);
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function stringField(body: JsonBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function positiveIntegerParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) {
  const value = Number.parseInt(searchParams.get(key) ?? "", 10);

  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.min(value, max);
}

function serializeUser(user: UserWithRole) {
  return {
    id: user.id,
    roleId: user.roleId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatar,
    role: user.role.name,
  };
}

function getRedirectTo(roleName: string) {
  return adminRoles.has(roleName.toUpperCase()) ? "/admin" : "/";
}

function getStartOfToday() {
  return getVietnamDateRange(new Date()).start;
}

function getDateKey(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getVietnamDateRange(referenceDate: Date) {
  const dateKey = getDateKey(referenceDate);
  const start = new Date(`${dateKey}T00:00:00.000+07:00`);
  const end = new Date(start.getTime() + dayInMs);

  return {
    dateKey,
    start,
    end,
  };
}

function getVietnamDateRangeFromDateKey(dateKey: string) {
  if (!catalogDateKeyPattern.test(dateKey)) {
    return null;
  }

  const start = new Date(`${dateKey}T00:00:00.000+07:00`);

  if (!Number.isFinite(start.getTime()) || getDateKey(start) !== dateKey) {
    return null;
  }

  return {
    dateKey,
    start,
    end: new Date(start.getTime() + dayInMs),
  };
}

function getCatalogDateRange(searchParams: URLSearchParams) {
  const dateKey = searchParams.get("date")?.trim();

  return dateKey ? getVietnamDateRangeFromDateKey(dateKey) : null;
}

function getRelativeDateKey(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return getDateKey(date);
}

function getVietnamTimeParts(date: Date) {
  const parts = timePartsFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    hour: values.hour ?? "00",
    minute: values.minute ?? "00",
    second: values.second ?? "00",
  };
}

function makeVietnamDateTime(dateKey: string, date: Date) {
  const time = getVietnamTimeParts(date);

  return new Date(`${dateKey}T${time.hour}:${time.minute}:${time.second}.000+07:00`);
}

function getMovieStatusLabel(status: string) {
  switch (status) {
    case "NOW_SHOWING":
      return "Đang chiếu";
    case "COMING_SOON":
      return "Sắp chiếu";
    case "ENDED":
      return "Ngừng chiếu";
    default:
      return status;
  }
}

function getMovieStatusRank(status: string) {
  switch (status) {
    case "NOW_SHOWING":
      return 0;
    case "COMING_SOON":
      return 1;
    case "ENDED":
      return 2;
    default:
      return 3;
  }
}

function formatMovieRating(reviews: Array<{ rating: number }>) {
  if (reviews.length === 0) {
    return "0.0";
  }

  const averageFivePointRating =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return Math.min(10, averageFivePointRating * 2).toFixed(1);
}

function formatNullableDate(date: Date | null) {
  return date ? fullDateFormatter.format(date) : undefined;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value).replace(/\s/g, "");
}

function getMovieInclude(
  now: Date,
  options: { showtimeStartTime?: Prisma.ShowtimeWhereInput["startTime"] } = {},
) {
  const showtimeStartTime = options.showtimeStartTime ?? { gte: now };

  return {
    movieGenres: {
      include: {
        genre: true,
      },
    },
    movieImages: {
      orderBy: {
        sortOrder: "asc" as const,
      },
    },
    reviews: {
      where: {
        isHidden: false,
      },
      orderBy: {
        createdAt: "desc" as const,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    },
    showtimes: {
      where: {
        status: ShowtimeStatus.ACTIVE,
        startTime: showtimeStartTime,
      },
      orderBy: {
        startTime: "asc" as const,
      },
      include: {
        room: {
          include: {
            cinema: true,
          },
        },
        bookingDetails: {
          where: {
            booking: {
              status: {
                in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
              },
            },
          },
          select: {
            seatId: true,
          },
        },
        seatHolds: {
          where: {
            status: HoldStatus.HOLDING,
            expiresAt: {
              gt: now,
            },
          },
          select: {
            seatId: true,
          },
        },
      },
    },
  } satisfies Prisma.MovieInclude;
}

async function fetchHomeMovieRecords(
  now: Date,
  options: {
    status?: MovieStatus;
    where?: Prisma.MovieWhereInput;
    limit?: number;
    offset?: number;
    showtimeStartTime?: Prisma.ShowtimeWhereInput["startTime"];
  } = {},
) {
  const shouldOrderByLatest =
    options.limit !== undefined || options.offset !== undefined;
  const whereFilters: Prisma.MovieWhereInput[] = [];

  if (options.where) {
    whereFilters.push(options.where);
  }

  if (options.status) {
    whereFilters.push({ status: options.status });
  }

  const where =
    whereFilters.length === 0
      ? undefined
      : whereFilters.length === 1
        ? whereFilters[0]
        : { AND: whereFilters };

  return prisma.movie.findMany({
    where,
    orderBy: shouldOrderByLatest
      ? [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }]
      : undefined,
    skip: options.offset,
    take: options.limit,
    include: getMovieInclude(now, {
      showtimeStartTime: options.showtimeStartTime,
    }),
  });
}

async function fetchMovieRecordById(movieId: number, now: Date) {
  return prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: getMovieInclude(now),
  });
}

type HomeMovieRecord = Awaited<ReturnType<typeof fetchHomeMovieRecords>>[number];
type HomeShowtimeRecord = HomeMovieRecord["showtimes"][number];

function serializeHomeShowtime(movie: HomeMovieRecord, showtime: HomeShowtimeRecord) {
  const reservedSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    reservedSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    reservedSeatIds.add(seatHold.seatId);
  }

  const totalSeats = showtime.room.totalSeats;
  const availableSeats = Math.max(totalSeats - reservedSeatIds.size, 0);
  const basePrice = Number(showtime.basePrice);
  const date = getDateKey(showtime.startTime);

  return {
    id: showtime.id,
    date,
    startTime: showtime.startTime.toISOString(),
    endTime: showtime.endTime.toISOString(),
    time: timeFormatter.format(showtime.startTime),
    room: {
      id: showtime.room.id,
      name: showtime.room.name,
      totalSeats,
    },
    cinema: {
      id: showtime.room.cinema.id,
      slug: showtime.room.cinema.slug,
      name: showtime.room.cinema.name,
      address: showtime.room.cinema.address,
      city: showtime.room.cinema.city,
      district: showtime.room.cinema.district,
      ward: showtime.room.cinema.ward,
      phone: showtime.room.cinema.phone,
      email: showtime.room.cinema.email,
      imageUrl: showtime.room.cinema.imageUrl,
    },
    movieId: movie.id,
    movieSlug: movie.slug,
    movie: movie.title,
    movieLanguage: movie.language,
    movieAgeLimit: movie.ageLimit,
    basePrice,
    price: formatCurrency(basePrice),
    availableSeats,
    totalSeats,
    status: showtime.status,
    createdAt: showtime.createdAt.toISOString(),
    updatedAt: showtime.updatedAt.toISOString(),
  };
}

function serializeHomeMovie(movie: HomeMovieRecord) {
  const genres = movie.movieGenres.map((movieGenre) => movieGenre.genre.name);
  const image = movie.posterUrl ?? movie.movieImages[0]?.imageUrl ?? "/movies/demo.png";
  const bannerImage = movie.bannerUrl ?? image;
  const showtimeDetails = movie.showtimes.map((showtime) =>
    serializeHomeShowtime(movie, showtime),
  );

  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    description: movie.description ?? "",
    director: movie.director,
    actors: movie.actors,
    durationMinutes: movie.duration,
    duration: `${movie.duration} phút`,
    releaseDate: formatNullableDate(movie.releaseDate),
    releaseDateIso: movie.releaseDate?.toISOString() ?? null,
    endDate: formatNullableDate(movie.endDate),
    endDateIso: movie.endDate?.toISOString() ?? null,
    language: movie.language ?? "Đang cập nhật",
    country: movie.country,
    ageRating: movie.ageLimit ?? "P",
    trailerUrl: movie.trailerUrl,
    posterUrl: movie.posterUrl,
    bannerUrl: movie.bannerUrl,
    image,
    bannerImage,
    statusCode: movie.status,
    status: getMovieStatusLabel(movie.status),
    rating: formatMovieRating(movie.reviews),
    reviewCount: movie.reviews.length,
    reviews: movie.reviews.map((review) => ({
      id: review.id,
      userId: review.user.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      userName: review.user.fullName,
    })),
    genres,
    images: movie.movieImages.map((imageItem) => ({
      id: imageItem.id,
      imageUrl: imageItem.imageUrl,
      altText: imageItem.altText,
      sortOrder: imageItem.sortOrder,
    })),
    showtimes: showtimeDetails.map((showtime) => showtime.time),
    showtimeDetails,
    createdAt: movie.createdAt.toISOString(),
    updatedAt: movie.updatedAt.toISOString(),
  };
}

type HomeMovie = ReturnType<typeof serializeHomeMovie>;
type HomeShowtime = HomeMovie["showtimeDetails"][number];

function filterNonOverlappingHomeShowtimes(showtimes: HomeShowtime[]) {
  const latestEndByRoomId = new Map<number, number>();

  return [...showtimes]
    .sort(
      (leftShowtime, rightShowtime) =>
        leftShowtime.room.id - rightShowtime.room.id ||
        new Date(leftShowtime.startTime).getTime() - new Date(rightShowtime.startTime).getTime() ||
        leftShowtime.id - rightShowtime.id,
    )
    .filter((showtime) => {
      const latestEnd = latestEndByRoomId.get(showtime.room.id) ?? Number.NEGATIVE_INFINITY;
      const startTime = new Date(showtime.startTime).getTime();

      if (startTime < latestEnd) {
        return false;
      }

      latestEndByRoomId.set(showtime.room.id, new Date(showtime.endTime).getTime());
      return true;
    })
    .sort(
      (leftShowtime, rightShowtime) =>
        new Date(leftShowtime.startTime).getTime() - new Date(rightShowtime.startTime).getTime() ||
        leftShowtime.id - rightShowtime.id,
    );
}

function filterHomeMovieShowtimesForDisplay(movies: HomeMovie[]) {
  const visibleShowtimeIds = new Set(
    filterNonOverlappingHomeShowtimes(movies.flatMap((movie) => movie.showtimeDetails)).map(
      (showtime) => showtime.id,
    ),
  );

  return movies.map((movie) => {
    const showtimeDetails = movie.showtimeDetails.filter((showtime) =>
      visibleShowtimeIds.has(showtime.id),
    );

    return {
      ...movie,
      showtimes: showtimeDetails.map((showtime) => showtime.time),
      showtimeDetails,
    };
  });
}

function getMoviesShowingOnDate(movies: HomeMovie[], dateKey: string) {
  return movies
    .map((movie) => {
      const showtimeDetails = movie.showtimeDetails.filter(
        (showtime) => showtime.date === dateKey,
      );

      return {
        ...movie,
        statusCode: "NOW_SHOWING" as const,
        status: getMovieStatusLabel("NOW_SHOWING"),
        showtimes: showtimeDetails.map((showtime) => showtime.time),
        showtimeDetails,
      };
    })
    .filter((movie) => movie.showtimeDetails.length > 0);
}

function compareLatestMovieRecords(leftMovie: HomeMovie, rightMovie: HomeMovie) {
  const updatedCompare =
    new Date(rightMovie.updatedAt).getTime() - new Date(leftMovie.updatedAt).getTime();

  if (updatedCompare !== 0) {
    return updatedCompare;
  }

  const createdCompare =
    new Date(rightMovie.createdAt).getTime() - new Date(leftMovie.createdAt).getTime();

  if (createdCompare !== 0) {
    return createdCompare;
  }

  return rightMovie.id - leftMovie.id;
}

function buildScheduleDates(showtimes: HomeShowtime[]) {
  const todayKey = getRelativeDateKey(0);
  const tomorrowKey = getRelativeDateKey(1);
  const groupedDates = new Map<string, { firstShowtime: HomeShowtime; count: number }>();

  for (const showtime of showtimes) {
    const current = groupedDates.get(showtime.date);

    if (current) {
      current.count += 1;
      continue;
    }

    groupedDates.set(showtime.date, {
      firstShowtime: showtime,
      count: 1,
    });
  }

  return [...groupedDates.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .slice(0, 5)
    .map(([date, group]) => {
      const startTime = new Date(group.firstShowtime.startTime);
      const label =
        date === todayKey
          ? "Hôm nay"
          : date === tomorrowKey
            ? "Ngày mai"
            : dateLabelFormatter.format(startTime);

      return {
        value: date,
        label,
        hint: `${group.count} suất đang mở bán`,
      };
    });
}

async function loadHomePageData() {
  const now = new Date();
  const todayRange = getVietnamDateRange(now);
  const [movieRecords, cinemaRecords] = await Promise.all([
    fetchHomeMovieRecords(now, {
      showtimeStartTime: {
        gte: todayRange.start,
      },
    }),
    prisma.cinema.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        rooms: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  const movies = filterHomeMovieShowtimesForDisplay(movieRecords.map(serializeHomeMovie)).sort(
    (leftMovie, rightMovie) => {
      const statusCompare =
        getMovieStatusRank(leftMovie.statusCode) - getMovieStatusRank(rightMovie.statusCode);

      if (statusCompare !== 0) {
        return statusCompare;
      }

      const leftRelease = leftMovie.releaseDateIso
        ? new Date(leftMovie.releaseDateIso).getTime()
        : 0;
      const rightRelease = rightMovie.releaseDateIso
        ? new Date(rightMovie.releaseDateIso).getTime()
        : 0;

      return rightRelease - leftRelease;
    },
  );
  const moviesShowingToday = getMoviesShowingOnDate(movies, todayRange.dateKey).sort(
    compareLatestMovieRecords,
  );
  const moviesShowingTodayIds = new Set(moviesShowingToday.map((movie) => movie.id));
  const nowShowingMovies = moviesShowingToday.slice(0, homeSectionLimit);
  const comingSoonMovies = movies
    .filter(
      (movie) => movie.statusCode === "COMING_SOON" && !moviesShowingTodayIds.has(movie.id),
    )
    .sort(compareLatestMovieRecords)
    .slice(0, homeSectionLimit);
  const heroMovies = (nowShowingMovies.length > 0 ? nowShowingMovies : movies)
    .filter((movie) => movie.bannerImage)
    .slice(0, 5);
  const upcomingShowtimes = movies
    .flatMap((movie) => movie.showtimeDetails)
    .filter((showtime) => new Date(showtime.startTime).getTime() >= now.getTime())
    .sort(
      (leftShowtime, rightShowtime) =>
        new Date(leftShowtime.startTime).getTime() -
        new Date(rightShowtime.startTime).getTime(),
    );
  const scheduleDates = buildScheduleDates(upcomingShowtimes);
  const scheduleDateValues = new Set(scheduleDates.map((date) => date.value));
  const quickShowtimes = upcomingShowtimes.filter((showtime) =>
    scheduleDateValues.has(showtime.date),
  );

  return {
    generatedAt: now.toISOString(),
    movies,
    heroMovies,
    nowShowingMovies,
    comingSoonMovies,
    quickBooking: {
      dates: scheduleDates,
      cinemas: cinemaRecords.map((cinema) => ({
        value: cinema.slug,
        label: cinema.name,
        address: cinema.address,
        phone: cinema.phone,
        roomCount: cinema.rooms.length,
      })),
      showtimes: quickShowtimes,
    },
  };
}

async function loadNowShowingCatalogData(
  options: {
    page?: number;
    pageSize?: number;
    dateRange?: { dateKey: string; start: Date; end: Date };
  } = {},
) {
  const now = new Date();
  const todayRange = getVietnamDateRange(now);
  const catalogDateRange = options.dateRange ?? todayRange;
  const requestedPage = options.page ?? 1;
  const pageSize = options.pageSize ?? catalogPageSize;
  const where: Prisma.MovieWhereInput = {
    status: "NOW_SHOWING",
    AND: [
      {
        OR: [
          { releaseDate: null },
          {
            releaseDate: {
              lt: catalogDateRange.end,
            },
          },
        ],
      },
      {
        OR: [
          { endDate: null },
          {
            endDate: {
              gte: catalogDateRange.start,
            },
          },
        ],
      },
    ],
  };
  const totalItems = await prisma.movie.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  const movies = filterHomeMovieShowtimesForDisplay(
    (
      await fetchHomeMovieRecords(now, {
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        showtimeStartTime: {
          gte: catalogDateRange.start,
          lt: catalogDateRange.end,
        },
      })
    ).map(serializeHomeMovie),
  ).sort(compareLatestMovieRecords);

  return {
    generatedAt: now.toISOString(),
    movies,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
    },
  };
}

async function loadMovieCatalogData(
  status: MovieStatus,
  options: {
    page?: number;
    pageSize?: number;
    releaseDateRange?: { start: Date; end: Date };
  } = {},
) {
  const now = new Date();
  const requestedPage = options.page ?? 1;
  const pageSize = options.pageSize ?? catalogPageSize;
  const where: Prisma.MovieWhereInput = { status };

  if (options.releaseDateRange) {
    where.releaseDate = {
      gte: options.releaseDateRange.start,
      lt: options.releaseDateRange.end,
    };
  }

  const totalItems = await prisma.movie.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  const movies = filterHomeMovieShowtimesForDisplay(
    (await fetchHomeMovieRecords(now, {
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })).map(serializeHomeMovie),
  ).sort(compareLatestMovieRecords);

  return {
    generatedAt: now.toISOString(),
    movies,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
    },
  };
}

async function loadMovieDetailData(movieId: number) {
  const now = new Date();
  const movie = await fetchMovieRecordById(movieId, now);

  if (!movie) {
    return null;
  }

  return {
    generatedAt: now.toISOString(),
    movie: serializeHomeMovie(movie),
  };
}

type PreferredGenreScore = {
  id: number;
  name: string;
  bookingCount: number;
};

async function fetchUserPreferredGenres(userId: number) {
  await expireOverduePendingBookings(userId);

  const bookedDetails = await prisma.bookingDetail.findMany({
    where: {
      booking: {
        userId,
        status: BookingStatus.CONFIRMED,
      },
    },
    select: {
      showtime: {
        select: {
          movie: {
            select: {
              movieGenres: {
                select: {
                  genre: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const genreScores = new Map<number, PreferredGenreScore>();

  for (const detail of bookedDetails) {
    for (const movieGenre of detail.showtime.movie.movieGenres) {
      const genre = movieGenre.genre;
      const currentScore = genreScores.get(genre.id);

      if (currentScore) {
        currentScore.bookingCount += 1;
      } else {
        genreScores.set(genre.id, {
          id: genre.id,
          name: genre.name,
          bookingCount: 1,
        });
      }
    }
  }

  return [...genreScores.values()].sort(
    (leftGenre, rightGenre) =>
      rightGenre.bookingCount - leftGenre.bookingCount ||
      leftGenre.name.localeCompare(rightGenre.name, "vi"),
  );
}

function getMovieGenreScoreMap(movie: Pick<HomeMovieRecord, "movieGenres">) {
  return new Map(movie.movieGenres.map((movieGenre) => [movieGenre.genreId, 1]));
}

function getMovieGenreNames(movie: Pick<HomeMovieRecord, "movieGenres">) {
  return movie.movieGenres.map((movieGenre) => movieGenre.genre.name);
}

async function fetchRecommendedMovieRecords(
  now: Date,
  movieId: number,
  genreIds: number[],
) {
  if (genreIds.length === 0) {
    return [];
  }

  return fetchHomeMovieRecords(now, {
    where: {
      id: {
        not: movieId,
      },
      status: {
        in: recommendedMovieStatuses,
      },
      movieGenres: {
        some: {
          genreId: {
            in: genreIds,
          },
        },
      },
    },
  });
}

function getMovieRecommendationScore(
  movie: HomeMovieRecord,
  genreScores: Map<number, number>,
  currentMovieGenreIds: Set<number>,
) {
  let score = 0;

  for (const movieGenre of movie.movieGenres) {
    score += genreScores.get(movieGenre.genreId) ?? 0;

    if (currentMovieGenreIds.has(movieGenre.genreId)) {
      score += 0.25;
    }
  }

  if (movie.status === "NOW_SHOWING") {
    score += 0.5;
  }

  if (movie.showtimes.length > 0) {
    score += 0.25;
  }

  return score;
}

async function loadMovieRecommendationsData(request: IncomingMessage, movieId: number) {
  const now = new Date();
  const currentMovie = await fetchMovieRecordById(movieId, now);

  if (!currentMovie) {
    return null;
  }

  const user = await getAuthenticatedUser(request);
  const preferredGenres = user ? await fetchUserPreferredGenres(user.id) : [];
  const userGenreScores = new Map(
    preferredGenres.map((genre) => [genre.id, genre.bookingCount]),
  );
  const currentMovieGenreScores = getMovieGenreScoreMap(currentMovie);
  const currentMovieGenreIds = new Set(currentMovieGenreScores.keys());
  const hasPersonalizedSignal = userGenreScores.size > 0;
  let mode: "PERSONALIZED" | "SAME_GENRE" = hasPersonalizedSignal
    ? "PERSONALIZED"
    : "SAME_GENRE";
  let activeGenreScores = hasPersonalizedSignal ? userGenreScores : currentMovieGenreScores;
  let candidateMovies = await fetchRecommendedMovieRecords(
    now,
    movieId,
    [...activeGenreScores.keys()],
  );

  if (candidateMovies.length === 0 && hasPersonalizedSignal && currentMovieGenreScores.size > 0) {
    mode = "SAME_GENRE";
    activeGenreScores = currentMovieGenreScores;
    candidateMovies = await fetchRecommendedMovieRecords(
      now,
      movieId,
      [...activeGenreScores.keys()],
    );
  }

  const scoredMovies = candidateMovies
    .map((movie) => ({
      movie,
      score: getMovieRecommendationScore(movie, activeGenreScores, currentMovieGenreIds),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (leftItem, rightItem) =>
        rightItem.score - leftItem.score ||
        getMovieStatusRank(leftItem.movie.status) - getMovieStatusRank(rightItem.movie.status) ||
        rightItem.movie.updatedAt.getTime() - leftItem.movie.updatedAt.getTime() ||
        rightItem.movie.id - leftItem.movie.id,
    )
    .slice(0, movieRecommendationLimit);

  const recommendations = filterHomeMovieShowtimesForDisplay(
    scoredMovies.map((item) => serializeHomeMovie(item.movie)),
  );
  const personalizedTopGenres = preferredGenres
    .slice(0, 3)
    .map((genre) => genre.name);
  const fallbackTopGenres = getMovieGenreNames(currentMovie).slice(0, 3);

  return {
    generatedAt: now.toISOString(),
    movieId,
    basis: {
      type: mode,
      isPersonalized: mode === "PERSONALIZED",
      topGenre:
        mode === "PERSONALIZED"
          ? personalizedTopGenres[0] ?? null
          : fallbackTopGenres[0] ?? null,
      topGenres: mode === "PERSONALIZED" ? personalizedTopGenres : fallbackTopGenres,
      bookingGenres: preferredGenres.slice(0, 5),
    },
    recommendations,
  };
}

async function handleCreateMovieReview(
  request: IncomingMessage,
  response: ServerResponse,
  movieId: number,
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui long dang nhap de binh luan va danh gia phim." });
    return;
  }

  const body = await readJson(request);
  const rating = numberBodyField(body, "rating");
  const comment = stringField(body, "comment");

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    sendJson(response, 400, { message: "Danh gia phai nam trong khoang 1 den 5 sao." });
    return;
  }

  if (comment.length > 1000) {
    sendJson(response, 400, { message: "Binh luan khong duoc vuot qua 1000 ky tu." });
    return;
  }

  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    select: {
      id: true,
    },
  });

  if (!movie) {
    sendJson(response, 404, { message: "Khong tim thay phim." });
    return;
  }

  await prisma.review.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
    update: {
      rating,
      comment: comment || null,
      isHidden: false,
    },
    create: {
      userId: user.id,
      movieId,
      rating,
      comment: comment || null,
      isHidden: false,
    },
  });

  const movieDetailData = await loadMovieDetailData(movieId);

  if (!movieDetailData) {
    sendJson(response, 404, { message: "Khong tim thay phim." });
    return;
  }

  sendJson(response, 200, {
    message: "Da luu binh luan va danh gia phim.",
    ...movieDetailData,
  });
}

async function isPasswordMatch(inputPassword: string, storedPassword: string) {
  const looksLikeBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword) && storedPassword.length === 60;

  if (looksLikeBcryptHash) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  return inputPassword === storedPassword;
}

function getBearerToken(request: IncomingMessage) {
  const authorization = request.headers.authorization ?? "";
  const [scheme, token] = authorization.split(/\s+/);

  return scheme?.toLowerCase() === "bearer" ? token ?? "" : "";
}

async function getAuthenticatedUser(request: IncomingMessage) {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const refreshToken = await prisma.refreshToken.findFirst({
    where: {
      token,
      revoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!refreshToken?.user || !refreshToken.user.isActive) {
    return null;
  }

  return refreshToken.user;
}

function isAdminUser(user: { role: { name: string } }) {
  return adminRoles.has(user.role.name.toUpperCase());
}

const adminAccountRoleLabels = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý rạp",
  STAFF: "Nhân viên rạp",
  ACCOUNTANT: "Kế toán",
  CUSTOMER: "Khách hàng",
} as const;

const adminAccountRoleDescriptions = {
  ADMIN: "Quản trị viên hệ thống",
  MANAGER: "Quản lý rạp phim",
  STAFF: "Nhân viên rạp phim",
  ACCOUNTANT: "Kế toán",
  CUSTOMER: "Khách hàng",
} as const;

type AdminAccountRoleName = keyof typeof adminAccountRoleLabels;

function normalizeAdminAccountInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const adminAccountRoleNameByLabel = new Map<string, AdminAccountRoleName>(
  Object.entries(adminAccountRoleLabels).map(([roleName, roleLabel]) => [
    normalizeAdminAccountInput(roleLabel),
    roleName as AdminAccountRoleName,
  ]),
);

function getAdminAccountRoleName(roleInput: string) {
  const normalizedRoleName = roleInput.trim().toUpperCase();

  if (normalizedRoleName in adminAccountRoleLabels) {
    return normalizedRoleName as AdminAccountRoleName;
  }

  return adminAccountRoleNameByLabel.get(normalizeAdminAccountInput(roleInput)) ?? null;
}

function getAdminAccountRoleNameFromBody(body: JsonBody) {
  const roleInput =
    stringField(body, "roleName") || stringField(body, "role") || stringField(body, "roleLabel");

  return roleInput ? getAdminAccountRoleName(roleInput) : null;
}

async function ensureAdminAccountRole(roleName: AdminAccountRoleName) {
  return prisma.role.upsert({
    where: {
      name: roleName,
    },
    update: {
      description: adminAccountRoleDescriptions[roleName],
    },
    create: {
      name: roleName,
      description: adminAccountRoleDescriptions[roleName],
    },
  });
}

function parseAdminAccountIsActive(body: JsonBody, fallback: boolean) {
  if (typeof body.isActive === "boolean") {
    return { value: body.isActive } as const;
  }

  const status = stringField(body, "status");

  if (!status) {
    return { value: fallback } as const;
  }

  const normalizedStatus = normalizeAdminAccountInput(status);

  if (normalizedStatus.includes("hoat dong")) {
    return { value: true } as const;
  }

  if (
    normalizedStatus.includes("khoa") ||
    normalizedStatus.includes("tam dung") ||
    normalizedStatus.includes("cho xac minh")
  ) {
    return { value: false } as const;
  }

  return { error: "Trạng thái tài khoản không hợp lệ." } as const;
}

function phoneField(body: JsonBody) {
  const phone = stringField(body, "phone");

  return phone && phone !== "Chưa cập nhật" ? phone : null;
}

function formatDateTimeLabel(date: Date) {
  return `${fullDateFormatter.format(date)} ${timeFormatter.format(date)}`;
}

function filterNonOverlappingShowtimeRecords<
  Showtime extends {
    id: number;
    roomId: number;
    startTime: Date;
    endTime: Date;
  },
>(showtimes: Showtime[]) {
  const latestEndByRoomId = new Map<number, number>();

  return [...showtimes]
    .sort(
      (leftShowtime, rightShowtime) =>
        leftShowtime.roomId - rightShowtime.roomId ||
        leftShowtime.startTime.getTime() - rightShowtime.startTime.getTime() ||
        leftShowtime.id - rightShowtime.id,
    )
    .filter((showtime) => {
      const latestEnd = latestEndByRoomId.get(showtime.roomId) ?? Number.NEGATIVE_INFINITY;
      const startTime = showtime.startTime.getTime();

      if (startTime < latestEnd) {
        return false;
      }

      latestEndByRoomId.set(showtime.roomId, showtime.endTime.getTime());
      return true;
    })
    .sort(
      (leftShowtime, rightShowtime) =>
        leftShowtime.startTime.getTime() - rightShowtime.startTime.getTime() ||
        leftShowtime.id - rightShowtime.id,
    );
}

const adminAccountUserInclude = {
  role: true,
  refreshTokens: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
    select: {
      createdAt: true,
    },
  },
} satisfies Prisma.UserInclude;

async function fetchAdminAccountUsers() {
  return prisma.user.findMany({
    orderBy: [{ roleId: "asc" }, { updatedAt: "desc" }, { id: "desc" }],
    include: adminAccountUserInclude,
  });
}

async function fetchAdminAccountUserById(userId: number) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: adminAccountUserInclude,
  });
}

type AdminAccountUserRecord = Awaited<ReturnType<typeof fetchAdminAccountUsers>>[number];

function getRoleDisplayName(roleName: string) {
  const normalizedRoleName = roleName.toUpperCase() as AdminAccountRoleName;

  return adminAccountRoleLabels[normalizedRoleName] ?? roleName;
}

function serializeAdminAccount(user: AdminAccountUserRecord) {
  const roleName = user.role.name;
  const lastLoginAt = user.refreshTokens[0]?.createdAt ?? user.updatedAt;

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    role: roleName,
    roleLabel: getRoleDisplayName(roleName),
    roleId: user.roleId,
    isSystemAccount: adminRoles.has(roleName.toUpperCase()),
    isActive: user.isActive,
    status: user.isActive ? "Đang hoạt động" : "Bị khóa",
    lastLogin: formatDateTimeLabel(lastLoginAt),
    lastLoginAt: lastLoginAt.toISOString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function handleGetAdminAccounts(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để xem danh sách tài khoản." });
    return;
  }

  if (!isAdminUser(user)) {
    sendJson(response, 403, { message: "Bạn không có quyền quản lý tài khoản." });
    return;
  }

  const accounts = (await fetchAdminAccountUsers()).map(serializeAdminAccount);
  const customerAccounts = accounts.filter((account) => !account.isSystemAccount);
  const systemAccounts = accounts.filter((account) => account.isSystemAccount);
  const activeAccounts = accounts.filter((account) => account.isActive);
  const blockedAccounts = accounts.filter((account) => !account.isActive);

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    accounts,
    customerAccounts,
    systemAccounts,
    stats: {
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      systemAccounts: systemAccounts.length,
      blockedAccounts: blockedAccounts.length,
    },
  });
}

async function getAdminAccountRequestUser(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để quản lý tài khoản." });
    return null;
  }

  if (!isAdminUser(user)) {
    sendJson(response, 403, { message: "Bạn không có quyền quản lý tài khoản." });
    return null;
  }

  return user;
}

async function hasAnotherActiveAdminUser(userId: number) {
  const adminRole = await prisma.role.findUnique({
    where: {
      name: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (!adminRole) {
    return false;
  }

  const activeAdminCount = await prisma.user.count({
    where: {
      id: {
        not: userId,
      },
      roleId: adminRole.id,
      isActive: true,
    },
  });

  return activeAdminCount > 0;
}

function isPrismaErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function isShowtimeOverlapConstraintError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    isPrismaErrorCode(error, "P2004") ||
    message.includes("showtimes_room_time_no_overlap") ||
    message.includes("exclusion constraint") ||
    message.includes("23P01")
  );
}

async function handleCreateAdminAccount(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminAccountRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const body = await readJson(request);
  const fullName = stringField(body, "fullName") || stringField(body, "name");
  const email = stringField(body, "email").toLowerCase();
  const password = stringField(body, "password");
  const roleName = getAdminAccountRoleNameFromBody(body);
  const parsedIsActive = parseAdminAccountIsActive(body, true);

  if (!fullName || !email || !password || !roleName) {
    sendJson(response, 400, {
      message: "Vui lòng nhập họ tên, email, mật khẩu và vai trò.",
    });
    return;
  }

  if (!emailPattern.test(email)) {
    sendJson(response, 400, { message: "Email không hợp lệ." });
    return;
  }

  if (password.length < 6) {
    sendJson(response, 400, { message: "Mật khẩu cần tối thiểu 6 ký tự." });
    return;
  }

  if ("error" in parsedIsActive) {
    sendJson(response, 400, { message: parsedIsActive.error });
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    sendJson(response, 409, { message: "Email này đã được sử dụng bởi tài khoản khác." });
    return;
  }

  const role = await ensureAdminAccountRole(roleName);
  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      roleId: role.id,
      fullName,
      email,
      phone: phoneField(body),
      password: hashedPassword,
      isActive: parsedIsActive.value,
    },
    include: adminAccountUserInclude,
  });

  sendJson(response, 201, {
    message: "Thêm tài khoản thành công.",
    account: serializeAdminAccount(createdUser),
  });
}

async function handleUpdateAdminAccount(
  request: IncomingMessage,
  response: ServerResponse,
  accountId: number,
) {
  const requestUser = await getAdminAccountRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingAccount = await fetchAdminAccountUserById(accountId);

  if (!existingAccount) {
    sendJson(response, 404, { message: "Không tìm thấy tài khoản cần cập nhật." });
    return;
  }

  const body = await readJson(request);
  const fullName = stringField(body, "fullName") || stringField(body, "name");
  const email = stringField(body, "email").toLowerCase();
  const password = stringField(body, "password");
  const roleName = getAdminAccountRoleNameFromBody(body);
  const parsedIsActive = parseAdminAccountIsActive(body, existingAccount.isActive);

  if (!fullName || !email || !roleName) {
    sendJson(response, 400, { message: "Vui lòng nhập họ tên, email và vai trò." });
    return;
  }

  if (!emailPattern.test(email)) {
    sendJson(response, 400, { message: "Email không hợp lệ." });
    return;
  }

  if (password && password.length < 6) {
    sendJson(response, 400, { message: "Mật khẩu mới cần tối thiểu 6 ký tự." });
    return;
  }

  if ("error" in parsedIsActive) {
    sendJson(response, 400, { message: parsedIsActive.error });
    return;
  }

  if (existingAccount.id === requestUser.id && !parsedIsActive.value) {
    sendJson(response, 409, { message: "Không thể khóa chính tài khoản đang đăng nhập." });
    return;
  }

  if (existingAccount.id === requestUser.id && !adminRoles.has(roleName)) {
    sendJson(response, 409, { message: "Không thể bỏ quyền quản trị của chính tài khoản đang đăng nhập." });
    return;
  }

  const existingEmailOwner = await prisma.user.findFirst({
    where: {
      email,
      id: {
        not: existingAccount.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingEmailOwner) {
    sendJson(response, 409, { message: "Email này đã được sử dụng bởi tài khoản khác." });
    return;
  }

  const wasActiveAdmin = existingAccount.role.name.toUpperCase() === "ADMIN" && existingAccount.isActive;
  const remainsActiveAdmin = roleName === "ADMIN" && parsedIsActive.value;

  if (wasActiveAdmin && !remainsActiveAdmin && !(await hasAnotherActiveAdminUser(existingAccount.id))) {
    sendJson(response, 409, { message: "Hệ thống cần giữ lại ít nhất một quản trị viên đang hoạt động." });
    return;
  }

  const role = await ensureAdminAccountRole(roleName);
  const updateData: Prisma.UserUpdateInput = {
    fullName,
    email,
    phone: phoneField(body),
    isActive: parsedIsActive.value,
    role: {
      connect: {
        id: role.id,
      },
    },
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: existingAccount.id,
    },
    data: updateData,
    include: adminAccountUserInclude,
  });

  sendJson(response, 200, {
    message: "Cập nhật tài khoản thành công.",
    account: serializeAdminAccount(updatedUser),
  });
}

async function handleDeleteAdminAccount(
  request: IncomingMessage,
  response: ServerResponse,
  accountId: number,
) {
  const requestUser = await getAdminAccountRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingAccount = await fetchAdminAccountUserById(accountId);

  if (!existingAccount) {
    sendJson(response, 404, { message: "Không tìm thấy tài khoản cần xóa." });
    return;
  }

  if (existingAccount.id === requestUser.id) {
    sendJson(response, 409, { message: "Không thể xóa chính tài khoản đang đăng nhập." });
    return;
  }

  const isActiveAdmin = existingAccount.role.name.toUpperCase() === "ADMIN" && existingAccount.isActive;

  if (isActiveAdmin && !(await hasAnotherActiveAdminUser(existingAccount.id))) {
    sendJson(response, 409, { message: "Hệ thống cần giữ lại ít nhất một quản trị viên đang hoạt động." });
    return;
  }

  try {
    await prisma.user.delete({
      where: {
        id: existingAccount.id,
      },
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2003")) {
      sendJson(response, 409, {
        message:
          "Tài khoản đã có dữ liệu phát sinh như đặt vé hoặc nhật ký. Hãy khóa tài khoản thay vì xóa.",
      });
      return;
    }

    throw error;
  }

  sendJson(response, 200, {
    message: "Xóa tài khoản thành công.",
    deletedId: existingAccount.id,
  });
}

const adminMovieStatusLabels = {
  NOW_SHOWING: "Đang chiếu",
  COMING_SOON: "Sắp chiếu",
  ENDED: "Ngừng chiếu",
} as const satisfies Record<MovieStatus, string>;

const adminMovieInclude = {
  movieGenres: {
    include: {
      genre: true,
    },
  },
  movieImages: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  showtimes: {
    orderBy: {
      startTime: "asc" as const,
    },
    include: {
      room: {
        include: {
          cinema: true,
          seats: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  },
} satisfies Prisma.MovieInclude;

type AdminMovieRecord = Prisma.MovieGetPayload<{
  include: typeof adminMovieInclude;
}>;

function normalizeMovieInput(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slugifyMovieTitle(value: string) {
  return normalizeMovieInput(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function getAdminMovieStatusLabel(status: MovieStatus) {
  return adminMovieStatusLabels[status] ?? status;
}

function parseAdminMovieStatus(body: JsonBody, fallback: MovieStatus = "COMING_SOON") {
  const rawStatus = stringField(body, "statusCode") || stringField(body, "status");

  if (!rawStatus) {
    return { value: fallback } as const;
  }

  const normalizedStatusCode = rawStatus.trim().toUpperCase();

  if (normalizedStatusCode in adminMovieStatusLabels) {
    return { value: normalizedStatusCode as MovieStatus } as const;
  }

  const normalizedStatus = normalizeMovieInput(rawStatus);

  if (
    normalizedStatus.includes("dang chieu") ||
    normalizedStatus.includes("dang hoat dong")
  ) {
    return { value: "NOW_SHOWING" as MovieStatus } as const;
  }

  if (normalizedStatus.includes("sap chieu")) {
    return { value: "COMING_SOON" as MovieStatus } as const;
  }

  if (
    normalizedStatus.includes("ngung chieu") ||
    normalizedStatus.includes("tam dung") ||
    normalizedStatus.includes("da ket thuc") ||
    normalizedStatus.includes("ket thuc")
  ) {
    return { value: "ENDED" as MovieStatus } as const;
  }

  return { error: "Trạng thái phim không hợp lệ." } as const;
}

function parseAdminMovieDuration(body: JsonBody, fallback?: number) {
  const rawDuration =
    body.durationMinutes ?? body.duration ?? body.runtime ?? body.length;

  if (rawDuration === undefined || rawDuration === null || rawDuration === "") {
    if (fallback !== undefined) {
      return { value: fallback } as const;
    }

    return { error: "Vui lòng nhập thời lượng phim." } as const;
  }

  const duration =
    typeof rawDuration === "number"
      ? rawDuration
      : Number.parseInt(String(rawDuration).replace(/[^\d]/g, ""), 10);

  if (!Number.isFinite(duration) || duration < 1) {
    return { error: "Thời lượng phim không hợp lệ." } as const;
  }

  return { value: Math.round(duration) } as const;
}

function parseAdminMovieDateValue(value: string) {
  const displayMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const isoDateMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const isoDateTime = Date.parse(value);

  if (!displayMatch && !isoDateMatch && Number.isFinite(isoDateTime)) {
    return new Date(isoDateTime);
  }

  const day = displayMatch ? Number(displayMatch[1]) : Number(isoDateMatch?.[3]);
  const month = displayMatch ? Number(displayMatch[2]) : Number(isoDateMatch?.[2]);
  const year = displayMatch ? Number(displayMatch[3]) : Number(isoDateMatch?.[1]);

  if (!day || !month || !year) {
    return null;
  }

  const localDate = new Date(year, month - 1, day);

  if (
    localDate.getFullYear() !== year ||
    localDate.getMonth() !== month - 1 ||
    localDate.getDate() !== day
  ) {
    return null;
  }

  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");

  return new Date(`${year}-${paddedMonth}-${paddedDay}T00:00:00.000+07:00`);
}

function parseAdminMovieDateField(body: JsonBody, key: string, fallback?: Date | null) {
  if (!(key in body)) {
    return { value: fallback ?? null } as const;
  }

  const rawValue = stringField(body, key);

  if (!rawValue) {
    return { value: null } as const;
  }

  const value = parseAdminMovieDateValue(rawValue);

  if (!value) {
    return { error: `${key === "releaseDate" ? "Ngày khởi chiếu" : "Ngày kết thúc"} không hợp lệ.` } as const;
  }

  return { value } as const;
}

function nullableMovieStringField(body: JsonBody, key: string, fallback?: string | null) {
  if (!(key in body)) {
    return fallback ?? null;
  }

  const value = stringField(body, key);

  return value || null;
}

function getAdminMovieGenreNames(body: JsonBody) {
  const rawGenres = body.genres;
  const genreValues = Array.isArray(rawGenres)
    ? rawGenres
    : [stringField(body, "genre") || stringField(body, "genres")];
  const uniqueGenres = new Set<string>();

  for (const genreValue of genreValues) {
    if (typeof genreValue !== "string") {
      continue;
    }

    for (const genreName of genreValue.split(",")) {
      const trimmedGenreName = genreName.trim();

      if (trimmedGenreName) {
        uniqueGenres.add(trimmedGenreName);
      }
    }
  }

  return [...uniqueGenres];
}

function validateMovieAssetUrl(value: string | null, label: string) {
  if (!value) {
    return "";
  }

  if (value.startsWith("/")) {
    return "";
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return "";
    }
  } catch {
    // Continue validating as a data URL.
  }

  if (!avatarDataUrlPattern.test(value)) {
    return `${label} phải là link ảnh hợp lệ hoặc đường dẫn bắt đầu bằng /.`;
  }

  const [, base64Data = ""] = value.split(",", 2);
  const byteLength = Buffer.byteLength(base64Data, "base64");

  if (byteLength > avatarMaxBytes) {
    return `${label} tối đa 10 MB.`;
  }

  return "";
}

function validateOptionalHttpUrl(value: string | null, label: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return "";
    }
  } catch {
    // Fall through to the validation error.
  }

  return `${label} phải là URL http hoặc https hợp lệ.`;
}

function getMovieUploadRoot() {
  if (process.env.MOVIE_UPLOAD_DIR) {
    return path.resolve(process.env.MOVIE_UPLOAD_DIR);
  }

  const rootFromRepository = path.resolve(process.cwd(), "frontend", "public", "movies");

  if (existsSync(path.resolve(process.cwd(), "frontend", "public"))) {
    return rootFromRepository;
  }

  return path.resolve(process.cwd(), "..", "frontend", "public", "movies");
}

function getMovieImageUploadKind(body: JsonBody) {
  const kind = stringField(body, "kind").toLowerCase();

  if (kind === "poster" || kind === "banner") {
    return kind;
  }

  return null;
}

async function handleUploadAdminMovieImage(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const body = await readJson(request);
  const kind = getMovieImageUploadKind(body);
  const dataUrl = stringField(body, "dataUrl");
  const match = dataUrl.match(movieImageDataUrlPattern);

  if (!kind) {
    sendJson(response, 400, { message: "Loai anh phim khong hop le." });
    return;
  }

  if (!match) {
    sendJson(response, 400, { message: "Vui long chon anh JPEG, PNG hoac WEBP." });
    return;
  }

  const [, contentType, base64Data = ""] = match;
  const byteLength = Buffer.byteLength(base64Data, "base64");

  if (byteLength < 1) {
    sendJson(response, 400, { message: "File anh khong co du lieu." });
    return;
  }

  if (byteLength > movieImageMaxBytes) {
    sendJson(response, 400, { message: "Dung luong anh toi da 10 MB." });
    return;
  }

  const extension = movieImageExtensions[contentType];

  if (!extension) {
    sendJson(response, 400, { message: "Dinh dang anh khong hop le." });
    return;
  }

  const uploadDirectory = path.join(getMovieUploadRoot(), kind, "uploaded");
  const fileName = `${kind}-${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(uploadDirectory, fileName);
  const publicUrl = `/movies/${kind}/uploaded/${fileName}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(filePath, Buffer.from(base64Data, "base64"));

  sendJson(response, 201, {
    message: "Upload anh phim thanh cong.",
    url: publicUrl,
    fileName,
    size: byteLength,
    contentType,
  });
}

async function createUniqueMovieSlug(title: string, requestedSlug?: string, excludeMovieId?: number) {
  const baseSlug = slugifyMovieTitle(requestedSlug || title) || `movie-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existingMovie = await prisma.movie.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existingMovie || existingMovie.id === excludeMovieId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function getAdminMovieGenreCreates(genreNames: string[]) {
  return genreNames.map((genreName) => ({
    genre: {
      connectOrCreate: {
        where: {
          name: genreName,
        },
        create: {
          name: genreName,
        },
      },
    },
  }));
}

async function fetchAdminMovies() {
  return prisma.movie.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    include: adminMovieInclude,
  });
}

async function fetchAdminMovieById(movieId: number) {
  return prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: adminMovieInclude,
  });
}

function serializeAdminMovie(movie: AdminMovieRecord) {
  const genres = movie.movieGenres
    .map((movieGenre) => movieGenre.genre.name)
    .sort((left, right) => left.localeCompare(right, "vi"));
  const poster = movie.posterUrl ?? movie.movieImages[0]?.imageUrl ?? "/movies/demo.png";
  const banner = movie.bannerUrl ?? poster;
  const cinemaNames = new Set<string>();

  for (const showtime of movie.showtimes) {
    cinemaNames.add(showtime.room.cinema.name);
  }

  const schedule = movie.showtimes.map(
    (showtime) => `${timeFormatter.format(showtime.startTime)} - ${showtime.room.name}`,
  );
  const ticketsSold = movie.showtimes.reduce(
    (total, showtime) => total + showtime._count.tickets,
    0,
  );

  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    genre: genres.join(", ") || "Chưa phân loại",
    genres,
    country: movie.country ?? "Đang cập nhật",
    ageRating: movie.ageLimit ?? "P",
    statusCode: movie.status,
    status: getAdminMovieStatusLabel(movie.status),
    poster,
    banner,
    posterUrl: movie.posterUrl ?? "",
    bannerUrl: movie.bannerUrl ?? "",
    durationMinutes: movie.duration,
    duration: `${movie.duration} phút`,
    language: movie.language ?? "Đang cập nhật",
    releaseDate: formatNullableDate(movie.releaseDate) ?? "",
    releaseDateIso: movie.releaseDate?.toISOString() ?? null,
    endDate: formatNullableDate(movie.endDate) ?? "",
    endDateIso: movie.endDate?.toISOString() ?? null,
    director: movie.director ?? "",
    actors: movie.actors ?? "",
    description: movie.description ?? "",
    trailerUrl: movie.trailerUrl ?? "",
    cinemas: [...cinemaNames].sort((left, right) => left.localeCompare(right, "vi")),
    schedule,
    ticketsSold,
    createdAt: movie.createdAt.toISOString(),
    updatedAt: movie.updatedAt.toISOString(),
  };
}

async function getAdminMovieRequestUser(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để quản lý phim." });
    return null;
  }

  if (!isAdminUser(user)) {
    sendJson(response, 403, { message: "Bạn không có quyền quản lý phim." });
    return null;
  }

  return user;
}

async function handleGetAdminMovies(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const movies = (await fetchAdminMovies()).map(serializeAdminMovie);

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    movies,
    stats: {
      totalMovies: movies.length,
      nowShowingMovies: movies.filter((movie) => movie.statusCode === "NOW_SHOWING").length,
      comingSoonMovies: movies.filter((movie) => movie.statusCode === "COMING_SOON").length,
      endedMovies: movies.filter((movie) => movie.statusCode === "ENDED").length,
      ticketsSold: movies.reduce((total, movie) => total + movie.ticketsSold, 0),
    },
  });
}

async function handleGetAdminMovie(
  request: IncomingMessage,
  response: ServerResponse,
  movieId: number,
) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const movie = await fetchAdminMovieById(movieId);

  if (!movie) {
    sendJson(response, 404, { message: "Không tìm thấy phim." });
    return;
  }

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    movie: serializeAdminMovie(movie),
  });
}

async function handleCreateAdminMovie(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const body = await readJson(request);
  const title = stringField(body, "title");
  const parsedDuration = parseAdminMovieDuration(body);
  const parsedReleaseDate = parseAdminMovieDateField(body, "releaseDate");
  const parsedEndDate = parseAdminMovieDateField(body, "endDate");
  const parsedStatus = parseAdminMovieStatus(body);
  const posterUrl = nullableMovieStringField(body, "posterUrl");
  const bannerUrl = nullableMovieStringField(body, "bannerUrl");
  const trailerUrl = nullableMovieStringField(body, "trailerUrl");
  const posterError = validateMovieAssetUrl(posterUrl, "Poster phim");
  const bannerError = validateMovieAssetUrl(bannerUrl, "Banner phim");
  const trailerError = validateOptionalHttpUrl(trailerUrl, "Trailer phim");

  if (!title) {
    sendJson(response, 400, { message: "Vui lòng nhập tên phim." });
    return;
  }

  if ("error" in parsedDuration) {
    sendJson(response, 400, { message: parsedDuration.error });
    return;
  }

  if ("error" in parsedReleaseDate) {
    sendJson(response, 400, { message: parsedReleaseDate.error });
    return;
  }

  if ("error" in parsedEndDate) {
    sendJson(response, 400, { message: parsedEndDate.error });
    return;
  }

  if ("error" in parsedStatus) {
    sendJson(response, 400, { message: parsedStatus.error });
    return;
  }

  if (posterError || bannerError || trailerError) {
    sendJson(response, 400, { message: posterError || bannerError || trailerError });
    return;
  }

  const genreNames = getAdminMovieGenreNames(body);
  const slug = await createUniqueMovieSlug(title, stringField(body, "slug"));

  try {
    const createdMovie = await prisma.movie.create({
      data: {
        title,
        slug,
        description: nullableMovieStringField(body, "description"),
        director: nullableMovieStringField(body, "director"),
        actors: nullableMovieStringField(body, "actors"),
        duration: parsedDuration.value,
        releaseDate: parsedReleaseDate.value,
        endDate: parsedEndDate.value,
        language: nullableMovieStringField(body, "language"),
        country: nullableMovieStringField(body, "country"),
        ageLimit: nullableMovieStringField(body, "ageRating") || nullableMovieStringField(body, "ageLimit"),
        trailerUrl,
        posterUrl,
        bannerUrl,
        status: parsedStatus.value,
        movieGenres: {
          create: getAdminMovieGenreCreates(genreNames),
        },
      },
      include: adminMovieInclude,
    });

    sendJson(response, 201, {
      message: "Thêm phim thành công.",
      movie: serializeAdminMovie(createdMovie),
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      sendJson(response, 409, { message: "Slug phim đã tồn tại." });
      return;
    }

    throw error;
  }
}

async function handleUpdateAdminMovie(
  request: IncomingMessage,
  response: ServerResponse,
  movieId: number,
) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingMovie = await fetchAdminMovieById(movieId);

  if (!existingMovie) {
    sendJson(response, 404, { message: "Không tìm thấy phim cần cập nhật." });
    return;
  }

  const body = await readJson(request);
  const title = "title" in body ? stringField(body, "title") : existingMovie.title;
  const parsedDuration = parseAdminMovieDuration(body, existingMovie.duration);
  const parsedReleaseDate = parseAdminMovieDateField(
    body,
    "releaseDate",
    existingMovie.releaseDate,
  );
  const parsedEndDate = parseAdminMovieDateField(body, "endDate", existingMovie.endDate);
  const parsedStatus = parseAdminMovieStatus(body, existingMovie.status);
  const posterUrl = nullableMovieStringField(body, "posterUrl", existingMovie.posterUrl);
  const bannerUrl = nullableMovieStringField(body, "bannerUrl", existingMovie.bannerUrl);
  const trailerUrl = nullableMovieStringField(body, "trailerUrl", existingMovie.trailerUrl);
  const posterError = validateMovieAssetUrl(posterUrl, "Poster phim");
  const bannerError = validateMovieAssetUrl(bannerUrl, "Banner phim");
  const trailerError = validateOptionalHttpUrl(trailerUrl, "Trailer phim");

  if (!title) {
    sendJson(response, 400, { message: "Vui lòng nhập tên phim." });
    return;
  }

  if ("error" in parsedDuration) {
    sendJson(response, 400, { message: parsedDuration.error });
    return;
  }

  if ("error" in parsedReleaseDate) {
    sendJson(response, 400, { message: parsedReleaseDate.error });
    return;
  }

  if ("error" in parsedEndDate) {
    sendJson(response, 400, { message: parsedEndDate.error });
    return;
  }

  if ("error" in parsedStatus) {
    sendJson(response, 400, { message: parsedStatus.error });
    return;
  }

  if (posterError || bannerError || trailerError) {
    sendJson(response, 400, { message: posterError || bannerError || trailerError });
    return;
  }

  const genreNames = getAdminMovieGenreNames(body);
  const shouldUpdateGenres = "genre" in body || "genres" in body;
  const slug =
    "slug" in body
      ? await createUniqueMovieSlug(title, stringField(body, "slug"), existingMovie.id)
      : existingMovie.slug;

  try {
    const updatedMovie = await prisma.movie.update({
      where: {
        id: existingMovie.id,
      },
      data: {
        title,
        slug,
        description: nullableMovieStringField(body, "description", existingMovie.description),
        director: nullableMovieStringField(body, "director", existingMovie.director),
        actors: nullableMovieStringField(body, "actors", existingMovie.actors),
        duration: parsedDuration.value,
        releaseDate: parsedReleaseDate.value,
        endDate: parsedEndDate.value,
        language: nullableMovieStringField(body, "language", existingMovie.language),
        country: nullableMovieStringField(body, "country", existingMovie.country),
        ageLimit:
          nullableMovieStringField(body, "ageRating", existingMovie.ageLimit) ||
          nullableMovieStringField(body, "ageLimit", existingMovie.ageLimit),
        trailerUrl,
        posterUrl,
        bannerUrl,
        status: parsedStatus.value,
        ...(shouldUpdateGenres
          ? {
              movieGenres: {
                deleteMany: {},
                create: getAdminMovieGenreCreates(genreNames),
              },
            }
          : {}),
      },
      include: adminMovieInclude,
    });

    sendJson(response, 200, {
      message: "Cập nhật phim thành công.",
      movie: serializeAdminMovie(updatedMovie),
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2002")) {
      sendJson(response, 409, { message: "Slug phim đã tồn tại." });
      return;
    }

    throw error;
  }
}

async function handleDeleteAdminMovie(
  request: IncomingMessage,
  response: ServerResponse,
  movieId: number,
) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingMovie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!existingMovie) {
    sendJson(response, 404, { message: "Không tìm thấy phim cần xóa." });
    return;
  }

  try {
    await prisma.movie.delete({
      where: {
        id: existingMovie.id,
      },
    });
  } catch (error) {
    if (isPrismaErrorCode(error, "P2003")) {
      sendJson(response, 409, {
        message: "Phim đã có dữ liệu phát sinh, không thể xóa khỏi database.",
      });
      return;
    }

    throw error;
  }

  sendJson(response, 200, {
    message: "Xóa phim thành công.",
    deletedId: existingMovie.id,
  });
}

type AdminGenreRecord = Prisma.GenreGetPayload<{
  include: {
    _count: {
      select: {
        movieGenres: true;
      };
    };
  };
}>;

async function fetchAdminGenres() {
  return prisma.genre.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    include: {
      _count: {
        select: {
          movieGenres: true,
        },
      },
    },
  });
}

function serializeAdminGenre(genre: AdminGenreRecord) {
  const movieCount = genre._count.movieGenres;

  return {
    id: genre.id,
    name: genre.name,
    slug: slugifyMovieTitle(genre.name),
    description: genre.description ?? "",
    movieCount,
    movieCountLabel: new Intl.NumberFormat("vi-VN").format(movieCount),
    displayArea: movieCount > 0 ? "Danh mục phim" : "Chưa gắn phim",
    status: movieCount > 0 ? "Đang hoạt động" : "Chưa sử dụng",
    createdAt: genre.createdAt.toISOString(),
    updatedAt: genre.updatedAt.toISOString(),
  };
}

async function handleGetAdminGenres(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminMovieRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const genres = (await fetchAdminGenres()).map(serializeAdminGenre);

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    genres,
    stats: {
      totalGenres: genres.length,
      activeGenres: genres.filter((genre) => genre.movieCount > 0).length,
      unusedGenres: genres.filter((genre) => genre.movieCount === 0).length,
      movieGenreLinks: genres.reduce((total, genre) => total + genre.movieCount, 0),
    },
  });
}

const adminShowtimeStatusLabels = {
  ACTIVE: "Đang mở bán",
  CANCELLED: "Tạm dừng",
  FINISHED: "Đã kết thúc",
} satisfies Record<ShowtimeStatus, string>;

const adminShowtimeInclude = {
  movie: {
    select: {
      id: true,
      title: true,
      slug: true,
      duration: true,
      language: true,
      ageLimit: true,
      status: true,
      releaseDate: true,
      endDate: true,
    },
  },
  room: {
    include: {
      cinema: true,
    },
  },
  _count: {
    select: {
      bookingDetails: true,
      seatHolds: true,
      tickets: true,
    },
  },
} satisfies Prisma.ShowtimeInclude;

type AdminShowtimeRecord = Prisma.ShowtimeGetPayload<{
  include: typeof adminShowtimeInclude;
}>;

function getAdminShowtimeStatusLabel(status: ShowtimeStatus) {
  return adminShowtimeStatusLabels[status] ?? status;
}

function parseAdminShowtimeStatus(
  body: JsonBody,
  fallback: ShowtimeStatus = ShowtimeStatus.ACTIVE,
) {
  const rawStatus = stringField(body, "statusCode") || stringField(body, "status");

  if (!rawStatus) {
    return { value: fallback } as const;
  }

  const normalizedStatusCode = rawStatus.trim().toUpperCase();

  if (normalizedStatusCode in adminShowtimeStatusLabels) {
    return { value: normalizedStatusCode as ShowtimeStatus } as const;
  }

  const normalizedStatus = normalizeMovieInput(rawStatus);

  if (normalizedStatus.includes("mo ban") || normalizedStatus.includes("hoat dong")) {
    return { value: ShowtimeStatus.ACTIVE } as const;
  }

  if (normalizedStatus.includes("tam dung") || normalizedStatus.includes("huy")) {
    return { value: ShowtimeStatus.CANCELLED } as const;
  }

  if (normalizedStatus.includes("ket thuc") || normalizedStatus.includes("da chieu")) {
    return { value: ShowtimeStatus.FINISHED } as const;
  }

  return { error: "Trạng thái suất chiếu không hợp lệ." } as const;
}

function parsePositiveNumberField(body: JsonBody, key: string, fallback?: number) {
  const rawValue = body[key];

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    if (fallback !== undefined) {
      return { value: fallback } as const;
    }

    return { error: "Vui lòng nhập giá vé." } as const;
  }

  const textValue = String(rawValue).trim();
  const normalizedValue =
    textValue.includes(".") && /^\d{1,3}(\.\d{3})+$/.test(textValue)
      ? textValue.replace(/\./g, "")
      : textValue.replace(",", ".");
  const value =
    typeof rawValue === "number"
      ? rawValue
      : Number(normalizedValue.replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(value) || value < 0) {
    return { error: "Giá vé không hợp lệ." } as const;
  }

  return { value } as const;
}

function parseAdminShowtimeDateTime(value: string) {
  const rawValue = value.trim();

  if (!rawValue) {
    return null;
  }

  const localDateTimeMatch = rawValue.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (localDateTimeMatch) {
    const [, year, month, day, hour, minute, second = "00"] = localDateTimeMatch;

    return new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`,
    );
  }

  const parsedDate = new Date(rawValue);

  return Number.isFinite(parsedDate.getTime()) ? parsedDate : null;
}

function parseAdminShowtimeDateTimeField(
  body: JsonBody,
  key: string,
  fallback?: Date,
) {
  if (!(key in body)) {
    return fallback ? ({ value: fallback } as const) : ({ value: null } as const);
  }

  const rawValue = stringField(body, key);

  if (!rawValue) {
    return { value: null } as const;
  }

  const value = parseAdminShowtimeDateTime(rawValue);

  if (!value) {
    return {
      error: key === "startTime" ? "Thời gian bắt đầu không hợp lệ." : "Thời gian kết thúc không hợp lệ.",
    } as const;
  }

  return { value } as const;
}

function numberBodyField(body: JsonBody, key: string) {
  const value = body[key];

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  return Number.parseInt(String(value ?? ""), 10);
}

function serializeAdminShowtime(showtime: AdminShowtimeRecord) {
  const basePrice = Number(showtime.basePrice);
  const reservedSeats = showtime._count.bookingDetails + showtime._count.seatHolds;
  const availableSeats = Math.max(showtime.room.totalSeats - reservedSeats, 0);

  return {
    id: showtime.id,
    movieId: showtime.movieId,
    movieTitle: showtime.movie.title,
    movieSlug: showtime.movie.slug,
    movieDuration: showtime.movie.duration,
    movieLanguage: showtime.movie.language ?? "",
    movieAgeLimit: showtime.movie.ageLimit ?? "",
    roomId: showtime.roomId,
    roomName: showtime.room.name,
    totalSeats: showtime.room.totalSeats,
    cinemaId: showtime.room.cinema.id,
    cinemaName: showtime.room.cinema.name,
    cinemaSlug: showtime.room.cinema.slug,
    startTime: showtime.startTime.toISOString(),
    endTime: showtime.endTime.toISOString(),
    dateKey: getDateKey(showtime.startTime),
    date: formatNullableDate(showtime.startTime) ?? "",
    startLabel: formatDateTimeLabel(showtime.startTime),
    endLabel: formatDateTimeLabel(showtime.endTime),
    time: timeFormatter.format(showtime.startTime),
    timeRange: `${timeFormatter.format(showtime.startTime)} - ${timeFormatter.format(showtime.endTime)}`,
    basePrice,
    price: formatCurrency(basePrice),
    statusCode: showtime.status,
    status: getAdminShowtimeStatusLabel(showtime.status),
    bookedSeats: showtime._count.bookingDetails,
    heldSeats: showtime._count.seatHolds,
    ticketsSold: showtime._count.tickets,
    availableSeats,
    createdAt: showtime.createdAt.toISOString(),
    updatedAt: showtime.updatedAt.toISOString(),
  };
}

type AdminShowtimeSortMode = "schedule" | "recent";

type AdminShowtimeDateRange = {
  dateKey: string;
  start: Date;
  end: Date;
};

function getAdminShowtimeSortMode(request: IncomingMessage): AdminShowtimeSortMode {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const sort = requestUrl.searchParams.get("sort");

  return sort === "recent" ? "recent" : "schedule";
}

function getNowShowingMovieWhere(dateRange?: AdminShowtimeDateRange): Prisma.MovieWhereInput {
  const filters: Prisma.MovieWhereInput[] = [{ status: "NOW_SHOWING" }];

  if (dateRange) {
    filters.push(
      {
        OR: [
          { releaseDate: null },
          {
            releaseDate: {
              lt: dateRange.end,
            },
          },
        ],
      },
      {
        OR: [
          { endDate: null },
          {
            endDate: {
              gte: dateRange.start,
            },
          },
        ],
      },
    );
  }

  return filters.length === 1 ? filters[0] : { AND: filters };
}

function isNowShowingMovieInRange(
  movie: Pick<AdminShowtimeRecord["movie"], "status" | "releaseDate" | "endDate">,
  dateRange: AdminShowtimeDateRange,
) {
  return (
    movie.status === "NOW_SHOWING" &&
    (!movie.releaseDate || movie.releaseDate < dateRange.end) &&
    (!movie.endDate || movie.endDate >= dateRange.start)
  );
}

async function fetchAdminShowtimes(
  sortMode: AdminShowtimeSortMode = "schedule",
  dateRange?: AdminShowtimeDateRange,
) {
  const where: Prisma.ShowtimeWhereInput = {
    movie: getNowShowingMovieWhere(dateRange),
  };

  if (dateRange) {
    where.startTime = {
      gte: dateRange.start,
      lt: dateRange.end,
    };
  }

  return prisma.showtime.findMany({
    where,
    orderBy:
      sortMode === "recent"
        ? [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }]
        : [{ startTime: "desc" }, { id: "desc" }],
    include: adminShowtimeInclude,
  });
}

async function fetchAdminShowtimeById(showtimeId: number) {
  return prisma.showtime.findUnique({
    where: {
      id: showtimeId,
    },
    include: adminShowtimeInclude,
  });
}

async function fetchAdminShowtimeOptions(dateRange?: AdminShowtimeDateRange) {
  const [movies, rooms] = await Promise.all([
    prisma.movie.findMany({
      where: getNowShowingMovieWhere(dateRange),
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
        duration: true,
      },
    }),
    prisma.room.findMany({
      orderBy: [{ cinemaId: "asc" }, { name: "asc" }],
      include: {
        cinema: true,
      },
    }),
  ]);

  return {
    movies: movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      duration: movie.duration,
    })),
    rooms: rooms.map((room) => ({
      id: room.id,
      name: room.name,
      totalSeats: room.totalSeats,
      cinemaId: room.cinema.id,
      cinemaName: room.cinema.name,
    })),
  };
}

async function findOverlappingAdminShowtime(params: {
  roomId: number;
  startTime: Date;
  endTime: Date;
  excludeShowtimeId?: number;
}) {
  const where: Prisma.ShowtimeWhereInput = {
    roomId: params.roomId,
    startTime: {
      lt: params.endTime,
    },
    endTime: {
      gt: params.startTime,
    },
  };

  if (params.excludeShowtimeId) {
    where.id = {
      not: params.excludeShowtimeId,
    };
  }

  return prisma.showtime.findFirst({
    where,
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
    select: {
      id: true,
      startTime: true,
      endTime: true,
      movie: {
        select: {
          title: true,
        },
      },
    },
  });
}

function formatShowtimeConflictMessage(
  conflictingShowtime: NonNullable<Awaited<ReturnType<typeof findOverlappingAdminShowtime>>>,
) {
  return `Phòng chiếu đã có suất "${conflictingShowtime.movie.title}" từ ${formatDateTimeLabel(
    conflictingShowtime.startTime,
  )} đến ${timeFormatter.format(
    conflictingShowtime.endTime,
  )}. Không thể tạo hai suất chiếu trùng hoặc giao nhau trong cùng phòng.`;
}

async function getAdminShowtimeRequestUser(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để quản lý lịch chiếu." });
    return null;
  }

  if (!isAdminUser(user)) {
    sendJson(response, 403, { message: "Bạn không có quyền quản lý lịch chiếu." });
    return null;
  }

  return user;
}

async function handleGetAdminShowtimes(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminShowtimeRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const dateKey = requestUrl.searchParams.get("date")?.trim();
  const requestedDateRange = dateKey
    ? getVietnamDateRangeFromDateKey(dateKey)
    : getVietnamDateRange(new Date());

  if (!requestedDateRange) {
    sendJson(response, 400, { message: "Ngày chiếu không hợp lệ." });
    return;
  }

  const dateRange: AdminShowtimeDateRange = requestedDateRange;

  await refreshStaleTicketBookingShowtimes();

  const [showtimeRecords, options] = await Promise.all([
    fetchAdminShowtimes(getAdminShowtimeSortMode(request), dateRange),
    fetchAdminShowtimeOptions(dateRange),
  ]);
  const showtimes = showtimeRecords.map(serializeAdminShowtime);
  const todayKey = getDateKey(new Date());

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    showtimes,
    options,
    stats: {
      totalShowtimes: showtimes.length,
      todayShowtimes: showtimes.filter((showtime) => showtime.dateKey === todayKey).length,
      activeShowtimes: showtimes.filter((showtime) => showtime.statusCode === "ACTIVE").length,
      cancelledShowtimes: showtimes.filter((showtime) => showtime.statusCode === "CANCELLED").length,
      finishedShowtimes: showtimes.filter((showtime) => showtime.statusCode === "FINISHED").length,
      ticketsSold: showtimes.reduce((total, showtime) => total + showtime.ticketsSold, 0),
    },
  });
}

async function handleGetAdminShowtime(
  request: IncomingMessage,
  response: ServerResponse,
  showtimeId: number,
) {
  const requestUser = await getAdminShowtimeRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const showtime = await fetchAdminShowtimeById(showtimeId);

  if (!showtime) {
    sendJson(response, 404, { message: "Không tìm thấy suất chiếu." });
    return;
  }

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    showtime: serializeAdminShowtime(showtime),
  });
}

async function buildAdminShowtimeMutationData(
  body: JsonBody,
  existingShowtime?: AdminShowtimeRecord,
) {
  const movieId = numberBodyField(body, "movieId") || existingShowtime?.movieId || 0;
  const roomId = numberBodyField(body, "roomId") || existingShowtime?.roomId || 0;

  if (!movieId || !roomId) {
    return { error: "Vui lòng chọn phim và phòng chiếu." } as const;
  }

  const [movie, room] = await Promise.all([
    prisma.movie.findUnique({
      where: {
        id: movieId,
      },
      select: {
        id: true,
        duration: true,
        status: true,
        releaseDate: true,
        endDate: true,
      },
    }),
    prisma.room.findUnique({
      where: {
        id: roomId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!movie) {
    return { error: "Phim được chọn không tồn tại." } as const;
  }

  if (!room) {
    return { error: "Phòng chiếu được chọn không tồn tại." } as const;
  }

  const parsedStartTime = parseAdminShowtimeDateTimeField(
    body,
    "startTime",
    existingShowtime?.startTime,
  );
  const parsedBasePrice = parsePositiveNumberField(
    body,
    "basePrice",
    existingShowtime ? Number(existingShowtime.basePrice) : undefined,
  );
  const parsedStatus = parseAdminShowtimeStatus(body, existingShowtime?.status);

  if ("error" in parsedStartTime) {
    return { error: parsedStartTime.error } as const;
  }

  if ("error" in parsedBasePrice) {
    return { error: parsedBasePrice.error } as const;
  }

  if ("error" in parsedStatus) {
    return { error: parsedStatus.error } as const;
  }

  const startTime = parsedStartTime.value;

  if (!startTime) {
    return { error: "Vui lòng nhập thời gian bắt đầu." } as const;
  }

  if (!isNowShowingMovieInRange(movie, getVietnamDateRange(startTime))) {
    return {
      error: "Chỉ có thể tạo hoặc cập nhật suất chiếu cho phim đang chiếu trong ngày đã chọn.",
    } as const;
  }

  const endTime = new Date(
    startTime.getTime() + (movie.duration + showtimeChangeoverMinutes) * 60_000,
  );

  if (endTime <= startTime) {
    return { error: "Thời gian kết thúc phải sau thời gian bắt đầu." } as const;
  }

  const overlappingShowtime = await findOverlappingAdminShowtime({
    roomId,
    startTime,
    endTime,
    excludeShowtimeId: existingShowtime?.id,
  });

  if (overlappingShowtime) {
    return { error: formatShowtimeConflictMessage(overlappingShowtime) } as const;
  }

  return {
    data: {
      movieId,
      roomId,
      startTime,
      endTime,
      basePrice: parsedBasePrice.value,
      status: parsedStatus.value,
    },
  } as const;
}

async function handleCreateAdminShowtime(request: IncomingMessage, response: ServerResponse) {
  const requestUser = await getAdminShowtimeRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const body = await readJson(request);
  const result = await buildAdminShowtimeMutationData(body);

  if ("error" in result) {
    sendJson(response, 400, { message: result.error });
    return;
  }

  let createdShowtime: AdminShowtimeRecord;

  try {
    createdShowtime = await prisma.showtime.create({
      data: result.data,
      include: adminShowtimeInclude,
    });
  } catch (error) {
    if (isShowtimeOverlapConstraintError(error)) {
      sendJson(response, 409, {
        message:
          "Phòng chiếu đã có phim trong khung giờ này. Vui lòng chọn phòng hoặc thời gian khác.",
      });
      return;
    }

    throw error;
  }

  sendJson(response, 201, {
    message: "Thêm suất chiếu thành công.",
    showtime: serializeAdminShowtime(createdShowtime),
  });
}

async function handleUpdateAdminShowtime(
  request: IncomingMessage,
  response: ServerResponse,
  showtimeId: number,
) {
  const requestUser = await getAdminShowtimeRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingShowtime = await fetchAdminShowtimeById(showtimeId);

  if (!existingShowtime) {
    sendJson(response, 404, { message: "Không tìm thấy suất chiếu cần cập nhật." });
    return;
  }

  const body = await readJson(request);
  const result = await buildAdminShowtimeMutationData(body, existingShowtime);

  if ("error" in result) {
    sendJson(response, 400, { message: result.error });
    return;
  }

  let updatedShowtime: AdminShowtimeRecord;

  try {
    updatedShowtime = await prisma.showtime.update({
      where: {
        id: existingShowtime.id,
      },
      data: result.data,
      include: adminShowtimeInclude,
    });
  } catch (error) {
    if (isShowtimeOverlapConstraintError(error)) {
      sendJson(response, 409, {
        message:
          "Phòng chiếu đã có phim trong khung giờ này. Vui lòng chọn phòng hoặc thời gian khác.",
      });
      return;
    }

    throw error;
  }

  sendJson(response, 200, {
    message: "Cập nhật suất chiếu thành công.",
    showtime: serializeAdminShowtime(updatedShowtime),
  });
}

async function handleDeleteAdminShowtime(
  request: IncomingMessage,
  response: ServerResponse,
  showtimeId: number,
) {
  const requestUser = await getAdminShowtimeRequestUser(request, response);

  if (!requestUser) {
    return;
  }

  const existingShowtime = await prisma.showtime.findUnique({
    where: {
      id: showtimeId,
    },
    select: {
      id: true,
    },
  });

  if (!existingShowtime) {
    sendJson(response, 404, { message: "Không tìm thấy suất chiếu cần xóa." });
    return;
  }

  await prisma.showtime.delete({
    where: {
      id: existingShowtime.id,
    },
  });

  sendJson(response, 200, {
    message: "Xóa suất chiếu thành công.",
    deletedId: existingShowtime.id,
  });
}

function validateAvatarUrl(avatarUrl: string) {
  if (avatarUrl.startsWith("/")) {
    return "";
  }

  try {
    const url = new URL(avatarUrl);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return "";
    }
  } catch {
    // Continue validating as an uploaded data URL.
  }

  if (!avatarDataUrlPattern.test(avatarUrl)) {
    return "Ảnh đại diện chỉ hỗ trợ định dạng JPEG, PNG hoặc WEBP.";
  }

  const [, base64Data = ""] = avatarUrl.split(",", 2);
  const byteLength = Buffer.byteLength(base64Data, "base64");

  if (byteLength > avatarMaxBytes) {
    return "Dung lượng ảnh đại diện tối đa 10 MB.";
  }

  return "";
}

async function createRefreshToken(userId: number) {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

async function handleLogin(request: IncomingMessage, response: ServerResponse) {
  const body = await readJson(request);
  const identifier = stringField(body, "identifier") || stringField(body, "email");
  const password = stringField(body, "password");

  if (!identifier || !password) {
    sendJson(response, 400, { message: "Vui lòng nhập email/số điện thoại và mật khẩu." });
    return;
  }

  const normalizedIdentifier = identifier.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedIdentifier }, { phone: identifier }],
    },
    include: {
      role: true,
    },
  });

  if (!user || !(await isPasswordMatch(password, user.password))) {
    sendJson(response, 401, { message: "Email/số điện thoại hoặc mật khẩu không đúng." });
    return;
  }

  if (!user.isActive) {
    sendJson(response, 403, { message: "Tài khoản đã bị khóa." });
    return;
  }

  const token = await createRefreshToken(user.id);
  const authUser = serializeUser(user);

  sendJson(response, 200, {
    token,
    user: authUser,
    redirectTo: getRedirectTo(authUser.role),
  });
}

async function handleRegister(request: IncomingMessage, response: ServerResponse) {
  const body = await readJson(request);
  const fullName = stringField(body, "fullName");
  const email = stringField(body, "email").toLowerCase();
  const phone = stringField(body, "phone");
  const password = stringField(body, "password");

  if (!fullName || !email || !password) {
    sendJson(response, 400, { message: "Vui lòng nhập họ tên, email và mật khẩu." });
    return;
  }

  if (password.length < 6) {
    sendJson(response, 400, { message: "Mật khẩu cần tối thiểu 6 ký tự." });
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    sendJson(response, 409, { message: "Email này đã được đăng ký." });
    return;
  }

  const customerRole = await prisma.role.upsert({
    where: { name: "CUSTOMER" },
    update: {},
    create: {
      name: "CUSTOMER",
      description: "Khách hàng",
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      roleId: customerRole.id,
      fullName,
      email,
      phone: phone || null,
      password: hashedPassword,
      isActive: true,
    },
    include: {
      role: true,
    },
  });

  const token = await createRefreshToken(user.id);
  const authUser = serializeUser(user);

  sendJson(response, 201, {
    token,
    user: authUser,
    redirectTo: getRedirectTo(authUser.role),
  });
}

async function handleGetProfile(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để xem thông tin tài khoản." });
    return;
  }

  sendJson(response, 200, { user: serializeUser(user) });
}

async function handleUpdateProfile(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
    return;
  }

  const body = await readJson(request);
  const fullName = stringField(body, "fullName");
  const email = stringField(body, "email").toLowerCase();
  const phone = stringField(body, "phone");
  const avatarInput = Object.prototype.hasOwnProperty.call(body, "avatarUrl")
    ? body.avatarUrl
    : body.avatar;
  let avatar: string | null | undefined;

  if (!fullName || !email) {
    sendJson(response, 400, { message: "Vui lòng nhập họ tên và email." });
    return;
  }

  if (!emailPattern.test(email)) {
    sendJson(response, 400, { message: "Email không hợp lệ." });
    return;
  }

  if (avatarInput === null) {
    avatar = null;
  } else if (typeof avatarInput === "string") {
    avatar = avatarInput.trim() || null;

    if (avatar) {
      const avatarError = validateAvatarUrl(avatar);

      if (avatarError) {
        sendJson(response, 400, { message: avatarError });
        return;
      }
    }
  } else if (avatarInput !== undefined) {
    sendJson(response, 400, { message: "Ảnh đại diện không hợp lệ." });
    return;
  }

  const existingEmailOwner = await prisma.user.findFirst({
    where: {
      email,
      id: {
        not: user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingEmailOwner) {
    sendJson(response, 409, { message: "Email này đã được sử dụng bởi tài khoản khác." });
    return;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      fullName,
      email,
      phone: phone || null,
      ...(avatar !== undefined ? { avatar } : {}),
    },
    include: {
      role: true,
    },
  });

  sendJson(response, 200, { user: serializeUser(updatedUser) });
}

async function handleChangePassword(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
    return;
  }

  const body = await readJson(request);
  const currentPassword = stringField(body, "currentPassword");
  const newPassword = stringField(body, "newPassword");

  if (!currentPassword || !newPassword) {
    sendJson(response, 400, { message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới." });
    return;
  }

  if (newPassword.length < 6) {
    sendJson(response, 400, { message: "Mật khẩu mới cần tối thiểu 6 ký tự." });
    return;
  }

  if (!(await isPasswordMatch(currentPassword, user.password))) {
    sendJson(response, 401, { message: "Mật khẩu hiện tại không đúng." });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  sendJson(response, 200, { message: "Đổi mật khẩu thành công." });
}

async function expireOverduePendingBookings(userId?: number) {
  const cutoff = new Date(Date.now() - pendingPaymentWindowMs);

  await prisma.payment.updateMany({
    where: {
      status: "PENDING",
      createdAt: {
        lte: cutoff,
      },
      booking: {
        status: "PENDING",
        ...(userId ? { userId } : {}),
      },
    },
    data: {
      status: "FAILED",
      paymentUrl: null,
    },
  });

  await prisma.booking.updateMany({
    where: {
      ...(userId ? { userId } : {}),
      status: "PENDING",
      payments: {
        some: {
          status: "FAILED",
          createdAt: {
            lte: cutoff,
          },
        },
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

async function fetchUserBookingHistory(userId: number) {
  await expireOverduePendingBookings(userId);

  return prisma.booking.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      bookingDetails: {
        orderBy: {
          id: "asc",
        },
        include: {
          seat: {
            include: {
              seatType: true,
            },
          },
          showtime: {
            include: {
              movie: {
                include: {
                  movieImages: {
                    orderBy: {
                      sortOrder: "asc",
                    },
                  },
                },
              },
              room: {
                include: {
                  cinema: true,
                },
              },
            },
          },
        },
      },
      tickets: {
        select: {
          id: true,
          ticketCode: true,
          qrCode: true,
          status: true,
        },
      },
    },
  });
}

type BookingHistoryRecord = Awaited<ReturnType<typeof fetchUserBookingHistory>>[number];

function serializeBookingHistoryItem(booking: BookingHistoryRecord) {
  const payment = booking.payments[0] ?? null;
  const primaryDetail = booking.bookingDetails[0];
  const primaryShowtime = primaryDetail?.showtime ?? null;
  const primaryMovie = primaryShowtime?.movie ?? null;
  const primaryRoom = primaryShowtime?.room ?? null;
  const paymentCreatedAt = payment?.createdAt ?? booking.createdAt;
  const paymentDeadlineAt =
    payment?.status === "PENDING"
      ? new Date(paymentCreatedAt.getTime() + pendingPaymentWindowMs)
      : null;
  const remainingPaymentSeconds = paymentDeadlineAt
    ? Math.max(0, Math.floor((paymentDeadlineAt.getTime() - Date.now()) / 1000))
    : 0;
  const finalAmount = Number(booking.finalAmount);
  const totalAmount = Number(booking.totalAmount);
  const discountAmount = Number(booking.discountAmount);
  const seatCodes = booking.bookingDetails.map((detail) => detail.seat.seatCode);
  const seatTypeNames = [
    ...new Set(booking.bookingDetails.map((detail) => detail.seat.seatType.name)),
  ];
  const posterUrl =
    primaryMovie?.posterUrl ?? primaryMovie?.movieImages[0]?.imageUrl ?? "/movies/demo.png";
  const bannerUrl = primaryMovie?.bannerUrl ?? posterUrl;

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    bookingStatus: booking.status,
    note: booking.note,
    customer: {
      fullName: booking.user.fullName,
      email: booking.user.email,
      phone: booking.user.phone,
    },
    amounts: {
      total: totalAmount,
      totalLabel: formatCurrency(totalAmount),
      discount: discountAmount,
      discountLabel: formatCurrency(discountAmount),
      final: finalAmount,
      finalLabel: formatCurrency(finalAmount),
    },
    movie: primaryMovie
      ? {
          id: primaryMovie.id,
          slug: primaryMovie.slug,
          title: primaryMovie.title,
          posterUrl,
          bannerUrl,
          duration: `${primaryMovie.duration} phút`,
          language: primaryMovie.language,
          ageLimit: primaryMovie.ageLimit,
        }
      : null,
    showtime: primaryShowtime
      ? {
          id: primaryShowtime.id,
          startTime: primaryShowtime.startTime.toISOString(),
          endTime: primaryShowtime.endTime.toISOString(),
          time: timeFormatter.format(primaryShowtime.startTime),
          date: fullDateFormatter.format(primaryShowtime.startTime),
          room: primaryRoom
            ? {
                id: primaryRoom.id,
                name: primaryRoom.name,
                cinema: {
                  id: primaryRoom.cinema.id,
                  name: primaryRoom.cinema.name,
                  address: primaryRoom.cinema.address,
                  city: primaryRoom.cinema.city,
                },
              }
            : null,
        }
      : null,
    seats: {
      count: seatCodes.length,
      codes: seatCodes,
      label: seatCodes.join(", "),
      types: seatTypeNames,
    },
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amount: Number(payment.amount),
          amountLabel: formatCurrency(Number(payment.amount)),
          transactionCode: payment.transactionCode,
          paymentUrl: payment.paymentUrl,
          createdAt: payment.createdAt.toISOString(),
          paidAt: payment.paidAt?.toISOString() ?? null,
          displayTime: (payment.paidAt ?? payment.createdAt).toISOString(),
          deadlineAt: paymentDeadlineAt?.toISOString() ?? null,
          remainingSeconds: remainingPaymentSeconds,
        }
      : {
          id: null,
          method: "MOMO",
          status: booking.status === "EXPIRED" ? "FAILED" : "PENDING",
          amount: finalAmount,
          amountLabel: formatCurrency(finalAmount),
          transactionCode: null,
          paymentUrl: null,
          createdAt: booking.createdAt.toISOString(),
          paidAt: null,
          displayTime: booking.createdAt.toISOString(),
          deadlineAt:
            booking.status === "PENDING"
              ? new Date(booking.createdAt.getTime() + pendingPaymentWindowMs).toISOString()
              : null,
          remainingSeconds:
            booking.status === "PENDING"
              ? Math.max(
                  0,
                  Math.floor(
                    (booking.createdAt.getTime() + pendingPaymentWindowMs - Date.now()) / 1000,
                  ),
                )
              : 0,
        },
    tickets: booking.tickets.map((ticket) => ({
      id: ticket.id,
      ticketCode: ticket.ticketCode,
      qrCode: ticket.qrCode,
      status: ticket.status,
    })),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

async function upsertPaidTicket(
  params: {
    bookingId: number;
    bookingCode: string;
    showtimeId: number;
    seatId: number;
    price: number;
    index: number;
  },
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const ticketCode = `${params.bookingCode}-${params.index + 1}`;
  const existingTicket = await client.ticket.findFirst({
    where: {
      showtimeId: params.showtimeId,
      seatId: params.seatId,
    },
  });

  if (existingTicket) {
    await client.ticket.update({
      where: {
        id: existingTicket.id,
      },
      data: {
        bookingId: params.bookingId,
        ticketCode,
        price: params.price,
        status: "ACTIVE",
        qrCode: `QR-${ticketCode}`,
        usedAt: null,
      },
    });
    return;
  }

  await client.ticket.create({
    data: {
      bookingId: params.bookingId,
      showtimeId: params.showtimeId,
      seatId: params.seatId,
      ticketCode,
      price: params.price,
      status: "ACTIVE",
      qrCode: `QR-${ticketCode}`,
    },
  });
}

async function handleGetBookingHistory(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để xem lịch sử đặt vé." });
    return;
  }

  const bookings = await fetchUserBookingHistory(user.id);

  sendJson(response, 200, {
    paymentWindowSeconds: pendingPaymentWindowMs / 1000,
    paymentMethods,
    bookings: bookings.map(serializeBookingHistoryItem),
  });
}

async function handlePayBooking(
  request: IncomingMessage,
  response: ServerResponse,
  bookingId: number,
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để thanh toán đơn hàng." });
    return;
  }

  const body = await readJson(request);
  const method = stringField(body, "method").toUpperCase();

  if (!paymentMethodSet.has(method)) {
    sendJson(response, 400, { message: "Phương thức thanh toán không hợp lệ." });
    return;
  }

  await expireOverduePendingBookings(user.id);

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId: user.id,
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
      bookingDetails: {
        orderBy: {
          id: "asc",
        },
      },
    },
  });

  if (!booking) {
    sendJson(response, 404, { message: "Không tìm thấy đơn đặt vé." });
    return;
  }

  const payment = booking.payments[0] ?? null;
  const paymentCreatedAt = payment?.createdAt ?? booking.createdAt;
  const paymentDeadlineAt = new Date(paymentCreatedAt.getTime() + pendingPaymentWindowMs);

  if (booking.status !== "PENDING" || payment?.status === "SUCCESS") {
    sendJson(response, 409, { message: "Đơn hàng này không còn ở trạng thái chờ thanh toán." });
    return;
  }

  if (Date.now() > paymentDeadlineAt.getTime()) {
    if (payment) {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
          paymentUrl: null,
        },
      });
    }

    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    sendJson(response, 409, { message: "Đơn hàng đã hết thời gian thanh toán." });
    return;
  }

  const paidAt = new Date();

  await prisma.$transaction(async (tx) => {
    if (payment) {
      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          method: method as (typeof paymentMethods)[number],
          status: "SUCCESS",
          paidAt,
          paymentUrl: null,
          transactionCode: payment.transactionCode ?? `${booking.bookingCode}-${method}`,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          method: method as (typeof paymentMethods)[number],
          status: "SUCCESS",
          amount: booking.finalAmount,
          transactionCode: `${booking.bookingCode}-${method}`,
          paidAt,
        },
      });
    }

    await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    for (let index = 0; index < booking.bookingDetails.length; index += 1) {
      const detail = booking.bookingDetails[index];

      await upsertPaidTicket(
        {
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          showtimeId: detail.showtimeId,
          seatId: detail.seatId,
          price: Number(detail.price),
          index,
        },
        tx,
      );
    }
  });

  const [updatedBooking] = await fetchUserBookingHistory(user.id).then((bookings) =>
    bookings.filter((item) => item.id === booking.id),
  );

  sendJson(response, 200, {
    message: "Thanh toán thành công.",
    booking: updatedBooking ? serializeBookingHistoryItem(updatedBooking) : null,
  });
}

async function fetchTicketBookingShowtimes() {
  await expireOverduePendingBookings();
  await refreshStaleTicketBookingShowtimes();

  const showtimes = await prisma.showtime.findMany({
    where: {
      status: ShowtimeStatus.ACTIVE,
      startTime: {
        gte: getStartOfToday(),
      },
    },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
    include: {
      movie: {
        include: {
          movieGenres: {
            include: {
              genre: true,
            },
          },
          movieImages: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          reviews: {
            where: {
              isHidden: false,
            },
            select: {
              rating: true,
            },
          },
        },
      },
      room: {
        include: {
          cinema: true,
          seats: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
      bookingDetails: {
        where: {
          booking: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            },
          },
        },
        select: {
          seatId: true,
          booking: {
            select: {
              status: true,
            },
          },
        },
      },
      seatHolds: {
        where: {
          status: HoldStatus.HOLDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          seatId: true,
        },
      },
    },
  });

  return filterNonOverlappingShowtimeRecords(showtimes);
}

async function refreshStaleTicketBookingShowtimes() {
  const startOfToday = getStartOfToday();
  const currentShowtimeCount = await prisma.showtime.count({
    where: {
      status: ShowtimeStatus.ACTIVE,
      startTime: {
        gte: startOfToday,
      },
    },
  });

  if (currentShowtimeCount > 0) {
    return;
  }

  const activeShowtimes = await prisma.showtime.findMany({
    where: {
      status: ShowtimeStatus.ACTIVE,
    },
    orderBy: [{ startTime: "desc" }, { id: "desc" }],
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
  });

  if (activeShowtimes.length === 0) {
    return;
  }

  const sourceDateKeys: string[] = [];

  for (const showtime of activeShowtimes) {
    const dateKey = getDateKey(showtime.startTime);

    if (!sourceDateKeys.includes(dateKey)) {
      sourceDateKeys.push(dateKey);
    }

    if (sourceDateKeys.length === demoShowtimeRefreshDayCount) {
      break;
    }
  }

  const sourceDateKeySet = new Set(sourceDateKeys);
  const targetDateBySourceDate = new Map(
    [...sourceDateKeys]
      .sort((leftDate, rightDate) => leftDate.localeCompare(rightDate))
      .map((sourceDateKey, index) => [sourceDateKey, getRelativeDateKey(index)]),
  );
  const updates = activeShowtimes
    .filter((showtime) => sourceDateKeySet.has(getDateKey(showtime.startTime)))
    .map((showtime) => {
      const sourceDateKey = getDateKey(showtime.startTime);
      const targetDateKey = targetDateBySourceDate.get(sourceDateKey) ?? getRelativeDateKey(0);
      const durationMs = showtime.endTime.getTime() - showtime.startTime.getTime();
      const startTime = makeVietnamDateTime(targetDateKey, showtime.startTime);
      const endTime = new Date(startTime.getTime() + durationMs);

      return prisma.showtime.update({
        where: {
          id: showtime.id,
        },
        data: {
          startTime,
          endTime,
        },
      });
    });

  if (updates.length === 0) {
    return;
  }

  await prisma.$transaction(updates);
}

type TicketBookingShowtimeRecord = Awaited<
  ReturnType<typeof fetchTicketBookingShowtimes>
>[number];

function serializeTicketBookingMovie(showtime: TicketBookingShowtimeRecord) {
  const movie = showtime.movie;
  const posterUrl = movie.posterUrl ?? movie.movieImages[0]?.imageUrl ?? "/movies/demo.png";
  const bannerUrl = movie.bannerUrl ?? posterUrl;

  return {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    description: movie.description ?? "",
    durationMinutes: movie.duration,
    duration: `${movie.duration} phút`,
    language: movie.language,
    country: movie.country,
    ageLimit: movie.ageLimit ?? "P",
    posterUrl,
    bannerUrl,
    rating: formatMovieRating(movie.reviews),
    genres: movie.movieGenres.map((movieGenre) => movieGenre.genre.name),
  };
}

function serializeTicketBookingShowtime(showtime: TicketBookingShowtimeRecord) {
  const reservedSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    reservedSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    reservedSeatIds.add(seatHold.seatId);
  }

  const totalSeats = showtime.room.totalSeats;
  const availableSeats = showtime.room.seats.filter(
    (seat) => seat.status === "ACTIVE" && !reservedSeatIds.has(seat.id),
  ).length;
  const basePrice = Number(showtime.basePrice);

  return {
    id: showtime.id,
    date: getDateKey(showtime.startTime),
    startTime: showtime.startTime.toISOString(),
    endTime: showtime.endTime.toISOString(),
    time: timeFormatter.format(showtime.startTime),
    basePrice,
    price: formatCurrency(basePrice),
    availableSeats,
    totalSeats,
    movieId: showtime.movie.id,
    movieSlug: showtime.movie.slug,
    cinemaSlug: showtime.room.cinema.slug,
    room: {
      id: showtime.room.id,
      name: showtime.room.name,
      totalRows: showtime.room.totalRows,
      totalColumns: showtime.room.totalColumns,
      totalSeats: showtime.room.totalSeats,
    },
    cinema: {
      id: showtime.room.cinema.id,
      slug: showtime.room.cinema.slug,
      name: showtime.room.cinema.name,
      address: showtime.room.cinema.address,
      city: showtime.room.cinema.city,
      district: showtime.room.cinema.district,
      ward: showtime.room.cinema.ward,
      phone: showtime.room.cinema.phone,
    },
  };
}

function buildTicketBookingDates(showtimes: ReturnType<typeof serializeTicketBookingShowtime>[]) {
  const todayKey = getRelativeDateKey(0);
  const tomorrowKey = getRelativeDateKey(1);
  const groupedDates = new Map<string, { firstStartTime: string; count: number }>();

  for (const showtime of showtimes) {
    const current = groupedDates.get(showtime.date);

    if (current) {
      current.count += 1;
      continue;
    }

    groupedDates.set(showtime.date, {
      firstStartTime: showtime.startTime,
      count: 1,
    });
  }

  return [...groupedDates.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, group]) => {
      const startTime = new Date(group.firstStartTime);
      const label =
        date === todayKey
          ? "Hôm nay"
          : date === tomorrowKey
            ? "Ngày mai"
            : dateLabelFormatter.format(startTime);

      return {
        value: date,
        label,
        dateLabel: fullDateFormatter.format(startTime),
        hint: `${group.count} suất chiếu`,
      };
    });
}

async function handleGetTicketBookingOptions(_request: IncomingMessage, response: ServerResponse) {
  const showtimeRecords = await fetchTicketBookingShowtimes();
  const movieById = new Map<number, ReturnType<typeof serializeTicketBookingMovie>>();
  const cinemaBySlug = new Map<
    string,
    {
      id: number;
      slug: string;
      name: string;
      address: string;
      city: string;
      district: string | null;
      ward: string | null;
      phone: string | null;
      imageUrl: string | null;
      roomCount: number;
    }
  >();

  const roomIdsByCinemaSlug = new Map<string, Set<number>>();
  const showtimes = showtimeRecords.map((showtime) => {
    const movie = serializeTicketBookingMovie(showtime);
    const serializedShowtime = serializeTicketBookingShowtime(showtime);
    const cinema = showtime.room.cinema;
    const roomIds = roomIdsByCinemaSlug.get(cinema.slug) ?? new Set<number>();

    movieById.set(movie.id, movie);
    roomIds.add(showtime.room.id);
    roomIdsByCinemaSlug.set(cinema.slug, roomIds);
    cinemaBySlug.set(cinema.slug, {
      id: cinema.id,
      slug: cinema.slug,
      name: cinema.name,
      address: cinema.address,
      city: cinema.city,
      district: cinema.district,
      ward: cinema.ward,
      phone: cinema.phone,
      imageUrl: cinema.imageUrl,
      roomCount: roomIds.size,
    });

    return serializedShowtime;
  });

  sendJson(response, 200, {
    generatedAt: new Date().toISOString(),
    paymentMethods: ticketBookingPaymentMethods,
    dates: buildTicketBookingDates(showtimes),
    movies: [...movieById.values()].sort((leftMovie, rightMovie) =>
      leftMovie.title.localeCompare(rightMovie.title),
    ),
    cinemas: [...cinemaBySlug.values()].sort((leftCinema, rightCinema) =>
      leftCinema.name.localeCompare(rightCinema.name),
    ),
    showtimes,
  });
}

async function fetchTicketBookingSeatMap(showtimeId: number) {
  await expireOverduePendingBookings();

  return prisma.showtime.findUnique({
    where: {
      id: showtimeId,
    },
    include: {
      movie: {
        include: {
          movieGenres: {
            include: {
              genre: true,
            },
          },
          movieImages: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          reviews: {
            where: {
              isHidden: false,
            },
            select: {
              rating: true,
            },
          },
        },
      },
      room: {
        include: {
          cinema: true,
          seats: {
            orderBy: [{ rowName: "asc" }, { seatNumber: "asc" }],
            include: {
              seatType: true,
              showtimePrices: {
                where: {
                  showtimeId,
                },
              },
            },
          },
        },
      },
      bookingDetails: {
        where: {
          booking: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            },
          },
        },
        select: {
          seatId: true,
          booking: {
            select: {
              status: true,
            },
          },
        },
      },
      seatHolds: {
        where: {
          status: HoldStatus.HOLDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          seatId: true,
        },
      },
    },
  });
}

type TicketBookingSeatMapRecord = NonNullable<
  Awaited<ReturnType<typeof fetchTicketBookingSeatMap>>
>;

function getSeatTypeLabel(name: string) {
  switch (name) {
    case "NORMAL":
      return "Thường";
    case "VIP":
      return "VIP";
    case "COUPLE":
      return "Ghế đôi";
    default:
      return name;
  }
}

function getTicketBookingSeatAvailability(params: {
  seatStatus: string;
  isBooked: boolean;
  isPendingPayment: boolean;
}) {
  if (params.isBooked) {
    return {
      status: "BOOKED",
      label: "Đã đặt",
      isAvailable: false,
    };
  }

  if (params.isPendingPayment) {
    return {
      status: "PENDING_PAYMENT",
      label: "Đang chờ thanh toán",
      isAvailable: false,
    };
  }

  if (params.seatStatus === "BROKEN") {
    return {
      status: "MAINTENANCE",
      label: "Bảo trì",
      isAvailable: false,
    };
  }

  if (params.seatStatus === "LOCKED") {
    return {
      status: "LOCKED",
      label: "Tạm khóa",
      isAvailable: false,
    };
  }

  return {
    status: "AVAILABLE",
    label: "Có thể chọn",
    isAvailable: true,
  };
}

function serializeTicketBookingSeatMap(showtime: TicketBookingSeatMapRecord) {
  const bookedSeatIds = new Set<number>();
  const pendingPaymentSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    if (bookingDetail.booking.status === BookingStatus.CONFIRMED) {
      bookedSeatIds.add(bookingDetail.seatId);
      continue;
    }

    pendingPaymentSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    pendingPaymentSeatIds.add(seatHold.seatId);
  }

  const showtimeForSerialization = {
    ...showtime,
    seatHolds: showtime.seatHolds,
    bookingDetails: showtime.bookingDetails,
  } satisfies TicketBookingShowtimeRecord;

  return {
    showtime: serializeTicketBookingShowtime(showtimeForSerialization),
    movie: serializeTicketBookingMovie(showtimeForSerialization),
    room: {
      id: showtime.room.id,
      name: showtime.room.name,
      totalRows: showtime.room.totalRows,
      totalColumns: showtime.room.totalColumns,
      totalSeats: showtime.room.totalSeats,
    },
    cinema: {
      id: showtime.room.cinema.id,
      slug: showtime.room.cinema.slug,
      name: showtime.room.cinema.name,
      address: showtime.room.cinema.address,
      city: showtime.room.cinema.city,
    },
    seats: showtime.room.seats.map((seat) => {
      const price = Number(seat.showtimePrices[0]?.price ?? showtime.basePrice);
      const availability = getTicketBookingSeatAvailability({
        seatStatus: seat.status,
        isBooked: bookedSeatIds.has(seat.id),
        isPendingPayment: pendingPaymentSeatIds.has(seat.id),
      });

      return {
        id: seat.id,
        seatCode: seat.seatCode,
        rowName: seat.rowName,
        seatNumber: seat.seatNumber,
        status: seat.status,
        availabilityStatus: availability.status,
        statusLabel: availability.label,
        price,
        priceLabel: formatCurrency(price),
        isAvailable: availability.isAvailable,
        unavailableReason: availability.isAvailable ? null : availability.label,
        type: {
          id: seat.seatType.id,
          name: seat.seatType.name,
          label: getSeatTypeLabel(seat.seatType.name),
          priceExtra: Number(seat.seatType.priceExtra),
        },
      };
    }),
  };
}

async function handleGetTicketBookingSeats(
  _request: IncomingMessage,
  response: ServerResponse,
  showtimeId: number,
) {
  const showtime = await fetchTicketBookingSeatMap(showtimeId);

  if (!showtime) {
    sendJson(response, 404, { message: "Không tìm thấy suất chiếu." });
    return;
  }

  sendJson(response, 200, serializeTicketBookingSeatMap(showtime));
}

async function createUniqueBookingCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `CX${getDateKey(new Date()).replace(/-/g, "")}${randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;
    const existingBooking = await prisma.booking.findUnique({
      where: {
        bookingCode: code,
      },
      select: {
        id: true,
      },
    });

    if (!existingBooking) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã đơn hàng.");
}

type PromotionValidationResult =
  | {
      ok: true;
      promotion: Promotion;
      discountAmount: number;
      finalAmount: number;
    }
  | {
      ok: false;
      message: string;
    };

function normalizePromotionCode(code: string) {
  return code.trim().toUpperCase();
}

function calculatePromotionDiscount(totalAmount: number, promotion: Promotion) {
  if (promotion.type === "PERCENT") {
    const rawDiscount = Math.round((totalAmount * (promotion.discountPercent ?? 0)) / 100);
    const maxDiscount =
      promotion.maxDiscount === null ? rawDiscount : Number(promotion.maxDiscount);

    return Math.min(rawDiscount, maxDiscount, totalAmount);
  }

  return Math.min(Number(promotion.discountAmount ?? 0), totalAmount);
}

async function validateTicketBookingPromotion(
  code: string,
  totalAmount: number,
): Promise<PromotionValidationResult> {
  const normalizedCode = normalizePromotionCode(code);

  if (!normalizedCode) {
    return {
      ok: false,
      message: "Vui lòng nhập mã giảm giá.",
    };
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return {
      ok: false,
      message: "Vui lòng chọn ghế trước khi áp dụng mã giảm giá.",
    };
  }

  const promotion = await prisma.promotion.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (!promotion) {
    return {
      ok: false,
      message: "Mã giảm giá không tồn tại.",
    };
  }

  const now = new Date();

  if (!promotion.isActive || promotion.startDate > now || promotion.endDate < now) {
    return {
      ok: false,
      message: "Mã giảm giá không còn hiệu lực.",
    };
  }

  if (promotion.usedQuantity >= promotion.quantity) {
    return {
      ok: false,
      message: "Mã giảm giá đã hết lượt sử dụng.",
    };
  }

  const minOrderAmount = Number(promotion.minOrderAmount ?? 0);

  if (totalAmount < minOrderAmount) {
    return {
      ok: false,
      message: `Mã giảm giá chỉ áp dụng cho đơn từ ${formatCurrency(minOrderAmount)}.`,
    };
  }

  const discountAmount = calculatePromotionDiscount(totalAmount, promotion);

  if (discountAmount <= 0) {
    return {
      ok: false,
      message: "Mã giảm giá không áp dụng được cho đơn hàng này.",
    };
  }

  return {
    ok: true,
    promotion,
    discountAmount,
    finalAmount: Math.max(totalAmount - discountAmount, 0),
  };
}

function serializeTicketBookingPromotion(
  result: Extract<PromotionValidationResult, { ok: true }>,
  totalAmount: number,
) {
  return {
    message: `Đã áp dụng mã ${result.promotion.code}.`,
    code: result.promotion.code,
    name: result.promotion.name,
    description: result.promotion.description,
    discountAmount: result.discountAmount,
    discountLabel: formatCurrency(result.discountAmount),
    totalAmount,
    totalLabel: formatCurrency(totalAmount),
    finalAmount: result.finalAmount,
    finalLabel: formatCurrency(result.finalAmount),
  };
}

async function handleApplyTicketBookingPromotion(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const body = await readJson(request);
  const code = stringField(body, "code");
  const totalAmount = Number(body.totalAmount);
  const result = await validateTicketBookingPromotion(code, totalAmount);

  if (result.ok === false) {
    sendJson(response, 400, { message: result.message });
    return;
  }

  sendJson(response, 200, serializeTicketBookingPromotion(result, totalAmount));
}

async function handleCreateTicketBooking(request: IncomingMessage, response: ServerResponse) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    sendJson(response, 401, { message: "Vui lòng đăng nhập để đặt vé." });
    return;
  }

  const body = await readJson(request);
  const showtimeId = Number(body.showtimeId);
  const rawSeatIds = Array.isArray(body.seatIds) ? body.seatIds : [];
  const seatIds = [...new Set(rawSeatIds.map((value) => Number(value)).filter(Number.isInteger))];
  const paymentMethod = stringField(body, "paymentMethod").toUpperCase();
  const promotionCode = normalizePromotionCode(stringField(body, "promotionCode"));

  if (!Number.isInteger(showtimeId) || showtimeId < 1) {
    sendJson(response, 400, { message: "Suất chiếu không hợp lệ." });
    return;
  }

  if (seatIds.length === 0) {
    sendJson(response, 400, { message: "Vui lòng chọn ít nhất một ghế." });
    return;
  }

  if (seatIds.length > 10) {
    sendJson(response, 400, { message: "Mỗi đơn hàng chỉ được chọn tối đa 10 ghế." });
    return;
  }

  if (!ticketBookingPaymentMethodSet.has(paymentMethod)) {
    sendJson(response, 400, { message: "Phương thức thanh toán không hợp lệ." });
    return;
  }

  await expireOverduePendingBookings();

  const showtime = await prisma.showtime.findUnique({
    where: {
      id: showtimeId,
    },
    include: {
      bookingDetails: {
        where: {
          booking: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            },
          },
        },
        select: {
          seatId: true,
        },
      },
      seatHolds: {
        where: {
          status: HoldStatus.HOLDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: {
          seatId: true,
        },
      },
    },
  });

  if (!showtime || showtime.status !== ShowtimeStatus.ACTIVE) {
    sendJson(response, 404, { message: "Không tìm thấy suất chiếu đang mở bán." });
    return;
  }

  const seats = await prisma.seat.findMany({
    where: {
      id: {
        in: seatIds,
      },
      roomId: showtime.roomId,
      status: "ACTIVE",
    },
    orderBy: [{ rowName: "asc" }, { seatNumber: "asc" }],
    include: {
      seatType: true,
      showtimePrices: {
        where: {
          showtimeId,
        },
      },
    },
  });

  if (seats.length !== seatIds.length) {
    sendJson(response, 400, { message: "Danh sách ghế không hợp lệ." });
    return;
  }

  const reservedSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    reservedSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    reservedSeatIds.add(seatHold.seatId);
  }

  const unavailableSeats = seats.filter((seat) => reservedSeatIds.has(seat.id));

  if (unavailableSeats.length > 0) {
    sendJson(response, 409, {
      message: `Ghế ${unavailableSeats.map((seat) => seat.seatCode).join(", ")} đã có người đặt.`,
    });
    return;
  }

  const lineItems = seats.map((seat) => {
    const price = Number(seat.showtimePrices[0]?.price ?? showtime.basePrice);

    return {
      seatId: seat.id,
      price,
    };
  });
  const totalAmount = lineItems.reduce((total, item) => total + item.price, 0);
  const promotionResult = promotionCode
    ? await validateTicketBookingPromotion(promotionCode, totalAmount)
    : null;

  if (promotionResult && promotionResult.ok === false) {
    sendJson(response, 400, { message: promotionResult.message });
    return;
  }

  const appliedPromotion = promotionResult?.ok ? promotionResult : null;
  const discountAmount = appliedPromotion?.discountAmount ?? 0;
  const finalAmount = appliedPromotion?.finalAmount ?? totalAmount;
  const bookingCode = await createUniqueBookingCode();

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId: user.id,
          bookingCode,
          totalAmount,
          discountAmount,
          finalAmount,
          status: "PENDING",
          note: "Đơn hàng được tạo từ trang đặt vé.",
        },
      });

      await tx.bookingDetail.createMany({
        data: lineItems.map((item) => ({
          bookingId: createdBooking.id,
          showtimeId,
          seatId: item.seatId,
          price: item.price,
        })),
      });

      if (appliedPromotion) {
        const promotionUpdate = await tx.promotion.updateMany({
          where: {
            id: appliedPromotion.promotion.id,
            isActive: true,
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
            usedQuantity: {
              lt: appliedPromotion.promotion.quantity,
            },
          },
          data: {
            usedQuantity: {
              increment: 1,
            },
          },
        });

        if (promotionUpdate.count !== 1) {
          throw new Error("PROMOTION_UNAVAILABLE");
        }

        await tx.bookingPromotion.create({
          data: {
            bookingId: createdBooking.id,
            promotionId: appliedPromotion.promotion.id,
            discountAmount,
          },
        });
      }

      await tx.payment.create({
        data: {
          bookingId: createdBooking.id,
          method: paymentMethod as (typeof paymentMethods)[number],
          status: "PENDING",
          amount: finalAmount,
          transactionCode: `${bookingCode}-${paymentMethod}`,
          paymentUrl: null,
        },
      });

      return createdBooking;
    });

    sendJson(response, 201, {
      message: "Tạo đơn đặt vé thành công. Vui lòng hoàn tất thanh toán trong 5 phút.",
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        paymentDeadlineAt: new Date(Date.now() + pendingPaymentWindowMs).toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROMOTION_UNAVAILABLE") {
      sendJson(response, 409, {
        message: "Mã giảm giá vừa hết hiệu lực hoặc hết lượt sử dụng. Vui lòng áp dụng lại.",
      });
      return;
    }

    sendJson(response, 409, {
      message: "Một hoặc nhiều ghế vừa được đặt bởi người khác. Vui lòng chọn lại ghế.",
    });
  }
}

type ChatbotAction = {
  label: string;
  href: string;
};

type ChatbotReplyOptions = {
  suggestions?: string[];
  actions?: ChatbotAction[];
};

const chatbotQuestionMaxLength = 700;
const chatbotListLimit = 5;
const chatbotDefaultSuggestions = [
  "Phim nào đang chiếu hôm nay?",
  "Lịch chiếu ngày mai",
  "Giá vé hiện tại",
];
const chatbotStopWords = new Set([
  "ai",
  "admin",
  "anh",
  "bao",
  "ban",
  "bang",
  "bao",
  "cho",
  "chieu",
  "cinex",
  "co",
  "con",
  "cua",
  "dang",
  "dat",
  "duoc",
  "gi",
  "ghe",
  "gio",
  "hay",
  "hoi",
  "hom",
  "khong",
  "la",
  "lich",
  "minh",
  "muon",
  "nao",
  "nay",
  "ngay",
  "o",
  "phim",
  "rap",
  "sap",
  "suat",
  "tai",
  "the",
  "toi",
  "ve",
  "vao",
  "xem",
]);

function normalizeChatbotText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasChatbotKeyword(normalizedQuestion: string, keywords: string[]) {
  return keywords.some((keyword) => normalizedQuestion.includes(keyword));
}

function getChatbotSearchTokens(normalizedQuestion: string) {
  return [
    ...new Set(
      normalizedQuestion
        .split(/\s+/)
        .filter((word) => word.length > 1 && !chatbotStopWords.has(word)),
    ),
  ];
}

function matchesChatbotTokens(tokens: string[], values: Array<string | null | undefined>) {
  if (tokens.length === 0) {
    return false;
  }

  const normalizedValue = normalizeChatbotText(values.filter(Boolean).join(" "));

  return tokens.every((token) => normalizedValue.includes(token));
}

function createChatbotReply(answer: string, options: ChatbotReplyOptions = {}) {
  return {
    source: "CINEX_AI_ASSISTANT",
    generatedAt: new Date().toISOString(),
    answer,
    suggestions: options.suggestions ?? chatbotDefaultSuggestions,
    actions: options.actions ?? [],
  };
}

function chatbotQuestionField(body: JsonBody) {
  const value = body.message ?? body.question;

  return typeof value === "string" ? value.trim() : "";
}

function getChatbotDateKey(normalizedQuestion: string) {
  if (/\b(hom nay|today)\b/.test(normalizedQuestion)) {
    return getRelativeDateKey(0);
  }

  if (/\b(ngay mai|mai|tomorrow)\b/.test(normalizedQuestion)) {
    return getRelativeDateKey(1);
  }

  const dateMatch = normalizedQuestion.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

  if (!dateMatch) {
    return null;
  }

  const day = Number.parseInt(dateMatch[1], 10);
  const month = Number.parseInt(dateMatch[2], 10);
  const currentYear = Number.parseInt(getDateKey(new Date()).slice(0, 4), 10);
  const rawYear = dateMatch[3] ? Number.parseInt(dateMatch[3], 10) : currentYear;
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const range = getVietnamDateRangeFromDateKey(dateKey);

  return range ? range.dateKey : null;
}

function getChatbotAvailableSeats(showtime: Awaited<ReturnType<typeof fetchTicketBookingShowtimes>>[number]) {
  const reservedSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    reservedSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    reservedSeatIds.add(seatHold.seatId);
  }

  return showtime.room.seats.filter(
    (seat) => seat.status === "ACTIVE" && !reservedSeatIds.has(seat.id),
  ).length;
}

function formatChatbotShowtime(showtime: Awaited<ReturnType<typeof fetchTicketBookingShowtimes>>[number]) {
  const availableSeats = getChatbotAvailableSeats(showtime);

  return `- ${timeFormatter.format(showtime.startTime)} ${fullDateFormatter.format(showtime.startTime)}: ${showtime.movie.title} tại ${showtime.room.cinema.name}, ${showtime.room.name}. Giá từ ${formatCurrency(Number(showtime.basePrice))}, còn ${availableSeats}/${showtime.room.totalSeats} ghế.`;
}

async function answerChatbotShowtimes(normalizedQuestion: string) {
  const dateKey = getChatbotDateKey(normalizedQuestion);
  const tokens = getChatbotSearchTokens(normalizedQuestion);
  const showtimes = await fetchTicketBookingShowtimes();
  let filteredShowtimes = showtimes;

  if (dateKey) {
    filteredShowtimes = filteredShowtimes.filter(
      (showtime) => getDateKey(showtime.startTime) === dateKey,
    );
  }

  if (tokens.length > 0) {
    const matchedShowtimes = filteredShowtimes.filter((showtime) =>
      matchesChatbotTokens(tokens, [
        showtime.movie.title,
        showtime.movie.description,
        showtime.room.cinema.name,
        showtime.room.cinema.address,
        showtime.room.name,
      ]),
    );

    if (matchedShowtimes.length > 0) {
      filteredShowtimes = matchedShowtimes;
    }
  }

  const visibleShowtimes = filteredShowtimes.slice(0, chatbotListLimit);

  if (visibleShowtimes.length === 0) {
    return createChatbotReply(
      dateKey
        ? `Mình chưa thấy suất chiếu nào vào ngày ${dateKey}. Bạn có thể thử hỏi "lịch chiếu hôm nay" hoặc xem trang đặt vé.`
        : "Mình chưa tìm thấy suất chiếu phù hợp. Bạn thử hỏi theo tên phim, tên rạp hoặc ngày chiếu nhé.",
      {
        actions: [{ label: "Mở đặt vé", href: "/ticket-booking" }],
      },
    );
  }

  const dateLabel = dateKey ? ` ngày ${dateKey}` : "";
  const answer = [
    `Mình tìm thấy ${filteredShowtimes.length} suất chiếu${dateLabel}. Một vài suất gần nhất:`,
    ...visibleShowtimes.map(formatChatbotShowtime),
    "Bạn có thể bấm vào trang đặt vé để chọn ghế và thanh toán.",
  ].join("\n");

  return createChatbotReply(answer, {
    suggestions: [
      "Còn ghế cho suất nào?",
      "Giá vé hiện tại",
      "Có khuyến mãi không?",
    ],
    actions: [{ label: "Đặt vé ngay", href: "/ticket-booking" }],
  });
}

async function answerChatbotMovies(status: MovieStatus) {
  const now = new Date();
  const movies = (
    await fetchHomeMovieRecords(now, {
      status,
      limit: chatbotListLimit,
      showtimeStartTime: {
        gte: getStartOfToday(),
      },
    })
  ).map(serializeHomeMovie);
  const statusLabel = status === "COMING_SOON" ? "sắp chiếu" : "đang chiếu";

  if (movies.length === 0) {
    return createChatbotReply(`Hiện CineX chưa có phim ${statusLabel} để hiển thị.`, {
      actions: [{ label: "Xem phim", href: "/movies/now-showing" }],
    });
  }

  const answer = [
    `Một số phim ${statusLabel} tại CineX:`,
    ...movies.map((movie) => {
      const genres = movie.genres.length > 0 ? ` - ${movie.genres.slice(0, 3).join(", ")}` : "";
      const showtimeHint =
        movie.showtimeDetails.length > 0
          ? `, có ${movie.showtimeDetails.length} suất đang mở bán`
          : "";

      return `- ${movie.title} (${movie.duration}, ${movie.ageRating})${genres}${showtimeHint}.`;
    }),
  ].join("\n");

  return createChatbotReply(answer, {
    suggestions: [
      "Lịch chiếu hôm nay",
      "Gợi ý phim hay",
      "Giá vé hiện tại",
    ],
    actions: [
      {
        label: status === "COMING_SOON" ? "Xem phim sắp chiếu" : "Xem phim đang chiếu",
        href: status === "COMING_SOON" ? "/movies/coming-soon" : "/movies/now-showing",
      },
    ],
  });
}

async function answerChatbotPrice() {
  const showtimes = await fetchTicketBookingShowtimes();
  const prices = showtimes
    .map((showtime) => Number(showtime.basePrice))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return createChatbotReply(
      "Hiện chưa có giá vé từ suất chiếu đang mở bán. Bạn quay lại sau hoặc liên hệ hotline demo ở góc màn hình nhé.",
    );
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceLabel =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return createChatbotReply(
    `Giá vé hiện tại đang nằm trong khoảng ${priceLabel}. Giá cuối cùng có thể thay đổi theo suất chiếu, loại ghế và mã khuyến mãi bạn áp dụng ở bước thanh toán.`,
    {
      suggestions: [
        "Có khuyến mãi không?",
        "Lịch chiếu hôm nay",
        "Cách đặt vé",
      ],
      actions: [{ label: "Kiểm tra suất chiếu", href: "/ticket-booking" }],
    },
  );
}

async function answerChatbotCinemas() {
  const cinemas = await prisma.cinema.findMany({
    orderBy: {
      id: "asc",
    },
    take: chatbotListLimit,
    select: {
      name: true,
      address: true,
      city: true,
      phone: true,
      email: true,
    },
  });

  if (cinemas.length === 0) {
    return createChatbotReply("CineX chưa có dữ liệu chi nhánh rạp trong hệ thống.");
  }

  const answer = [
    "Thông tin rạp CineX hiện có:",
    ...cinemas.map((cinema) => {
      const contact = cinema.phone ? ` Hotline: ${cinema.phone}.` : "";

      return `- ${cinema.name}: ${cinema.address}, ${cinema.city}.${contact}`;
    }),
    "Nút Zalo và Hotline ở góc màn hình đang để dạng demo theo yêu cầu.",
  ].join("\n");

  return createChatbotReply(answer, {
    suggestions: [
      "Lịch chiếu hôm nay",
      "Giá vé hiện tại",
      "Cách đặt vé",
    ],
    actions: [{ label: "Xem giới thiệu", href: "/about" }],
  });
}

function formatChatbotPromotionDiscount(promotion: Promotion) {
  if (promotion.type === "PERCENT") {
    const maxDiscount = promotion.maxDiscount ? `, tối đa ${formatCurrency(Number(promotion.maxDiscount))}` : "";

    return `${promotion.discountPercent ?? 0}%${maxDiscount}`;
  }

  return formatCurrency(Number(promotion.discountAmount ?? 0));
}

async function answerChatbotPromotions() {
  const now = new Date();
  const promotions = (
    await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        endDate: "asc",
      },
      take: chatbotListLimit * 2,
    })
  )
    .filter((promotion) => promotion.usedQuantity < promotion.quantity)
    .slice(0, chatbotListLimit);

  if (promotions.length === 0) {
    return createChatbotReply(
      "Hiện chưa có mã khuyến mãi còn hiệu lực. Khi có mã mới, bạn có thể nhập ở bước thanh toán để hệ thống tự tính giảm giá.",
      {
        actions: [{ label: "Đặt vé", href: "/ticket-booking" }],
      },
    );
  }

  const answer = [
    "Một số khuyến mãi đang còn hiệu lực:",
    ...promotions.map((promotion) => {
      const minOrder = promotion.minOrderAmount
        ? `, đơn từ ${formatCurrency(Number(promotion.minOrderAmount))}`
        : "";

      return `- ${promotion.code}: ${promotion.name}, giảm ${formatChatbotPromotionDiscount(promotion)}${minOrder}. Hết hạn ${fullDateFormatter.format(promotion.endDate)}.`;
    }),
    "Bạn nhập mã ở bước thanh toán để áp dụng.",
  ].join("\n");

  return createChatbotReply(answer, {
    suggestions: [
      "Giá vé hiện tại",
      "Cách đặt vé",
      "Lịch chiếu hôm nay",
    ],
    actions: [{ label: "Đặt vé", href: "/ticket-booking" }],
  });
}

function answerChatbotBookingGuide() {
  return createChatbotReply(
    [
      "Quy trình đặt vé CineX:",
      "1. Chọn phim, ngày chiếu, rạp và suất chiếu.",
      "2. Chọn ghế còn trống trên sơ đồ phòng.",
      "3. Nhập mã khuyến mãi nếu có.",
      "4. Thanh toán và kiểm tra vé trong lịch sử đặt vé.",
      "Nếu gặp lỗi thanh toán, bạn có thể dùng nút Chat AI/Admin để hỏi tiếp hoặc liên hệ hotline demo.",
    ].join("\n"),
    {
      suggestions: [
        "Lịch chiếu hôm nay",
        "Có khuyến mãi không?",
        "Giá vé hiện tại",
      ],
      actions: [{ label: "Mở đặt vé", href: "/ticket-booking" }],
    },
  );
}

async function answerChatbotMovieSearch(normalizedQuestion: string) {
  const tokens = getChatbotSearchTokens(normalizedQuestion);
  const now = new Date();
  const movies = (await fetchHomeMovieRecords(now)).map(serializeHomeMovie);
  const matchedMovies = movies
    .filter((movie) =>
      matchesChatbotTokens(tokens, [
        movie.title,
        movie.description,
        movie.director,
        movie.actors,
        movie.country,
        movie.language,
        ...movie.genres,
      ]),
    )
    .slice(0, 3);

  if (matchedMovies.length === 0) {
    return createChatbotReply(
      "Mình chưa có đủ dữ liệu để trả lời câu này. Bạn có thể hỏi về phim đang chiếu, lịch chiếu, giá vé, khuyến mãi, rạp hoặc cách đặt vé.",
      {
        suggestions: [
          "Phim nào đang chiếu?",
          "Lịch chiếu hôm nay",
          "Cách đặt vé",
        ],
      },
    );
  }

  const answer = [
    "Mình tìm thấy phim phù hợp:",
    ...matchedMovies.map((movie) => {
      const showtimeHint =
        movie.showtimeDetails.length > 0
          ? ` Có ${movie.showtimeDetails.length} suất đang mở bán.`
          : "";
      const genres = movie.genres.length > 0 ? ` Thể loại: ${movie.genres.join(", ")}.` : "";

      return `- ${movie.title}: ${movie.status}, ${movie.duration}, nhãn ${movie.ageRating}.${genres}${showtimeHint}`;
    }),
  ].join("\n");

  return createChatbotReply(answer, {
    suggestions: [
      "Lịch chiếu phim này",
      "Giá vé hiện tại",
      "Đặt vé thế nào?",
    ],
    actions: matchedMovies.map((movie) => ({
      label: movie.title,
      href: `/movies/${movie.id}`,
    })),
  });
}

async function generateChatbotAnswer(question: string) {
  const normalizedQuestion = normalizeChatbotText(question);

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "khuyen mai",
      "giam gia",
      "voucher",
      "ma uu dai",
      "ma ve",
      "coupon",
    ])
  ) {
    return answerChatbotPromotions();
  }

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "gia ve",
      "bao nhieu tien",
      "gia tien",
      "ticket price",
    ])
  ) {
    return answerChatbotPrice();
  }

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "dia chi",
      "chi nhanh",
      "hotline",
      "lien he",
      "zalo",
      "rap nao",
      "rap o dau",
    ])
  ) {
    return answerChatbotCinemas();
  }

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "dat ve",
      "thanh toan",
      "chon ghe",
      "doi ve",
      "hoan ve",
      "lich su dat ve",
      "dang nhap",
    ])
  ) {
    return answerChatbotBookingGuide();
  }

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "lich chieu",
      "suat chieu",
      "gio chieu",
      "hom nay",
      "ngay mai",
    ])
  ) {
    return answerChatbotShowtimes(normalizedQuestion);
  }

  if (hasChatbotKeyword(normalizedQuestion, ["sap chieu", "coming soon"])) {
    return answerChatbotMovies("COMING_SOON");
  }

  if (
    hasChatbotKeyword(normalizedQuestion, [
      "dang chieu",
      "phim nao",
      "phim gi",
      "goi y phim",
      "movie",
    ])
  ) {
    return answerChatbotMovies("NOW_SHOWING");
  }

  return answerChatbotMovieSearch(normalizedQuestion);
}

async function handleChatbotQuestion(request: IncomingMessage, response: ServerResponse) {
  const body = await readJson(request);
  const question = chatbotQuestionField(body);

  if (!question) {
    sendJson(response, 400, { message: "Vui lòng nhập câu hỏi cho Chat AI/Admin." });
    return;
  }

  if (question.length > chatbotQuestionMaxLength) {
    sendJson(response, 400, {
      message: `Câu hỏi tối đa ${chatbotQuestionMaxLength} ký tự.`,
    });
    return;
  }

  const reply = await generateChatbotAnswer(question);

  sendJson(response, 200, reply);
}

async function handleRequest(request: IncomingMessage, response: ServerResponse) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  try {
    if (request.method === "GET" && requestUrl.pathname === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/home") {
      const homePageData = await loadHomePageData();
      sendJson(response, 200, homePageData);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/chatbot/ask") {
      await handleChatbotQuestion(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/booking/options") {
      await handleGetTicketBookingOptions(request, response);
      return;
    }

    const bookingSeatsMatch = requestUrl.pathname.match(/^\/api\/booking\/showtimes\/(\d+)\/seats$/);

    if (request.method === "GET" && bookingSeatsMatch) {
      const showtimeId = Number.parseInt(bookingSeatsMatch[1], 10);
      await handleGetTicketBookingSeats(request, response, showtimeId);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/booking/promotions/apply") {
      await handleApplyTicketBookingPromotion(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/booking/checkout") {
      await handleCreateTicketBooking(request, response);
      return;
    }

    const movieReviewMatch = requestUrl.pathname.match(/^\/api\/movies\/(\d+)\/reviews$/);

    if (request.method === "POST" && movieReviewMatch) {
      const movieId = Number.parseInt(movieReviewMatch[1], 10);
      await handleCreateMovieReview(request, response, movieId);
      return;
    }

    const movieRecommendationsMatch = requestUrl.pathname.match(
      /^\/api\/movies\/(\d+)\/recommendations$/,
    );

    if (request.method === "GET" && movieRecommendationsMatch) {
      const movieId = Number.parseInt(movieRecommendationsMatch[1], 10);
      const recommendationData = await loadMovieRecommendationsData(request, movieId);

      if (!recommendationData) {
        sendJson(response, 404, { message: "Khong tim thay phim." });
        return;
      }

      sendJson(response, 200, recommendationData);
      return;
    }

    const movieDetailMatch = requestUrl.pathname.match(/^\/api\/movies\/(\d+)$/);

    if (request.method === "GET" && movieDetailMatch) {
      const movieId = Number.parseInt(movieDetailMatch[1], 10);
      const movieDetailData = await loadMovieDetailData(movieId);

      if (!movieDetailData) {
        sendJson(response, 404, { message: "Khong tim thay phim." });
        return;
      }

      sendJson(response, 200, movieDetailData);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/movies/now-showing") {
      const catalogDateRange = getCatalogDateRange(requestUrl.searchParams);
      const movieCatalogData = await loadNowShowingCatalogData({
        page: positiveIntegerParam(requestUrl.searchParams, "page", 1),
        pageSize: positiveIntegerParam(
          requestUrl.searchParams,
          "pageSize",
          catalogPageSize,
          maxCatalogPageSize,
        ),
        dateRange: catalogDateRange ?? undefined,
      });
      sendJson(response, 200, movieCatalogData);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/movies/coming-soon") {
      const catalogDateRange = getCatalogDateRange(requestUrl.searchParams);
      const movieCatalogData = await loadMovieCatalogData("COMING_SOON", {
        page: positiveIntegerParam(requestUrl.searchParams, "page", 1),
        pageSize: positiveIntegerParam(
          requestUrl.searchParams,
          "pageSize",
          catalogPageSize,
          maxCatalogPageSize,
        ),
        releaseDateRange: catalogDateRange ?? undefined,
      });
      sendJson(response, 200, movieCatalogData);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/login") {
      await handleLogin(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/auth/register") {
      await handleRegister(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/admin/accounts") {
      await handleGetAdminAccounts(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/admin/accounts") {
      await handleCreateAdminAccount(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/admin/movies") {
      await handleGetAdminMovies(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/admin/movies") {
      await handleCreateAdminMovie(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/admin/movies/upload-image") {
      await handleUploadAdminMovieImage(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/admin/genres") {
      await handleGetAdminGenres(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/admin/showtimes") {
      await handleGetAdminShowtimes(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/admin/showtimes") {
      await handleCreateAdminShowtime(request, response);
      return;
    }

    const adminAccountMatch = requestUrl.pathname.match(/^\/api\/admin\/accounts\/(\d+)$/);

    if (adminAccountMatch) {
      const accountId = Number.parseInt(adminAccountMatch[1], 10);

      if (request.method === "PUT") {
        await handleUpdateAdminAccount(request, response, accountId);
        return;
      }

      if (request.method === "DELETE") {
        await handleDeleteAdminAccount(request, response, accountId);
        return;
      }
    }

    const adminMovieMatch = requestUrl.pathname.match(/^\/api\/admin\/movies\/(\d+)$/);

    if (adminMovieMatch) {
      const movieId = Number.parseInt(adminMovieMatch[1], 10);

      if (request.method === "GET") {
        await handleGetAdminMovie(request, response, movieId);
        return;
      }

      if (request.method === "PUT") {
        await handleUpdateAdminMovie(request, response, movieId);
        return;
      }

      if (request.method === "DELETE") {
        await handleDeleteAdminMovie(request, response, movieId);
        return;
      }
    }

    const adminShowtimeMatch = requestUrl.pathname.match(/^\/api\/admin\/showtimes\/(\d+)$/);

    if (adminShowtimeMatch) {
      const showtimeId = Number.parseInt(adminShowtimeMatch[1], 10);

      if (request.method === "GET") {
        await handleGetAdminShowtime(request, response, showtimeId);
        return;
      }

      if (request.method === "PUT") {
        await handleUpdateAdminShowtime(request, response, showtimeId);
        return;
      }

      if (request.method === "DELETE") {
        await handleDeleteAdminShowtime(request, response, showtimeId);
        return;
      }
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/account/profile") {
      await handleGetProfile(request, response);
      return;
    }

    if (request.method === "PUT" && requestUrl.pathname === "/api/account/profile") {
      await handleUpdateProfile(request, response);
      return;
    }

    if (request.method === "PUT" && requestUrl.pathname === "/api/account/password") {
      await handleChangePassword(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/account/bookings") {
      await handleGetBookingHistory(request, response);
      return;
    }

    const accountBookingPayMatch = requestUrl.pathname.match(/^\/api\/account\/bookings\/(\d+)\/pay$/);

    if (request.method === "POST" && accountBookingPayMatch) {
      const bookingId = Number.parseInt(accountBookingPayMatch[1], 10);
      await handlePayBooking(request, response, bookingId);
      return;
    }

    sendJson(response, 404, { message: "Endpoint không tồn tại." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
    sendJson(response, 500, { message });
  }
}

const server = http.createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, () => {
  console.log(`CineX auth API is running at http://localhost:${port}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
