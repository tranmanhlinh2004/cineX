"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  BadgePercent,
  Clock3,
  Film,
  Filter,
  Info,
  Loader2,
  MapPin,
  Phone,
  Search,
  Star,
  Ticket,
  X,
} from "lucide-react";
import {
  getTicketBookingOptions,
  type TicketBookingMovie,
  type TicketBookingOptions,
  type TicketBookingShowtime,
} from "@/lib/ticket-booking-api";

const ALL_ROOMS = "all";
const emptyMovies: TicketBookingOptions["movies"] = [];
const emptyCinemas: TicketBookingOptions["cinemas"] = [];
const emptyDates: TicketBookingOptions["dates"] = [];
const emptyShowtimes: TicketBookingOptions["showtimes"] = [];

type WeeklyTicketPriceRow = {
  day: string;
  policy: string;
  price: string;
  tone: string;
};

const weeklyTicketPriceRows: WeeklyTicketPriceRow[] = [
  {
    day: "Thứ 2",
    policy: "Đồng giá đầu tuần",
    price: "85.000đ",
    tone: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  },
  {
    day: "Thứ 3",
    policy: "Đồng giá đầu tuần",
    price: "85.000đ",
    tone: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  },
  {
    day: "Thứ 4",
    policy: "Ưu đãi giữa tuần",
    price: "75.000đ",
    tone: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  },
  {
    day: "Thứ 5",
    policy: "Đồng giá cuối tuần sớm",
    price: "80.000đ",
    tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  },
  {
    day: "Thứ 6",
    policy: "Đồng giá cuối tuần sớm",
    price: "80.000đ",
    tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  },
  {
    day: "Thứ 7",
    policy: "Đồng giá cuối tuần",
    price: "80.000đ",
    tone: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  },
  {
    day: "Chủ nhật",
    policy: "Giá vé Chủ nhật",
    price: "65.000đ",
    tone: "border-red-300/25 bg-red-300/10 text-red-100",
  },
];


const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const dayFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  weekday: "short",
});
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  day: "2-digit",
  month: "2-digit",
});
const fullDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  weekday: "long",
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

type ShowtimeGroup = {
  label: string;
  price: string;
  times: TicketBookingShowtime[];
};

type ShowtimeMovie = TicketBookingMovie & {
  groups: ShowtimeGroup[];
  showtimes: TicketBookingShowtime[];
};

