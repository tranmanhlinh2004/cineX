"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Armchair,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Film,
  Loader2,
  MapPin,
  Monitor,
  Star,
  Ticket,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAuthToken } from "@/lib/auth";
import { createLoadingPath } from "@/lib/navigation";
import {
  createTicketBooking,
  getTicketBookingOptions,
  getTicketBookingSeatMap,
  type TicketBookingOptions,
  type TicketBookingSeat,
  type TicketBookingSeatMap,
  type TicketBookingShowtime,
  type TicketPaymentMethodCode,
} from "@/lib/ticket-booking-api";

const ticketBookingPaymentMethods = [
  "VNPAY",
  "BANKING",
] as const satisfies readonly TicketPaymentMethodCode[];
type TicketBookingPaymentMethod = (typeof ticketBookingPaymentMethods)[number];

const defaultPaymentMethod = ticketBookingPaymentMethods[0];
const ticketBookingPaymentMethodSet = new Set<TicketPaymentMethodCode>(
  ticketBookingPaymentMethods,
);

const paymentMethodLabels: Record<TicketBookingPaymentMethod, string> = {
  VNPAY: "Ví điện tử VNPay",
  BANKING: "QR code banking",
};

function getTicketBookingPaymentMethods(
  paymentMethods: TicketBookingOptions["paymentMethods"],
): TicketBookingPaymentMethod[] {
  const filteredPaymentMethods = paymentMethods.filter(
    (method): method is TicketBookingPaymentMethod => ticketBookingPaymentMethodSet.has(method),
  );

  return filteredPaymentMethods.length > 0
    ? filteredPaymentMethods
    : [...ticketBookingPaymentMethods];
}

const emptyMovies: TicketBookingOptions["movies"] = [];
const emptyCinemas: TicketBookingOptions["cinemas"] = [];
const emptyDates: TicketBookingOptions["dates"] = [];
const emptyShowtimes: TicketBookingOptions["showtimes"] = [];
const emptyPaymentMethods: TicketBookingOptions["paymentMethods"] = [];

type Notice = {
  type: "success" | "error";
  text: string;
};

type ShowtimeFilter = {
  date: string;
  cinemaSlug: string;
  movieId: number | null;
};

