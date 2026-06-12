import { prisma } from "./client";

const bookingPlans = [
  {
    bookingCode: "CX202605130001",
    customerEmail: "minhanh@example.com",
    showtimeIndex: 0,
    seatCodes: ["A1", "A2"],
    status: "CONFIRMED" as const,
    paymentMethod: "CARD" as const,
    paymentStatus: "SUCCESS" as const,
    promotionCode: "CINEX20",
    note: "Seed booking da thanh toan.",
  },
  {
    bookingCode: "CX202605130002",
    customerEmail: "hoangnam@example.com",
    showtimeIndex: 5,
    seatCodes: ["B3", "B4", "B5"],
    status: "PENDING" as const,
    paymentMethod: "MOMO" as const,
    paymentStatus: "PENDING" as const,
    promotionCode: null,
    note: "Seed booking dang cho thanh toan.",
  },
  {
    bookingCode: "CX202605130003",
    customerEmail: "thuha@example.com",
    showtimeIndex: 12,
    seatCodes: ["E5", "E6"],
    status: "CONFIRMED" as const,
    paymentMethod: "VNPAY" as const,
    paymentStatus: "SUCCESS" as const,
    promotionCode: "WEEKEND30",
    note: "Seed booking co ap dung khuyen mai.",
  },
  {
    bookingCode: "CX202605130004",
    customerEmail: "giabao@example.com",
    showtimeIndex: 18,
    seatCodes: ["F7", "F8"],
    status: "CANCELLED" as const,
    paymentMethod: "BANKING" as const,
    paymentStatus: "REFUNDED" as const,
    promotionCode: null,
    note: "Seed booking da huy de test trang quan tri.",
  },
] as const;

function getDiscountAmount(
  totalAmount: number,
  promotion: {
    type: "PERCENT" | "AMOUNT";
    discountPercent: number | null;
    discountAmount: unknown;
    maxDiscount: unknown;
  } | null,
) {
  if (!promotion) {
    return 0;
  }

  if (promotion.type === "PERCENT") {
    const rawDiscount = Math.round((totalAmount * (promotion.discountPercent ?? 0)) / 100);
    const maxDiscount = promotion.maxDiscount === null ? rawDiscount : Number(promotion.maxDiscount);

    return Math.min(rawDiscount, maxDiscount);
  }

  return Number(promotion.discountAmount ?? 0);
}

async function rebuildBookingRelations(bookingId: number) {
  await prisma.bookingPromotion.deleteMany({ where: { bookingId } });
  await prisma.payment.deleteMany({ where: { bookingId } });
  await prisma.ticket.deleteMany({ where: { bookingId } });
  await prisma.bookingDetail.deleteMany({ where: { bookingId } });
}

async function upsertTicket(params: {
  bookingId: number;
  showtimeId: number;
  seatId: number;
  ticketCode: string;
  price: number;
}) {
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      showtimeId: params.showtimeId,
      seatId: params.seatId,
    },
  });

  if (existingTicket) {
    await prisma.ticket.update({
      where: { id: existingTicket.id },
      data: {
        bookingId: params.bookingId,
        ticketCode: params.ticketCode,
        price: params.price,
        status: "ACTIVE",
        qrCode: `QR-${params.ticketCode}`,
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
      ticketCode: params.ticketCode,
      price: params.price,
      status: "ACTIVE",
      qrCode: `QR-${params.ticketCode}`,
    },
  });
}

export async function seedBookings() {
  const showtimes = await prisma.showtime.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startTime: "asc" },
    include: {
      room: true,
      movie: true,
    },
  });

  if (showtimes.length === 0) {
    console.log("Seed bookings skipped: no showtimes");
    return;
  }

  let seededBookings = 0;

  for (const plan of bookingPlans) {
    const user = await prisma.user.findUnique({
      where: { email: plan.customerEmail },
    });

    if (!user) {
      continue;
    }

    const showtime = showtimes[plan.showtimeIndex % showtimes.length];
    const seats = await prisma.seat.findMany({
      where: {
        roomId: showtime.roomId,
        seatCode: { in: [...plan.seatCodes] },
      },
      orderBy: [{ rowName: "asc" }, { seatNumber: "asc" }],
    });

    if (seats.length !== plan.seatCodes.length) {
      throw new Error(`Not enough seats for booking ${plan.bookingCode}`);
    }

    const prices = await prisma.showtimePrice.findMany({
      where: {
        showtimeId: showtime.id,
        seatId: { in: seats.map((seat) => seat.id) },
      },
    });
    const priceBySeatId = new Map(prices.map((price) => [price.seatId, Number(price.price)]));
    const lineItems = seats.map((seat) => ({
      seat,
      price: priceBySeatId.get(seat.id) ?? Number(showtime.basePrice),
    }));
    const totalAmount = lineItems.reduce((total, item) => total + item.price, 0);
    const promotion = plan.promotionCode
      ? await prisma.promotion.findUnique({ where: { code: plan.promotionCode } })
      : null;
    const discountAmount = getDiscountAmount(totalAmount, promotion);
    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    const booking = await prisma.booking.upsert({
      where: { bookingCode: plan.bookingCode },
      update: {
        userId: user.id,
        totalAmount,
        discountAmount,
        finalAmount,
        status: plan.status,
        note: plan.note,
      },
      create: {
        userId: user.id,
        bookingCode: plan.bookingCode,
        totalAmount,
        discountAmount,
        finalAmount,
        status: plan.status,
        note: plan.note,
      },
    });

    await rebuildBookingRelations(booking.id);

    for (let index = 0; index < lineItems.length; index += 1) {
      const item = lineItems[index];

      await prisma.bookingDetail.upsert({
        where: {
          showtimeId_seatId: {
            showtimeId: showtime.id,
            seatId: item.seat.id,
          },
        },
        update: {
          bookingId: booking.id,
          price: item.price,
        },
        create: {
          bookingId: booking.id,
          showtimeId: showtime.id,
          seatId: item.seat.id,
          price: item.price,
        },
      });

      if (plan.status === "CONFIRMED") {
        await upsertTicket({
          bookingId: booking.id,
          showtimeId: showtime.id,
          seatId: item.seat.id,
          ticketCode: `${plan.bookingCode}-${index + 1}`,
          price: item.price,
        });
      }
    }

    if (promotion) {
      await prisma.bookingPromotion.create({
        data: {
          bookingId: booking.id,
          promotionId: promotion.id,
          discountAmount,
        },
      });
    }

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        method: plan.paymentMethod,
        status: plan.paymentStatus,
        amount: finalAmount,
        transactionCode: `${plan.bookingCode}-${plan.paymentMethod}`,
        paymentUrl:
          plan.paymentStatus === "PENDING"
            ? `https://payments.example.com/${plan.bookingCode}`
            : null,
        paidAt: plan.paymentStatus === "SUCCESS" ? new Date("2026-05-13T10:00:00.000+07:00") : null,
      },
    });

    seededBookings += 1;
  }

  const promotionCodes = new Set(
    bookingPlans
      .map((plan) => plan.promotionCode)
      .filter((code): code is string => Boolean(code)),
  );

  for (const code of promotionCodes) {
    const promotion = await prisma.promotion.findUnique({ where: { code } });

    if (!promotion) {
      continue;
    }

    const usedQuantity = await prisma.bookingPromotion.count({
      where: { promotionId: promotion.id },
    });

    await prisma.promotion.update({
      where: { id: promotion.id },
      data: { usedQuantity },
    });
  }

  console.log(`Seed bookings thanh cong (${seededBookings} don)`);
}
