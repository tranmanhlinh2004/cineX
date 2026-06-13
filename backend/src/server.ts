import "dotenv/config";
import bcrypt from "bcrypt";
import {
  BookingStatus,
  HoldStatus,
  PrismaClient,
  ShowtimeStatus,
  type MovieStatus,
  type Prisma,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "node:crypto";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
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
const maxJsonBodyLength = 15_000_000;
const avatarMaxBytes = 10 * 1024 * 1024;
const avatarDataUrlPattern = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
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
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function getDateKey(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
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

function getMovieInclude(now: Date) {
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
            fullName: true,
          },
        },
      },
    },
    showtimes: {
      where: {
        status: ShowtimeStatus.ACTIVE,
        startTime: {
          gte: now,
        },
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
  options: { status?: MovieStatus; limit?: number; offset?: number } = {},
) {
  const shouldOrderByLatest =
    options.limit !== undefined || options.offset !== undefined;

  return prisma.movie.findMany({
    where: options.status
      ? {
          status: options.status,
        }
      : undefined,
    orderBy: shouldOrderByLatest
      ? [{ updatedAt: "desc" }, { createdAt: "desc" }, { id: "desc" }]
      : undefined,
    skip: options.offset,
    take: options.limit,
    include: getMovieInclude(now),
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
  const [movieRecords, cinemaRecords] = await Promise.all([
    fetchHomeMovieRecords(now),
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

  const movies = movieRecords
    .map(serializeHomeMovie)
    .sort((leftMovie, rightMovie) => {
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
    });
  const nowShowingMovies = movies
    .filter((movie) => movie.statusCode === "NOW_SHOWING")
    .sort(compareLatestMovieRecords)
    .slice(0, homeSectionLimit);
  const comingSoonMovies = movies
    .filter((movie) => movie.statusCode === "COMING_SOON")
    .sort(compareLatestMovieRecords)
    .slice(0, homeSectionLimit);
  const heroMovies = (nowShowingMovies.length > 0 ? nowShowingMovies : movies)
    .filter((movie) => movie.bannerImage)
    .slice(0, 5);
  const upcomingShowtimes = movies
    .flatMap((movie) => movie.showtimeDetails)
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

async function loadMovieCatalogData(
  status: MovieStatus,
  options: { page?: number; pageSize?: number } = {},
) {
  const now = new Date();
  const requestedPage = options.page ?? 1;
  const pageSize = options.pageSize ?? catalogPageSize;
  const where = { status };
  const totalItems = await prisma.movie.count({ where });
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  const movies = (await fetchHomeMovieRecords(now, {
    status,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  }))
    .map(serializeHomeMovie)
    .sort(compareLatestMovieRecords);

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

async function upsertPaidTicket(params: {
  bookingId: number;
  bookingCode: string;
  showtimeId: number;
  seatId: number;
  price: number;
  index: number;
}) {
  const ticketCode = `${params.bookingCode}-${params.index + 1}`;
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      showtimeId: params.showtimeId,
      seatId: params.seatId,
    },
  });

  if (existingTicket) {
    await prisma.ticket.update({
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

  await prisma.ticket.create({
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

  if (payment) {
    await prisma.payment.update({
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
    await prisma.payment.create({
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

  await prisma.booking.update({
    where: {
      id: booking.id,
    },
    data: {
      status: "CONFIRMED",
    },
  });

  for (let index = 0; index < booking.bookingDetails.length; index += 1) {
    const detail = booking.bookingDetails[index];

    await upsertPaidTicket({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      showtimeId: detail.showtimeId,
      seatId: detail.seatId,
      price: Number(detail.price),
      index,
    });
  }

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

  return prisma.showtime.findMany({
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
  const availableSeats = Math.max(totalSeats - reservedSeatIds.size, 0);
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

function serializeTicketBookingSeatMap(showtime: TicketBookingSeatMapRecord) {
  const reservedSeatIds = new Set<number>();

  for (const bookingDetail of showtime.bookingDetails) {
    reservedSeatIds.add(bookingDetail.seatId);
  }

  for (const seatHold of showtime.seatHolds) {
    reservedSeatIds.add(seatHold.seatId);
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
      const isReserved = reservedSeatIds.has(seat.id);
      const isAvailable = seat.status === "ACTIVE" && !isReserved;

      return {
        id: seat.id,
        seatCode: seat.seatCode,
        rowName: seat.rowName,
        seatNumber: seat.seatNumber,
        status: seat.status,
        price,
        priceLabel: formatCurrency(price),
        isAvailable,
        unavailableReason: isAvailable
          ? null
          : isReserved
            ? "Đã có người đặt"
            : "Ghế không khả dụng",
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
  const bookingCode = await createUniqueBookingCode();

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId: user.id,
          bookingCode,
          totalAmount,
          discountAmount: 0,
          finalAmount: totalAmount,
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

      await tx.payment.create({
        data: {
          bookingId: createdBooking.id,
          method: paymentMethod as (typeof paymentMethods)[number],
          status: "PENDING",
          amount: totalAmount,
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
  } catch {
    sendJson(response, 409, {
      message: "Một hoặc nhiều ghế vừa được đặt bởi người khác. Vui lòng chọn lại ghế.",
    });
  }
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

    if (request.method === "POST" && requestUrl.pathname === "/api/booking/checkout") {
      await handleCreateTicketBooking(request, response);
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
      const movieCatalogData = await loadMovieCatalogData("NOW_SHOWING", {
        page: positiveIntegerParam(requestUrl.searchParams, "page", 1),
        pageSize: positiveIntegerParam(
          requestUrl.searchParams,
          "pageSize",
          catalogPageSize,
          maxCatalogPageSize,
        ),
      });
      sendJson(response, 200, movieCatalogData);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/movies/coming-soon") {
      const movieCatalogData = await loadMovieCatalogData("COMING_SOON", {
        page: positiveIntegerParam(requestUrl.searchParams, "page", 1),
        pageSize: positiveIntegerParam(
          requestUrl.searchParams,
          "pageSize",
          catalogPageSize,
          maxCatalogPageSize,
        ),
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