export default function TicketBookingPage() {
  const router = useRouter();
  const [options, setOptions] = useState<TicketBookingOptions | null>(null);
  const [seatMap, setSeatMap] = useState<TicketBookingSeatMap | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCinemaSlug, setSelectedCinemaSlug] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<TicketBookingPaymentMethod>(defaultPaymentMethod);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const movies = options?.movies ?? emptyMovies;
  const cinemas = options?.cinemas ?? emptyCinemas;
  const dates = options?.dates ?? emptyDates;
  const showtimes = options?.showtimes ?? emptyShowtimes;
  const apiPaymentMethods = options?.paymentMethods ?? emptyPaymentMethods;
  const paymentMethods = getTicketBookingPaymentMethods(apiPaymentMethods);
  const selectedMovie = movies.find((movie) => movie.id === selectedMovieId) ?? seatMap?.movie;
  const selectedCinema =
    cinemas.find((cinema) => cinema.slug === selectedCinemaSlug) ?? seatMap?.cinema;
  const selectedShowtime =
    showtimes.find((showtime) => showtime.id === selectedShowtimeId) ?? seatMap?.showtime;

  const visibleShowtimes = useMemo(
    () =>
      showtimes.filter(
        (showtime) =>
          (!selectedDate || showtime.date === selectedDate) &&
          (!selectedCinemaSlug || showtime.cinemaSlug === selectedCinemaSlug) &&
          (!selectedMovieId || showtime.movieId === selectedMovieId),
      ),
    [selectedCinemaSlug, selectedDate, selectedMovieId, showtimes],
  );

  const groupedSeats = useMemo(() => {
    const rows = new Map<string, TicketBookingSeat[]>();

    for (const seat of seatMap?.seats ?? []) {
      const rowSeats = rows.get(seat.rowName) ?? [];

      rowSeats.push(seat);
      rows.set(seat.rowName, rowSeats);
    }

    return [...rows.entries()].map(([rowName, seats]) => ({
      rowName,
      seats: seats.sort((leftSeat, rightSeat) => leftSeat.seatNumber - rightSeat.seatNumber),
    }));
  }, [seatMap]);

  const selectedSeats = useMemo(
    () => (seatMap?.seats ?? []).filter((seat) => selectedSeatIds.includes(seat.id)),
    [seatMap, selectedSeatIds],
  );

  const seatSubtotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
  const canSubmit = Boolean(selectedShowtimeId && selectedSeatIds.length > 0 && !isSubmitting);

  const loadSeatMap = async (showtimeId: number) => {
    setIsLoadingSeats(true);
    setNotice(null);

    try {
      const data = await getTicketBookingSeatMap(showtimeId);

      setSeatMap(data);
    } catch (error) {
      setSeatMap(null);
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải sơ đồ ghế.",
      });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const applyShowtime = (showtime: TicketBookingShowtime) => {
    setSelectedDate(showtime.date);
    setSelectedCinemaSlug(showtime.cinemaSlug);
    setSelectedMovieId(showtime.movieId);
    setSelectedShowtimeId(showtime.id);
    setSelectedSeatIds([]);
    void loadSeatMap(showtime.id);
  };

  const findInitialShowtime = (data: TicketBookingOptions) => {
    const params = new URLSearchParams(window.location.search);
    const requestedShowtimeId = Number(params.get("showtime") ?? "");
    const requestedMovieSlug = params.get("movie");
    const requestedTime = params.get("time");

    return (
      data.showtimes.find((showtime) => showtime.id === requestedShowtimeId) ??
      data.showtimes.find(
        (showtime) =>
          requestedMovieSlug &&
          showtime.movieSlug === requestedMovieSlug &&
          (!requestedTime || showtime.time === requestedTime),
      ) ??
      data.showtimes.find((showtime) => showtime.availableSeats > 0) ??
      data.showtimes[0] ??
      null
    );
  };

  const loadOptions = async () => {
    setIsLoadingOptions(true);
    setNotice(null);

    try {
      const data = await getTicketBookingOptions();
      const initialShowtime = findInitialShowtime(data);
      const paymentMethods = getTicketBookingPaymentMethods(data.paymentMethods);

      setOptions(data);
      setSelectedPaymentMethod(paymentMethods[0] ?? defaultPaymentMethod);

      if (initialShowtime) {
        setSelectedDate(initialShowtime.date);
        setSelectedCinemaSlug(initialShowtime.cinemaSlug);
        setSelectedMovieId(initialShowtime.movieId);
        setSelectedShowtimeId(initialShowtime.id);
        await loadSeatMap(initialShowtime.id);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu đặt vé từ database.",
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (nextFilter: Partial<ShowtimeFilter>) => {
    if (!options) {
      return;
    }

    const filter = {
      date: nextFilter.date ?? selectedDate,
      cinemaSlug: nextFilter.cinemaSlug ?? selectedCinemaSlug,
      movieId: nextFilter.movieId ?? selectedMovieId,
    };
    const nextShowtime =
      options.showtimes.find(
        (showtime) =>
          showtime.date === filter.date &&
          showtime.cinemaSlug === filter.cinemaSlug &&
          showtime.movieId === filter.movieId &&
          showtime.availableSeats > 0,
      ) ??
      options.showtimes.find(
        (showtime) =>
          showtime.date === filter.date &&
          showtime.cinemaSlug === filter.cinemaSlug &&
          showtime.movieId === filter.movieId,
      );

    setSelectedDate(filter.date);
    setSelectedCinemaSlug(filter.cinemaSlug);
    setSelectedMovieId(filter.movieId);
    setSelectedSeatIds([]);

    if (nextShowtime) {
      setSelectedShowtimeId(nextShowtime.id);
      void loadSeatMap(nextShowtime.id);
      return;
    }

    setSelectedShowtimeId(null);
    setSeatMap(null);
  };

  const toggleSeat = (seat: TicketBookingSeat) => {
    if (!seat.isAvailable) {
      return;
    }

    setSelectedSeatIds((currentSeats) =>
      currentSeats.includes(seat.id)
        ? currentSeats.filter((seatId) => seatId !== seat.id)
        : [...currentSeats, seat.id],
    );
  };

  const handleSubmit = async () => {
    if (!selectedShowtimeId || selectedSeatIds.length === 0) {
      setNotice({
        type: "error",
        text: "Vui lòng chọn suất chiếu và ghế trước khi đặt vé.",
      });
      return;
    }

    if (!getAuthToken()) {
      router.push(createLoadingPath("/login"));
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const result = await createTicketBooking({
        showtimeId: selectedShowtimeId,
        seatIds: selectedSeatIds,
        paymentMethod: selectedPaymentMethod,
      });

      setNotice({
        type: "success",
        text: result.message,
      });
      router.push(createLoadingPath("/account/booking"));
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tạo đơn đặt vé.",
      });

      if (selectedShowtimeId) {
        await loadSeatMap(selectedShowtimeId);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] rounded-lg border border-white/10 bg-[#151719] p-8">
          <div className="flex items-center gap-3 text-sm font-bold text-white/60">
            <Loader2 size={18} className="animate-spin" />
            Đang tải lịch chiếu...
          </div>
        </div>
      </main>
    );
  }

  if (!options || showtimes.length === 0) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-8 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[980px] rounded-lg border border-white/10 bg-[#151719] px-6 py-14 text-center">
          <Film className="mx-auto text-white/30" size={44} />
          <h1 className="mt-4 text-2xl font-black">Chưa có suất chiếu để đặt vé</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">
            Hiện chưa có suất chiếu đang mở bán. Vui lòng quay lại sau.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700"
          >
            Về trang chủ
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {notice ? <NoticeBox notice={notice} /> : null}

        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl">
          {selectedMovie ? (
            <img
              src={selectedMovie.bannerUrl}
              alt={selectedMovie.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/76 to-black/28" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/20" />

          <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
            <div className="max-w-[760px]">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40">
                  <Ticket size={15} />
                  Đặt vé CineX
                </span>
                {selectedMovie ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    {selectedMovie.rating}/10
                  </span>
                ) : null}
              </div>

              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                {selectedMovie?.title ?? "Chọn phim"}
              </h1>
              <p className="mt-4 max-w-[650px] text-sm leading-7 text-white/72 sm:text-base">
                Chọn rạp, suất chiếu và ghế ngồi phù hợp trước khi tạo đơn thanh toán.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[selectedMovie?.ageLimit, selectedMovie?.duration, selectedMovie?.language, selectedMovie?.genres.join(" / ")]
                  .filter(Boolean)
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white/50">Đang chọn</p>
              <div className="mt-4 space-y-4">
                <HeroInfo icon={<MapPin size={18} />} label={selectedCinema?.name ?? "Chọn rạp"} />
                <HeroInfo icon={<CalendarDays size={18} />} label={dates.find((date) => date.value === selectedDate)?.dateLabel ?? "Chọn ngày"} />
                <HeroInfo icon={<Clock3 size={18} />} label={selectedShowtime ? `${selectedShowtime.time} - ${selectedShowtime.room.name}` : "Chọn suất"} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Stat label="Ghế đã chọn" value={selectedSeatIds.length.toString()} />
                <Stat label="Còn lại" value={(selectedShowtime?.availableSeats ?? 0).toString()} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <BookingStep index="01" label="Chọn suất" active={Boolean(selectedShowtime)} done={Boolean(selectedShowtime)} />
            <BookingStep index="02" label="Chọn ghế" active={selectedSeatIds.length > 0} done={selectedSeatIds.length > 0} />
            <BookingStep index="03" label="Tạo đơn" active={seatSubtotal > 0} done={false} />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
              <SectionHeader icon={<Film size={22} />} title="Phim và suất chiếu" subtitle="Chọn phim, rạp và giờ chiếu" />

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {dates.map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    aria-pressed={selectedDate === date.value}
                    onClick={() => updateFilter({ date: date.value })}
                    className={`min-w-[126px] rounded-md border px-4 py-3 text-left transition ${
                      selectedDate === date.value
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-white/10 bg-black/25 text-white/70 hover:border-red-500/60 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase">{date.label}</span>
                    <span className="mt-1 block text-sm font-black">{date.dateLabel}</span>
                    <span className="block text-xs opacity-75">{date.hint}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {cinemas.map((cinema) => (
                  <button
                    key={cinema.slug}
                    type="button"
                    aria-pressed={selectedCinemaSlug === cinema.slug}
                    onClick={() => updateFilter({ cinemaSlug: cinema.slug })}
                    className={`rounded-lg border p-4 text-left transition ${
                      selectedCinemaSlug === cinema.slug
                        ? "border-red-500 bg-red-600/15"
                        : "border-white/10 bg-black/25 hover:border-red-500/60"
                    }`}
                  >
                    <span className="block font-black">{cinema.name}</span>
                    <span className="mt-2 block text-sm leading-5 text-white/55">
                      {cinema.address}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <MapPin size={14} />
                      {cinema.roomCount} phòng chiếu
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {movies.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    aria-pressed={selectedMovieId === movie.id}
                    onClick={() => updateFilter({ movieId: movie.id })}
                    className={`group overflow-hidden rounded-lg border text-left transition ${
                      selectedMovieId === movie.id
                        ? "border-red-500 bg-red-600/15"
                        : "border-white/10 bg-black/25 hover:border-red-500/60"
                    }`}
                  >
                    <div className="relative aspect-[16/10] bg-black">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
                      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                        {movie.ageLimit}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 font-black">{movie.title}</h3>
                      <p className="mt-1 text-xs text-white/50">
                        {movie.duration} - {movie.language ?? "Đang cập nhật"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase text-white/45">Suất chiếu</p>
                  <span className="text-xs font-bold text-white/45">
                    {visibleShowtimes.length} suất phù hợp
                  </span>
                </div>
                {visibleShowtimes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {visibleShowtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        type="button"
                        aria-pressed={selectedShowtimeId === showtime.id}
                        onClick={() => applyShowtime(showtime)}
                        disabled={showtime.availableSeats <= 0}
                        className={`rounded-md border px-3 py-3 text-left transition ${
                          selectedShowtimeId === showtime.id
                            ? "border-red-500 bg-red-600 text-white"
                            : showtime.availableSeats <= 0
                              ? "cursor-not-allowed border-white/5 bg-white/5 text-white/28"
                              : showtime.availableSeats <= 12
                                ? "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20"
                                : "border-white/10 bg-black/25 hover:border-red-500 hover:bg-red-600/20"
                        }`}
                      >
                        <span className="block text-lg font-black">{showtime.time}</span>
                        <span className="mt-1 block text-[11px] font-semibold text-white/58">
                          {showtime.room.name}
                        </span>
                        <span className="mt-2 block text-xs font-bold text-emerald-300">
                          {showtime.price} - còn {showtime.availableSeats}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-8 text-center text-sm font-semibold text-white/52">
                    Không có suất chiếu phù hợp với bộ lọc hiện tại.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
              <SectionHeader
                icon={<Armchair size={22} />}
                title="Sơ đồ ghế"
                subtitle={selectedShowtime ? `${selectedShowtime.room.name} - ${selectedShowtime.time}` : "Chọn suất chiếu"}
              />

              {isLoadingSeats ? (
                <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-5 text-sm font-bold text-white/58">
                  <Loader2 size={18} className="animate-spin" />
                  Đang tải ghế...
                </div>
              ) : seatMap ? (
                <>
                  <div className="mt-6 overflow-x-auto pb-2">
                    <div className="min-w-[620px]">
                      <div className="mx-auto mb-8 flex max-w-[520px] flex-col items-center">
                        <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_28px_rgba(103,232,249,0.45)]" />
                        <div className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-white/45">
                          <Monitor size={15} />
                          Màn hình
                        </div>
                      </div>

                      <div className="grid gap-2">
                        {groupedSeats.map((row) => (
                          <div
                            key={row.rowName}
                            className="grid items-center gap-2"
                            style={{
                              gridTemplateColumns: `28px repeat(${row.seats.length}, minmax(38px, 1fr))`,
                            }}
                          >
                            <span className="text-center text-sm font-black text-white/45">
                              {row.rowName}
                            </span>
                            {row.seats.map((seat) => {
                              const selected = selectedSeatIds.includes(seat.id);

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={!seat.isAvailable}
                                  aria-pressed={selected}
                                  title={seat.unavailableReason ?? seat.priceLabel}
                                  onClick={() => toggleSeat(seat)}
                                  className={`h-10 rounded-md border text-xs font-black transition ${
                                    !seat.isAvailable
                                      ? "cursor-not-allowed border-white/5 bg-white/5 text-white/20"
                                      : selected
                                        ? "border-red-300 bg-red-600 text-white shadow-lg shadow-red-950/40"
                                        : seat.type.name === "VIP"
                                          ? "border-amber-300/35 bg-amber-300/12 text-amber-100 hover:bg-amber-300/22"
                                          : seat.type.name === "COUPLE"
                                            ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100 hover:bg-cyan-300/22"
                                            : "border-white/10 bg-white/8 text-white/72 hover:border-red-500 hover:bg-red-600/20"
                                  }`}
                                >
                                  {seat.seatNumber}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 text-xs font-semibold text-white/60 sm:grid-cols-4">
                    <LegendItem color="bg-white/8 border-white/10" label="Thường" />
                    <LegendItem color="bg-amber-300/20 border-amber-300/45" label="VIP" />
                    <LegendItem color="bg-cyan-300/20 border-cyan-300/45" label="Ghế đôi" />
                    <LegendItem color="bg-red-600 border-red-300" label="Đang chọn" />
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-lg border border-white/10 bg-black/25 px-5 py-8 text-center text-sm font-semibold text-white/52">
                  Chọn suất chiếu để xem sơ đồ ghế.
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <section className="overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl shadow-black/25">
              <div className="relative h-[220px] bg-black">
                {selectedMovie ? (
                  <img
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#151719] via-black/25 to-transparent" />
                {selectedMovie ? (
                  <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                    {selectedMovie.ageLimit}
                  </span>
                ) : null}
              </div>

              <div className="p-5">
                <h2 className="text-2xl font-black">{selectedMovie?.title ?? "Chọn phim"}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/52">
                  {selectedMovie?.description || "Chọn phim và suất chiếu để xem tóm tắt đơn hàng."}
                </p>

                <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm text-white/68">
                  <SummaryRow icon={<MapPin size={16} />} label={selectedCinema?.name ?? "Chọn rạp"} value={selectedCinema?.city ?? ""} />
                  <SummaryRow icon={<CalendarDays size={16} />} label={dates.find((date) => date.value === selectedDate)?.dateLabel ?? "Chọn ngày"} value={dates.find((date) => date.value === selectedDate)?.label ?? ""} />
                  <SummaryRow icon={<Clock3 size={16} />} label={selectedShowtime ? `${selectedShowtime.time} - ${selectedShowtime.room.name}` : "Chọn suất"} value={selectedShowtime?.price ?? ""} />
                  <SummaryRow icon={<Armchair size={16} />} label={selectedSeats.length > 0 ? selectedSeats.map((seat) => seat.seatCode).join(", ") : "Chưa chọn ghế"} value={`${selectedSeats.length} ghế`} />
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((seat) => (
                      <PriceRow
                        key={seat.id}
                        label={`${seat.seatCode} - ${seat.type.label}`}
                        value={seat.price}
                      />
                    ))
                  ) : (
                    <p className="rounded-md bg-white/6 px-3 py-3 text-sm font-semibold text-white/45">
                      Chưa chọn ghế.
                    </p>
                  )}
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <label className="grid gap-2 text-xs font-bold uppercase text-white/45">
                    Phương thức thanh toán
                    <select
                      value={selectedPaymentMethod}
                      onChange={(event) =>
                        setSelectedPaymentMethod(event.target.value as TicketBookingPaymentMethod)
                      }
                      className="h-11 rounded-md border border-white/10 bg-[#10141b] px-3 text-sm font-bold normal-case text-white outline-none transition focus:border-red-500"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {paymentMethodLabels[method]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-white/45">Tổng thanh toán</p>
                      <p className="mt-1 text-3xl font-black text-red-300">
                        {formatCurrency(seatSubtotal)}
                      </p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-red-600/15 text-red-300">
                      <Ticket size={20} />
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={() => void handleSubmit()}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Tạo đơn đặt vé
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-white/38">
                    Đơn hàng sẽ ở trạng thái chờ thanh toán trong 5 phút.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
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

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <p className="text-xs font-bold uppercase text-red-300">{subtitle}</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/8 text-white/75">
        {icon}
      </span>
    </div>
  );
}

function BookingStep({
  index,
  label,
  active,
  done,
}: {
  index: string;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        active ? "border-red-500 bg-red-600/15" : "border-white/10 bg-black/25 text-white/55"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-black ${
          done ? "bg-red-600 text-white" : "bg-white/10 text-white/65"
        }`}
      >
        {done ? <Check size={17} /> : index}
      </span>
      <span className="font-black">{label}</span>
    </div>
  );
}

function HeroInfo({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white/75">
      <span className="shrink-0 text-red-300">{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-4">
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
      <span className={`h-4 w-4 rounded border ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 shrink-0 text-red-300">{icon}</span>
        <span className="min-w-0 truncate">{label}</span>
      </span>
      <span className="shrink-0 text-xs font-bold text-white/42">{value}</span>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/55">{label}</span>
      <span className="font-black">{formatCurrency(value)}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, "");
}
