"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Film,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  Ticket,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import {
  getBookingHistory,
  type BookingHistoryItem,
} from "@/lib/auth-api";
import { createLoadingPath } from "@/lib/navigation";
import { showToast } from "@/lib/toast";

type TicketQrItem = {
  booking: BookingHistoryItem;
  ticket: BookingHistoryItem["tickets"][number];
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

export default function AccountTicketsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TicketQrItem | null>(null);

  const ticketItems = useMemo(
    () =>
      bookings.flatMap((booking) => {
        if (booking.bookingStatus !== "CONFIRMED" || booking.payment.status !== "SUCCESS") {
          return [];
        }

        return booking.tickets.map((ticket) => ({
          booking,
          ticket,
        }));
      }),
    [bookings],
  );
  const validTicketCount = useMemo(
    () => ticketItems.filter((item) => item.ticket.status === "VALID").length,
    [ticketItems],
  );

  const loadTickets = async (options: { silent?: boolean } = {}) => {
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

    try {
      const data = await getBookingHistory();

      setBookings(data.bookings);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể tải QR code vé.",
        "error",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#0d0f12] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1320px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-emerald-300">
              <QrCode size={18} />
              Tài khoản CineX
            </div>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              QR code vé của tôi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Quét mã QR tại quầy soát vé và xem nhanh thông tin từng vé đã thanh toán.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTickets({ silent: true })}
            disabled={isRefreshing || isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 px-4 text-sm font-bold text-white transition hover:border-emerald-400/70 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <StatBox
            icon={<Ticket size={20} />}
            label="Tổng vé QR"
            value={ticketItems.length.toString()}
          />
          <StatBox
            icon={<CheckCircle2 size={20} />}
            label="Vé hợp lệ"
            value={validTicketCount.toString()}
            tone="success"
          />
          <StatBox
            icon={<WalletCards size={20} />}
            label="Đơn đã thanh toán"
            value={bookings.filter((booking) => booking.payment.status === "SUCCESS").length.toString()}
          />
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-white/10 bg-[#151719] p-8">
            <div className="flex items-center gap-3 text-sm font-bold text-white/60">
              <Loader2 size={18} className="animate-spin" />
              Đang tải QR code vé...
            </div>
          </div>
        ) : ticketItems.length === 0 ? (
          <EmptyTicketState />
        ) : (
          <section>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-lg font-black text-white">
                <QrCode size={20} className="text-emerald-300" />
                Danh sách QR code
              </div>
              <span className="text-xs font-black uppercase text-white/38">
                {ticketItems.length} vé đã thanh toán
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ticketItems.map((item) => (
                <TicketQrCard
                  key={item.ticket.id}
                  item={item}
                  onViewDetail={setSelectedItem}
                />
              ))}
            </div>
          </section>
        )}
      </section>

      {selectedItem ? (
        <TicketDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </main>
  );
}

function TicketQrCard({
  item,
  onViewDetail,
}: {
  item: TicketQrItem;
  onViewDetail: (item: TicketQrItem) => void;
}) {
  const { booking, ticket } = item;
  const hasQrImage = isTicketQrImage(ticket.qrCode);

  return (
    <article className="grid gap-4 rounded-lg border border-white/10 bg-[#151719] p-4 sm:grid-cols-[148px_1fr]">
      <div className="flex h-[148px] w-[148px] items-center justify-center rounded-md bg-white p-2">
        {hasQrImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ticket.qrCode ?? ""}
            alt={`QR ${ticket.ticketCode}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-md border border-dashed border-slate-300 px-3 text-center text-xs font-black text-slate-500">
            Đang tạo QR
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
          {ticket.ticketCode}
        </p>
        <h3 className="mt-2 line-clamp-2 text-lg font-black text-white">
          {booking.movie?.title ?? "Phim chưa xác định"}
        </h3>
        <div className="mt-3 grid gap-2 text-sm font-semibold text-white/62">
          <InfoLine icon={<Ticket size={15} />} text={`Ghế ${ticket.seat.seatCode}`} />
          <InfoLine
            icon={<CalendarDays size={15} />}
            text={
              booking.showtime
                ? `${booking.showtime.date} - ${booking.showtime.time}`
                : "Chưa có suất chiếu"
            }
          />
          <InfoLine
            icon={<MapPin size={15} />}
            text={booking.showtime?.room?.cinema.name ?? "Chưa có rạp"}
          />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <p className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-black text-emerald-200">
            {ticket.statusLabel}
          </p>
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-black text-white transition hover:bg-red-700"
          >
            <Eye size={16} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}

function TicketDetailModal({
  item,
  onClose,
}: {
  item: TicketQrItem;
  onClose: () => void;
}) {
  const { booking, ticket } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 py-6">
      <div className="flex max-h-[calc(100vh-48px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
              {ticket.ticketCode}
            </p>
            <h2 className="mt-1 truncate text-2xl font-black text-white">
              Chi tiết vé
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết vé"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/60 transition hover:bg-white/8 hover:text-white"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            <div className="mx-auto flex h-[260px] w-[260px] items-center justify-center rounded-lg bg-white p-3">
              {isTicketQrImage(ticket.qrCode) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ticket.qrCode ?? ""}
                  alt={`QR ${ticket.ticketCode}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="grid h-full w-full place-items-center rounded-md border border-dashed border-slate-300 text-center text-sm font-black text-slate-500">
                  Đang tạo QR
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="rounded-md border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-black uppercase text-white/38">Phim</p>
                <h3 className="mt-1 text-xl font-black text-white">
                  {booking.movie?.title ?? "Phim chưa xác định"}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DetailLine label="Mã vé" value={ticket.ticketCode} />
                  <DetailLine label="Mã đặt vé" value={booking.bookingCode} />
                  <DetailLine label="Ghế" value={ticket.seat.seatCode} />
                  <DetailLine label="Trạng thái" value={ticket.statusLabel} />
                  <DetailLine
                    label="Suất chiếu"
                    value={
                      booking.showtime
                        ? `${booking.showtime.date} - ${booking.showtime.time}`
                        : "Chưa có suất chiếu"
                    }
                  />
                  <DetailLine
                    label="Rạp"
                    value={booking.showtime?.room?.cinema.name ?? "Chưa có rạp"}
                  />
                  <DetailLine
                    label="Phòng"
                    value={booking.showtime?.room?.name ?? "Chưa có phòng"}
                  />
                  <DetailLine label="Thanh toán" value={booking.amounts.finalLabel} />
                  <DetailLine label="Phương thức" value={booking.payment.method} />
                  <DetailLine
                    label="Thời gian thanh toán"
                    value={
                      booking.payment.paidAt
                        ? formatDateTime(booking.payment.paidAt)
                        : formatDateTime(booking.payment.displayTime)
                    }
                  />
                </div>
              </div>

              <Link
                href={booking.movie ? `/movies/${booking.movie.id}` : "/movies/now-showing"}
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-black text-white transition hover:border-red-400 hover:text-red-100"
              >
                <Film size={16} />
                Xem phim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  tone?: "default" | "success";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20"
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

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-white/62">
      <span className="text-red-300">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-black uppercase text-white/35">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyTicketState() {
  return (
    <div className="rounded-lg border border-white/10 bg-[#151719] px-5 py-12 text-center">
      <QrCode className="mx-auto text-white/32" size={42} />
      <h2 className="mt-4 text-xl font-black text-white">Chưa có QR code vé</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
        QR code sẽ xuất hiện tại đây sau khi bạn thanh toán vé thành công.
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

function isTicketQrImage(value: string | null) {
  return Boolean(value?.startsWith("data:image/"));
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}