type RoomOption = {
  value: string;
  label: string;
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

function getDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000+07:00`);
}

function getDateMeta(dateKey: string) {
  const date = getDateFromKey(dateKey);

  return {
    day: dayFormatter.format(date).replace(".", ""),
    date: dateFormatter.format(date),
    fullDate: fullDateFormatter.format(date),
  };
}

function getCinemaHours(showtimes: TicketBookingShowtime[]) {
  if (showtimes.length === 0) {
    return "Theo lịch chiếu";
  }

  const startTimes = showtimes.map((showtime) => new Date(showtime.startTime).getTime());
  const endTimes = showtimes.map((showtime) => new Date(showtime.endTime).getTime());
  const start = new Date(Math.min(...startTimes));
  const end = new Date(Math.max(...endTimes));

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function sortShowtimes(showtimes: TicketBookingShowtime[]) {
  return [...showtimes].sort(
    (leftShowtime, rightShowtime) =>
      new Date(leftShowtime.startTime).getTime() -
      new Date(rightShowtime.startTime).getTime(),
  );
}

function groupShowtimes(showtimes: TicketBookingShowtime[]) {
  const grouped = new Map<string, ShowtimeGroup>();

  for (const showtime of sortShowtimes(showtimes)) {
    const key = `${showtime.room.name}-${showtime.price}`;
    const current = grouped.get(key);

    if (current) {
      current.times.push(showtime);
      continue;
    }

    grouped.set(key, {
      label: showtime.room.name,
      price: showtime.price,
      times: [showtime],
    });
  }

  return [...grouped.values()];
}

function buildRoomOptions(showtimes: TicketBookingShowtime[]): RoomOption[] {
  const rooms = [...new Set(showtimes.map((showtime) => showtime.room.name))].sort((left, right) =>
    left.localeCompare(right),
  );

  return [
    {
      value: ALL_ROOMS,
      label: "Tất cả",
    },
    ...rooms.map((room) => ({
      value: room,
      label: room,
    })),
  ];
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        "a, button, input, select, textarea, [role='button'], [role='link']",
      ),
    )
  );
}

function getInitialSelection(data: TicketBookingOptions) {
  const initialDate = data.dates[0]?.value ?? data.showtimes[0]?.date ?? "";
  const initialShowtime =
    data.showtimes.find(
      (showtime) => showtime.date === initialDate && showtime.availableSeats > 0,
    ) ??
    data.showtimes.find((showtime) => showtime.date === initialDate) ??
    data.showtimes[0] ??
    null;

  return {
    date: initialShowtime?.date ?? initialDate,
    cinemaSlug: initialShowtime?.cinemaSlug ?? data.cinemas[0]?.slug ?? "",
  };
}

export default function ShowtimesPage() {
  const [options, setOptions] = useState<TicketBookingOptions | null>(null);
  const [selectedCinemaSlug, setSelectedCinemaSlug] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(ALL_ROOMS);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getTicketBookingOptions();
        const initialSelection = getInitialSelection(data);

        if (!isMounted) {
          return;
        }

        setOptions(data);
        setSelectedDate(initialSelection.date);
        setSelectedCinemaSlug(initialSelection.cinemaSlug);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setOptions(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải lịch chiếu từ database.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const movies = options?.movies ?? emptyMovies;
  const cinemas = options?.cinemas ?? emptyCinemas;
  const dates = options?.dates ?? emptyDates;
  const showtimes = options?.showtimes ?? emptyShowtimes;
  const selectedDateValue = dates.some((date) => date.value === selectedDate)
    ? selectedDate
    : dates[0]?.value ?? "";
  const selectedCinemaValue = cinemas.some((cinema) => cinema.slug === selectedCinemaSlug)
    ? selectedCinemaSlug
    : cinemas[0]?.slug ?? "";
  const activeCinema = cinemas.find((cinema) => cinema.slug === selectedCinemaValue) ?? cinemas[0];
  const activeDate = dates.find((date) => date.value === selectedDateValue) ?? dates[0];

  const movieById = useMemo(
    () => new Map(movies.map((movie) => [movie.id, movie])),
    [movies],
  );

  const cinemaDateShowtimes = useMemo(
    () =>
      showtimes.filter(
        (showtime) =>
          showtime.date === selectedDateValue &&
          showtime.cinemaSlug === selectedCinemaValue,
      ),
    [selectedCinemaValue, selectedDateValue, showtimes],
  );

  const roomOptions = useMemo(
    () => buildRoomOptions(cinemaDateShowtimes),
    [cinemaDateShowtimes],
  );
  const selectedRoomValue = roomOptions.some((roomOption) => roomOption.value === selectedRoom)
    ? selectedRoom
    : ALL_ROOMS;

  const filteredMovies = useMemo(() => {
    const keyword = normalizeText(query.trim());
    const groupedByMovie = new Map<number, TicketBookingShowtime[]>();

    for (const showtime of cinemaDateShowtimes) {
      if (selectedRoomValue !== ALL_ROOMS && showtime.room.name !== selectedRoomValue) {
        continue;
      }

      const movieShowtimes = groupedByMovie.get(showtime.movieId) ?? [];

      movieShowtimes.push(showtime);
      groupedByMovie.set(showtime.movieId, movieShowtimes);
    }

    return [...groupedByMovie.entries()]
      .map(([movieId, movieShowtimes]) => {
        const movie = movieById.get(movieId);

        if (!movie) {
          return null;
        }

        return {
          ...movie,
          showtimes: sortShowtimes(movieShowtimes),
          groups: groupShowtimes(movieShowtimes),
        };
      })
      .filter((movie): movie is ShowtimeMovie => {
        if (!movie) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        const searchable = normalizeText(
          [
            movie.title,
            movie.description,
            movie.country ?? "",
            movie.language ?? "",
            movie.genres.join(" "),
          ].join(" "),
        );

        return searchable.includes(keyword);
      })
      .sort(
        (leftMovie, rightMovie) =>
          new Date(leftMovie.showtimes[0]?.startTime ?? 0).getTime() -
          new Date(rightMovie.showtimes[0]?.startTime ?? 0).getTime(),
      );
  }, [cinemaDateShowtimes, movieById, query, selectedRoomValue]);

  const totalShowtimes = filteredMovies.reduce(
    (total, movie) => total + movie.showtimes.length,
    0,
  );
  const activeDateMeta = activeDate ? getDateMeta(activeDate.value) : null;
  const activeCinemaHours = getCinemaHours(cinemaDateShowtimes);
  const activeCinemaRooms = [
    ...new Set(cinemaDateShowtimes.map((showtime) => showtime.room.name)),
  ].sort((left, right) => left.localeCompare(right));
  const availableShowtimeCount = cinemaDateShowtimes.filter(
    (showtime) => showtime.availableSeats > 0,
  ).length;
  const firstVisibleShowtime =
    filteredMovies.flatMap((movie) => movie.showtimes).find((showtime) => showtime.availableSeats > 0) ??
    filteredMovies.flatMap((movie) => movie.showtimes)[0] ??
    cinemaDateShowtimes.find((showtime) => showtime.availableSeats > 0) ??
    cinemaDateShowtimes[0];
  const quickBookingHref = firstVisibleShowtime
    ? `/ticket-booking?showtime=${firstVisibleShowtime.id}`
    : "/ticket-booking";
  const heroMovie =
    filteredMovies[0] ??
    movieById.get(cinemaDateShowtimes[0]?.movieId ?? 0) ??
    movies[0] ??
    null;
  const heroImage = heroMovie?.bannerUrl || heroMovie?.posterUrl || "/movies/demo.png";

  const resetFilters = () => {
    if (options) {
      const initialSelection = getInitialSelection(options);

      setSelectedCinemaSlug(initialSelection.cinemaSlug);
      setSelectedDate(initialSelection.date);
    }

    setSelectedRoom(ALL_ROOMS);
    setQuery("");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[1180px] rounded-lg border border-white/10 bg-[#151719] p-6">
          <div className="flex items-center gap-3 text-sm font-bold text-white/65">
            <Loader2 size={18} className="animate-spin text-red-300" />
            Đang tải lịch chiếu từ database...
          </div>
        </section>
      </main>
    );
  }

  if (!options || dates.length === 0 || cinemas.length === 0 || showtimes.length === 0) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[980px] rounded-lg border border-white/10 bg-[#151719] px-6 py-14 text-center">
          <Film className="mx-auto text-white/30" size={44} />
          <h1 className="mt-4 text-2xl font-black">Chưa có lịch chiếu</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/55">
            {error ??
              "Database hiện chưa có suất chiếu đang mở bán. Vui lòng quay lại sau."}
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
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl">
          <Image
            src={heroImage}
            alt={heroMovie?.title ?? activeCinema?.name ?? "Lịch chiếu CineX"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/30" />

          <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10">
            <div className="max-w-[760px]">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40">
                  <Film size={15} />
                  Lịch chiếu CineX
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  Dữ liệu database
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                {activeCinema?.name ?? "Lịch chiếu phim"}
              </h1>

              <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/72 sm:text-base">
                Chọn ngày, rạp và phòng chiếu phù hợp. Mỗi suất hiển thị phòng
                chiếu, số ghế còn lại và giá vé được lấy trực tiếp từ database.
              </p>

              <div className="mt-6 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-red-300" />
                  <span>{activeCinema?.address ?? "Đang cập nhật địa chỉ"}</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                  <Clock3 size={18} className="shrink-0 text-cyan-300" />
                  <span>{activeCinemaHours}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white/50">
                {activeDate?.label ?? "Ngày chiếu"}
              </p>
              <p className="mt-2 text-3xl font-black">
                {activeDateMeta?.date ?? "--/--"}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {activeDateMeta?.fullDate ?? activeDate?.dateLabel}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Stat label="Phim" value={filteredMovies.length.toString()} />
                <Stat label="Suất chiếu" value={totalShowtimes.toString()} />
              </div>

              <Link
                href={quickBookingHref}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
              >
                <Ticket size={18} />
                Đặt vé nhanh
              </Link>
            </div>
          </div>
        </section>

        

        <section className="mt-6 rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((date) => {
              const dateMeta = getDateMeta(date.value);

              return (
                <button
                  key={date.value}
                  type="button"
                  aria-pressed={selectedDateValue === date.value}
                  onClick={() => setSelectedDate(date.value)}
                  className={`min-w-[116px] rounded-md border px-4 py-3 text-left transition ${
                    selectedDateValue === date.value
                      ? "border-red-500 bg-red-600 text-white"
                      : "border-white/10 bg-black/25 text-white/70 hover:border-red-500/60 hover:text-white"
                  }`}
                >
                  <span className="block text-xs font-bold uppercase">
                    {date.label}
                  </span>
                  <span className="mt-1 block text-lg font-black">
                    {dateMeta.date}
                  </span>
                  <span className="block text-xs opacity-75">{dateMeta.day}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_1fr_auto]">
            <label className="grid gap-2 text-xs font-bold uppercase text-white/45">
              Rạp
              <select
                value={selectedCinemaValue}
                onChange={(event) => setSelectedCinemaSlug(event.target.value)}
                className="h-11 rounded-md border border-white/10 bg-black/30 px-3 text-sm font-semibold normal-case text-white outline-none focus:border-red-500"
              >
                {cinemas.map((cinema) => (
                  <option
                    key={cinema.slug}
                    value={cinema.slug}
                    className="bg-[#151719]"
                  >
                    {cinema.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-xs font-bold uppercase text-white/45">
              Phòng chiếu
              <select
                value={selectedRoomValue}
                onChange={(event) => setSelectedRoom(event.target.value)}
                className="h-11 rounded-md border border-white/10 bg-black/30 px-3 text-sm font-semibold normal-case text-white outline-none focus:border-red-500"
              >
                {roomOptions.map((roomOption) => (
                  <option
                    key={roomOption.value}
                    value={roomOption.value}
                    className="bg-[#151719]"
                  >
                    {roomOption.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="relative self-end">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm phim, thể loại, quốc gia..."
                className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-11 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-500"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-md border border-white/10 px-4 text-sm font-bold text-white/75 transition hover:border-red-500 hover:text-white"
            >
              <Filter size={17} />
              Đặt lại
            </button>
          </div>
        </section>
              <WeeklyTicketPriceTable />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
          <section>
            <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-red-300">
                  {activeDateMeta?.fullDate ?? activeDate?.dateLabel}
                </p>
                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Lịch chiếu phim
                </h2>
              </div>

              <p className="text-sm text-white/50">
                {filteredMovies.length} phim, {totalShowtimes} suất chiếu
              </p>
            </div>

            {filteredMovies.length > 0 ? (
              <div className="space-y-5">
                {filteredMovies.map((movie) => (
                  <ShowtimeMovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-[#151719] px-5 py-12 text-center">
                <p className="text-lg font-bold">
                  Không có suất chiếu phù hợp
                </p>
                <p className="mt-2 text-sm text-white/50">
                  Thử đổi ngày, rạp, phòng chiếu hoặc từ khóa tìm kiếm.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-md bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
                >
                  Xem lịch mặc định
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-lg border border-white/10 bg-[#151719] p-5">
              <div className="mb-4 flex items-center gap-3">
                <Info className="text-cyan-300" size={22} />
                <h2 className="text-xl font-black">Thông tin rạp</h2>
              </div>

              <div className="space-y-4 text-sm text-white/65">
                <InfoRow
                  icon={<MapPin size={17} />}
                  label={activeCinema?.address ?? "Đang cập nhật địa chỉ"}
                />
                <InfoRow
                  icon={<Phone size={17} />}
                  label={activeCinema?.phone ?? "Đang cập nhật số điện thoại"}
                />
                <InfoRow icon={<Clock3 size={17} />} label={activeCinemaHours} />
                <InfoRow
                  icon={<Film size={17} />}
                  label={`${activeCinema?.roomCount ?? activeCinemaRooms.length} phòng chiếu`}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(activeCinemaRooms.length > 0 ? activeCinemaRooms : ["Đang cập nhật"]).map(
                  (room) => (
                    <span
                      key={room}
                      className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/75"
                    >
                      {room}
                    </span>
                  ),
                )}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#151719] p-5">
              <div className="mb-4 flex items-center gap-3">
                <BadgePercent className="text-red-400" size={22} />
                <h2 className="text-xl font-black">Ưu đãi hôm nay</h2>
              </div>

              <div className="space-y-3">
                {[
                  ["U22 CineX", "Vé từ 55.000đ cho học sinh, sinh viên."],
                  ["Combo Couple", "Giảm 20% bắp nước khi đặt 2 vé."],
                  ["Thứ tư vui vẻ", "Đồng giá 65.000đ cho suất 2D."],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-lg border border-white/10 bg-black/25 p-4"
                  >
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-white/50">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#151719] p-5">
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Ticket className="text-red-300" size={22} />
                Trạng thái ghế
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {availableShowtimeCount}/{cinemaDateShowtimes.length} suất trong
                lựa chọn hiện tại còn ghế để đặt.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function WeeklyTicketPriceTable() {
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="caption-top border-b border-white/10 px-5 py-5 text-left">
            <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block text-sm font-bold uppercase text-red-300">
                  Giá vé CineX
                </span>
                <span className="mt-2 block text-2xl font-black text-white sm:text-3xl">
                  Bảng giá vé xem phim
                </span>
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-xs font-black uppercase text-white/70">
                <BadgePercent size={15} />
                Từ Thứ 2 đến Chủ nhật
              </span>
            </span>
          </caption>
          <thead className="bg-white/8 text-sm uppercase text-white/75">
            <tr>
              <th scope="col" className="border border-white/10 px-5 py-4 font-black">
                Ngày
              </th>
              <th scope="col" className="border border-white/10 px-5 py-4 font-black">
                Chính sách
              </th>
              <th scope="col" className="border border-white/10 px-5 py-4 text-center font-black">
                Giá vé
              </th>
            </tr>
          </thead>
          <tbody>
            {weeklyTicketPriceRows.map((row) => (
              <tr
                key={row.day}
                className="transition hover:bg-white/5"
              >
                <th
                  scope="row"
                  className="border border-white/10 px-5 py-4 text-sm font-black text-white"
                >
                  {row.day}
                </th>
                <td className="border border-white/10 px-5 py-4 text-sm font-semibold text-white/62">
                  {row.policy}
                </td>
                <td
                  className={`border border-white/10 px-5 py-4 text-center text-base font-black ${row.tone}`}
                >
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ShowtimeMovieCard({ movie }: { movie: ShowtimeMovie }) {
  const router = useRouter();
  const firstAvailableShowtime =
    movie.showtimes.find((showtime) => showtime.availableSeats > 0) ??
    movie.showtimes[0];
  const detailHref = `/movies/${movie.id}`;
  const bookingHref = firstAvailableShowtime
    ? `/ticket-booking?showtime=${firstAvailableShowtime.id}`
    : `/ticket-booking?movie=${movie.slug}`;
  const genreLabel = movie.genres.length > 0 ? movie.genres.join(", ") : "Đang cập nhật";
  const countryLabel = movie.country ?? "Đang cập nhật";
  const openDetailPage = () => router.push(detailHref);
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    openDetailPage();
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetailPage();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Xem chi tiết phim ${movie.title}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group cursor-pointer overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition hover:border-red-500/80 hover:shadow-red-950/25 focus-visible:border-red-500/80 focus-visible:outline-none"
    >
      <div className="grid gap-0 md:grid-cols-[190px_1fr]">
        <div className="relative min-h-[250px] overflow-hidden bg-black md:min-h-full">
          <Link
            href={detailHref}
            aria-label={`Xem chi tiết phim ${movie.title}`}
            className="absolute inset-0 block"
          >
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 100vw, 190px"
              className="object-cover transition duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          </Link>
          <Link
            href={detailHref}
            className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Info size={14} />
            Chi tiết
          </Link>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold text-white">
                  {movie.ageLimit}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/75">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  {movie.rating}/10
                </span>
              </div>

              <h3 className="text-2xl font-black">{movie.title}</h3>
              <p className="mt-2 line-clamp-2 max-w-[680px] text-sm leading-6 text-white/55">
                {movie.description}
              </p>
            </div>

            <Link
              href={bookingHref}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
            >
              <Ticket size={15} />
              Đặt vé
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5">
              <Clock3 size={13} />
              {movie.duration}
            </span>
            <span className="rounded-md bg-white/8 px-2.5 py-1.5">
              {genreLabel}
            </span>
            <span className="rounded-md bg-white/8 px-2.5 py-1.5">
              {countryLabel}
            </span>
            <span className="rounded-md bg-white/8 px-2.5 py-1.5">
              {movie.language ?? "Đang cập nhật"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {movie.groups.map((group) => (
              <div key={`${movie.id}-${group.label}-${group.price}`}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black">{group.label}</p>
                  <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/55">
                    {group.price}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {group.times.map((showtime) => (
                    <ShowtimeButton key={showtime.id} showtime={showtime} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ShowtimeButton({ showtime }: { showtime: TicketBookingShowtime }) {
  const hasSeats = showtime.availableSeats > 0;
  const className = `rounded-md border px-3 py-2.5 text-left transition ${
    hasSeats
      ? showtime.availableSeats <= 12
        ? "border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20"
        : "border-white/10 bg-black/25 hover:border-red-500 hover:bg-red-600"
      : "cursor-not-allowed border-white/10 bg-black/15 opacity-55"
  }`;
  const content = (
    <>
      <span className="block text-base font-black">{showtime.time}</span>
      <span className="mt-1 block text-[11px] font-semibold text-white/55">
        {hasSeats ? `còn ${showtime.availableSeats} ghế` : "hết ghế"}
      </span>
    </>
  );

  if (!hasSeats) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/ticket-booking?showtime=${showtime.id}`} className={className}>
      {content}
    </Link>
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

function InfoRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-red-300">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
