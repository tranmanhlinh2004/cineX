"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Film,
  History,
  Loader2,
  MapPin,
  RefreshCw,
  Ticket,
  User,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  getBookingHistory,
  payBooking,
  type BookingHistoryItem,
  type PaymentMethodCode,
} from "@/lib/auth-api";
import { getAuthToken } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";

const paymentMethodLabels: Record<PaymentMethodCode, string> = {
  CASH: "Tiền mặt",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  ZALOPAY: "ZaloPay",
  BANKING: "Chuyển khoản",
  CARD: "Thẻ ngân hàng",
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type Notice = {
  type: "success" | "error";
  text: string;
};

export default function BookingHistoryPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodCode[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<Record<number, PaymentMethodCode>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const pendingCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.bookingStatus === "PENDING" &&
          booking.payment.status === "PENDING" &&
          getRemainingSeconds(booking, now) > 0,
      ).length,
    [bookings, now],
  );
  const paidCount = useMemo(
    () => bookings.filter((booking) => booking.payment.status === "SUCCESS").length,
    [bookings],
  );
  const totalPaid = useMemo(
    () =>
      bookings
        .filter((booking) => booking.payment.status === "SUCCESS")
        .reduce((total, booking) => total + booking.amounts.final, 0),
    [bookings],
  );

  const syncSelectedMethods = (items: BookingHistoryItem[]) => {
    setSelectedMethods(
      Object.fromEntries(items.map((booking) => [booking.id, booking.payment.method])),
    );
  };

  const loadBookings = async (options: { silent?: boolean } = {}) => {
    const token = getAuthToken();

    if (!token) {
      router.replace(createLoadingPath("/login"));
      return;
    }

    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setNotice(null);

    try {
      const data = await getBookingHistory();

      setBookings(data.bookings);
      setPaymentMethods(data.paymentMethods);
      syncSelectedMethods(data.bookings);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải lịch sử đặt vé.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const handleMethodChange = (bookingId: number, event: ChangeEvent<HTMLSelectElement>) => {
    const method = event.target.value as PaymentMethodCode;

    setSelectedMethods((current) => ({
      ...current,
      [bookingId]: method,
    }));
  };

  const handlePay = async (booking: BookingHistoryItem) => {
    const method = selectedMethods[booking.id] ?? booking.payment.method;

    setPayingBookingId(booking.id);
    setNotice(null);

    try {
      const result = await payBooking(booking.id, { method });
      const paidBooking = result.booking;

      if (paidBooking) {
        setBookings((current) =>
          current.map((item) => (item.id === paidBooking.id ? paidBooking : item)),
        );
        setSelectedMethods((current) => ({
          ...current,
          [paidBooking.id]: paidBooking.payment.method,
        }));
      } else {
        await loadBookings({ silent: true });
      }

      setNotice({
        type: "success",
        text: result.message,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể thanh toán đơn hàng.",
      });
      await loadBookings({ silent: true });
    } finally {
      setPayingBookingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0f12] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1320px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-red-300">
              <History size={18} />
              Tài khoản CineX
            </div>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Lịch sử đặt vé
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Theo dõi phim đã đặt, trạng thái thanh toán và hoàn tất các đơn đang chờ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBookings({ silent: true })}
            disabled={isRefreshing || isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 px-4 text-sm font-bold text-white transition hover:border-red-500/70 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <StatBox
            icon={<Ticket size={20} />}
            label="Tổng đơn"
            value={bookings.length.toString()}
          />
          <StatBox
            icon={<Clock3 size={20} />}
            label="Chờ thanh toán"
            value={pendingCount.toString()}
            tone="warning"
          />
          <StatBox
            icon={<CheckCircle2 size={20} />}
            label="Đã thanh toán"
            value={`${paidCount} đơn - ${formatMoney(totalPaid)}`}
            tone="success"
          />
        </div>

        {notice ? <NoticeBox notice={notice} /> : null}

        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-[#151719] p-8">
            <div className="flex items-center gap-3 text-sm font-bold text-white/60">
              <Loader2 size={18} className="animate-spin" />
              Đang tải lịch sử đặt vé...
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-lg font-black text-white">
                <Film size={20} className="text-red-400" />
                Phim đã đặt vé
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {bookings.map((booking) => (
                  <MovieBookingCard key={booking.id} booking={booking} now={now} />
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#10141b] shadow-2xl shadow-black/20">
              <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Danh sách đơn hàng</h2>
                  <p className="mt-1 text-sm text-white/48">
                    Đơn chờ thanh toán sẽ tự hết hạn sau 5 phút.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
                  <thead className="bg-[#20324b] text-white">
                    <tr>
                      <TableHead>Mã đơn hàng</TableHead>
                      <TableHead>Họ tên khách hàng</TableHead>
                      <TableHead>Tổng số tiền</TableHead>
                      <TableHead>Thời gian thanh toán</TableHead>
                      <TableHead>Trạng thái thanh toán</TableHead>
                      <TableHead>Phương thức thanh toán</TableHead>
                      <TableHead>Thanh toán</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => {
                      const remainingSeconds = getRemainingSeconds(booking, now);
                      const canPay =
                        booking.bookingStatus === "PENDING" &&
                        booking.payment.status === "PENDING" &&
                        remainingSeconds > 0;
                      const selectedMethod = selectedMethods[booking.id] ?? booking.payment.method;

                      return (
                        <tr
                          key={booking.id}
                          className={
                            index % 2 === 0
                              ? "border-t border-[#2a3d59] bg-[#172335]"
                              : "border-t border-[#2a3d59] bg-[#090f20]"
                          }
                        >
                          <TableCell>
                            <Link
                              href={booking.movie ? `/movies/${booking.movie.id}` : "#"}
                              className="font-black text-white transition hover:text-red-300"
                            >
                              {booking.bookingCode}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User size={15} className="text-white/38" />
                              <span>{booking.customer.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-black text-white">
                              {booking.amounts.finalLabel}
                            </span>
                          </TableCell>
                          <TableCell>{formatDateTime(booking.payment.displayTime)}</TableCell>
                          <TableCell>
                            <PaymentStatusLabel
                              booking={booking}
                              remainingSeconds={remainingSeconds}
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              value={selectedMethod}
                              onChange={(event) => handleMethodChange(booking.id, event)}
                              disabled={!canPay}
                              className="h-10 w-full min-w-[160px] rounded-md border border-white/10 bg-[#0d1320] px-3 text-sm font-bold text-white outline-none transition focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {paymentMethods.map((method) => (
                                <option key={method} value={method}>
                                  {paymentMethodLabels[method]}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => void handlePay(booking)}
                              disabled={!canPay || payingBookingId === booking.id}
                              className="inline-flex h-10 min-w-[116px] items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                            >
                              {payingBookingId === booking.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CreditCard size={16} />
                              )}
                              Thanh toán
                            </button>
                          </TableCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function StatBox({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20"
      : tone === "warning"
        ? "text-amber-200 bg-amber-400/10 border-amber-300/20"
        : "text-red-200 bg-red-500/10 border-red-400/20";

  return (
    <div className="rounded-lg border border-white/10 bg-[#151719] p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md border ${toneClass}`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-white/45">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function MovieBookingCard({
  booking,
  now,
}: {
  booking: BookingHistoryItem;
  now: number;
}) {
  const remainingSeconds = getRemainingSeconds(booking, now);

  return (
    <article className="overflow-hidden rounded-lg border border-white/10 bg-[#151719]">
      <div className="relative aspect-[16/7] bg-black">
        {booking.movie ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.movie.bannerUrl}
            alt={booking.movie.title}
            className="h-full w-full object-cover opacity-75"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151719] via-black/35 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-200">
            {booking.bookingCode}
          </p>
          <h3 className="mt-1 line-clamp-1 text-xl font-black text-white">
            {booking.movie?.title ?? "Phim chưa xác định"}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <InfoLine icon={<CalendarDays size={15} />} text={booking.showtime ? `${booking.showtime.date} - ${booking.showtime.time}` : "Chưa có suất chiếu"} />
        <InfoLine icon={<MapPin size={15} />} text={booking.showtime?.room?.cinema.name ?? "Chưa có rạp"} />
        <InfoLine icon={<Ticket size={15} />} text={`Ghế ${booking.seats.label || "chưa chọn"}`} />
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <span className="text-sm font-black text-white">{booking.amounts.finalLabel}</span>
          <PaymentStatusLabel booking={booking} remainingSeconds={remainingSeconds} compact />
        </div>
      </div>
    </article>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-white/62">
      <span className="text-red-300">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function PaymentStatusLabel({
  booking,
  remainingSeconds,
  compact = false,
}: {
  booking: BookingHistoryItem;
  remainingSeconds: number;
  compact?: boolean;
}) {
  if (booking.payment.status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/12 px-2 py-1 text-xs font-black text-emerald-300">
        Đã thanh toán
      </span>
    );
  }

  if (
    booking.bookingStatus === "EXPIRED" ||
    booking.payment.status === "FAILED" ||
    (booking.payment.status === "PENDING" && remainingSeconds <= 0)
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/12 px-2 py-1 text-xs font-black text-red-300">
        Hết thời gian thanh toán
      </span>
    );
  }

  if (booking.payment.status === "REFUNDED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/12 px-2 py-1 text-xs font-black text-cyan-200">
        Đã hoàn tiền
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-amber-400/12 px-2 py-1 text-xs font-black text-amber-200 ${
        compact ? "max-w-full" : ""
      }`}
    >
      Chờ thanh toán
      <span className="text-cyan-300">{formatCountdown(remainingSeconds)}</span>
    </span>
  );
}

function NoticeBox({ notice }: { notice: Notice }) {
  const isSuccess = notice.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`mb-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-bold ${
        isSuccess
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
          : "border-red-400/30 bg-red-500/10 text-red-100"
      }`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{notice.text}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-white/10 bg-[#151719] px-5 py-12 text-center">
      <Ticket className="mx-auto text-white/32" size={42} />
      <h2 className="mt-4 text-xl font-black text-white">Chưa có đơn đặt vé</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
        Khi bạn đặt vé thành công, thông tin phim và trạng thái thanh toán sẽ xuất hiện ở đây.
      </p>
      <Link
        href="/ticket-booking"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
      >
        Đặt vé ngay
      </Link>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="border-r border-white/10 px-4 py-3 font-black">{children}</th>;
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="border-r border-[#2a3d59] px-4 py-3 text-white">{children}</td>;
}

function getRemainingSeconds(booking: BookingHistoryItem, now: number) {
  if (booking.payment.status !== "PENDING" || !booking.payment.deadlineAt) {
    return 0;
  }

  return Math.max(0, Math.floor((new Date(booking.payment.deadlineAt).getTime() - now) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, "");
}
