import { prisma } from "./client";

const cleanupMinutes = 20;
const seedDayCount = 5;
const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: vietnamTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const slotTimes = ["09:00", "12:35", "16:10", "20:00"];
const movieSlugs = [
  "lat-mat-8",
  "mai",
  "dune-part-two",
  "exhuma",
  "godzilla-minus-one",
  "suzume",
  "avatar-the-way-of-water",
  "oppenheimer",
  "dragon-ball-super-broly",
  "avengers-secret-wars",
];

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function getDateKey(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getSeedDates() {
  const now = new Date();

  return Array.from({ length: seedDayCount }, (_, offset) =>
    getDateKey(new Date(now.getTime() + offset * 24 * 60 * 60 * 1_000)),
  );
}

function makeStartTime(date: string, time: string) {
  return new Date(`${date}T${time}:00.000+07:00`);
}

function getBasePrice(slotIndex: number, roomName: string) {
  const slotPrice = [70000, 80000, 85000, 95000][slotIndex] ?? 85000;
  const roomPremium = roomName.endsWith("2") ? 10000 : 0;

  return slotPrice + roomPremium;
}

async function upsertShowtime(params: {
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  basePrice: number;
}) {
  const existingShowtime = await prisma.showtime.findFirst({
    where: {
      movieId: params.movieId,
      roomId: params.roomId,
      startTime: params.startTime,
    },
  });

  if (existingShowtime) {
    return prisma.showtime.update({
      where: { id: existingShowtime.id },
      data: {
        endTime: params.endTime,
        basePrice: params.basePrice,
        status: "ACTIVE",
      },
    });
  }

  return prisma.showtime.create({
    data: {
      movieId: params.movieId,
      roomId: params.roomId,
      startTime: params.startTime,
      endTime: params.endTime,
      basePrice: params.basePrice,
      status: "ACTIVE",
    },
  });
}

async function syncShowtimePrices(
  showtimeId: number,
  seats: Array<{ id: number; seatType: { priceExtra: unknown } }>,
  basePrice: number,
) {
  for (const seat of seats) {
    const price = basePrice + Number(seat.seatType.priceExtra);

    await prisma.showtimePrice.upsert({
      where: {
        showtimeId_seatId: {
          showtimeId,
          seatId: seat.id,
        },
      },
      update: {
        price,
      },
      create: {
        showtimeId,
        seatId: seat.id,
        price,
      },
    });
  }
}

export async function seedShowtimes() {
  const seedDates = getSeedDates();
  const movies = await prisma.movie.findMany({
    where: {
      slug: { in: movieSlugs },
    },
  });
  const movieBySlug = new Map(movies.map((movie) => [movie.slug, movie]));

  const rooms = await prisma.room.findMany({
    where: {
      status: "ACTIVE",
      cinema: {
        slug: { in: ["cinex-vinh", "cinex-le-loi", "cinex-quang-trung"] },
      },
    },
    include: {
      cinema: true,
    },
    orderBy: [{ cinemaId: "asc" }, { name: "asc" }],
  });

  const seatsByRoomId = new Map<
    number,
    Array<{ id: number; seatType: { priceExtra: unknown } }>
  >();

  let seededShowtimes = 0;

  for (const room of rooms) {
    const seats = await prisma.seat.findMany({
      where: {
        roomId: room.id,
        status: "ACTIVE",
      },
      include: {
        seatType: true,
      },
    });

    seatsByRoomId.set(room.id, seats);
  }

  for (let roomIndex = 0; roomIndex < rooms.length; roomIndex += 1) {
    const room = rooms[roomIndex];
    const seats = seatsByRoomId.get(room.id) ?? [];

    if (seats.length === 0) {
      continue;
    }

    for (let dateIndex = 0; dateIndex < seedDates.length; dateIndex += 1) {
      for (let slotIndex = 0; slotIndex < slotTimes.length; slotIndex += 1) {
        const movieSlug = movieSlugs[(roomIndex + dateIndex + slotIndex) % movieSlugs.length];
        const movie = movieBySlug.get(movieSlug);

        if (!movie) {
          continue;
        }

        const startTime = makeStartTime(seedDates[dateIndex], slotTimes[slotIndex]);
        const endTime = addMinutes(startTime, movie.duration + cleanupMinutes);
        const basePrice = getBasePrice(slotIndex, room.name);

        const showtime = await upsertShowtime({
          movieId: movie.id,
          roomId: room.id,
          startTime,
          endTime,
          basePrice,
        });

        await syncShowtimePrices(showtime.id, seats, basePrice);
        seededShowtimes += 1;
      }
    }
  }

  console.log(`Seed showtimes thanh cong (${seededShowtimes} suat chieu)`);
}
