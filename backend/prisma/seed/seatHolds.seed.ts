import { prisma } from "./client";

const holdPlans = [
  {
    holdCode: "HOLD-CX-001",
    userEmail: "giabao@example.com",
    showtimeIndex: 2,
    seatCode: "C5",
    status: "HOLDING" as const,
    expiresAt: new Date("2026-05-13T11:15:00.000+07:00"),
  },
  {
    holdCode: "HOLD-CX-002",
    userEmail: "minhanh@example.com",
    showtimeIndex: 7,
    seatCode: "D7",
    status: "EXPIRED" as const,
    expiresAt: new Date("2026-05-12T21:00:00.000+07:00"),
  },
  {
    holdCode: "HOLD-CX-003",
    userEmail: null,
    showtimeIndex: 10,
    seatCode: "E4",
    status: "RELEASED" as const,
    expiresAt: new Date("2026-05-13T12:00:00.000+07:00"),
  },
] as const;

export async function seedSeatHolds() {
  const showtimes = await prisma.showtime.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startTime: "asc" },
  });

  if (showtimes.length === 0) {
    console.log("Seed seat holds skipped: no showtimes");
    return;
  }

  let seededHolds = 0;

  for (const plan of holdPlans) {
    const showtime = showtimes[plan.showtimeIndex % showtimes.length];
    const user = plan.userEmail
      ? await prisma.user.findUnique({ where: { email: plan.userEmail } })
      : null;
    const seat = await prisma.seat.findFirst({
      where: {
        roomId: showtime.roomId,
        seatCode: plan.seatCode,
      },
    });

    if (!seat) {
      continue;
    }

    const existingHold =
      (await prisma.seatHold.findUnique({
        where: { holdCode: plan.holdCode },
      })) ??
      (await prisma.seatHold.findFirst({
        where: {
          showtimeId: showtime.id,
          seatId: seat.id,
        },
      }));

    const data = {
      userId: user?.id ?? null,
      showtimeId: showtime.id,
      seatId: seat.id,
      holdCode: plan.holdCode,
      status: plan.status,
      expiresAt: plan.expiresAt,
    };

    if (existingHold) {
      await prisma.seatHold.update({
        where: { id: existingHold.id },
        data,
      });
    } else {
      await prisma.seatHold.create({
        data,
      });
    }

    seededHolds += 1;
  }

  console.log(`Seed seat holds thanh cong (${seededHolds} hold)`);
}
