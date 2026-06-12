"use client";

import Link from "next/link";
import { Armchair, CalendarDays, MapPin, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  HomeCinemaBranch,
  HomeScheduleDate,
  HomeShowtime,
} from "@/lib/home-movies";

type QuickBookingPanelProps = {
  dates: HomeScheduleDate[];
  cinemas: HomeCinemaBranch[];
  showtimes: HomeShowtime[];
};

const vietnamTimeZone = "Asia/Ho_Chi_Minh";
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: vietnamTimeZone,
  weekday: "short",
});
const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: vietnamTimeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateLabelFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: vietnamTimeZone,
  day: "2-digit",
  month: "2-digit",
});
const weekdayIndexes = new Map([
  ["Sun", 0],
  ["Mon", 1],
  ["Tue", 2],
  ["Wed", 3],
  ["Thu", 4],
  ["Fri", 5],
  ["Sat", 6],
]);
const mondayFirstWeekdayLabels = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

function getDateKey(date: Date) {
  const parts = dateKeyFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000+07:00`);
}

function getDateKeyWithOffset(dateKey: string, offsetDays: number) {
  const date = getDateFromKey(dateKey);

  date.setUTCDate(date.getUTCDate() + offsetDays);

  return getDateKey(date);
}

function getVietnamWeekdayIndex(date: Date) {
  return weekdayIndexes.get(weekdayFormatter.format(date)) ?? date.getDay();
}

function buildCurrentWeekDates(
  referenceDate: Date,
  showtimes: HomeShowtime[],
): HomeScheduleDate[] {
  const todayKey = getDateKey(referenceDate);
  const tomorrowKey = getDateKeyWithOffset(todayKey, 1);
  const weekdayIndex = getVietnamWeekdayIndex(referenceDate);
  const mondayOffset = weekdayIndex === 0 ? -6 : 1 - weekdayIndex;
  const mondayKey = getDateKeyWithOffset(todayKey, mondayOffset);
  const showtimeCountByDate = new Map<string, number>();

  for (const showtime of showtimes) {
    showtimeCountByDate.set(
      showtime.date,
      (showtimeCountByDate.get(showtime.date) ?? 0) + 1,
    );
  }

  return mondayFirstWeekdayLabels.map((weekdayLabel, index) => {
    const value = getDateKeyWithOffset(mondayKey, index);
    const date = getDateFromKey(value);
    const showtimeCount = showtimeCountByDate.get(value) ?? 0;
    const relativeLabel =
      value === todayKey ? "Hôm nay" : value === tomorrowKey ? "Ngày mai" : "";

    return {
      value,
      label: `${weekdayLabel}, ${dateLabelFormatter.format(date)}`,
      hint:
        showtimeCount > 0
          ? `${relativeLabel ? `${relativeLabel} - ` : ""}${showtimeCount} suất đang mở bán`
          : `${relativeLabel ? `${relativeLabel} - ` : ""}Không có suất chiếu`,
    };
  });
}

function sortShowtimes(showtimes: HomeShowtime[]) {
  return [...showtimes].sort(
    (leftShowtime, rightShowtime) =>
      new Date(leftShowtime.startTime).getTime() -
      new Date(rightShowtime.startTime).getTime(),
  );
}

export default function QuickBookingPanel({
  dates,
  cinemas,
  showtimes,
}: QuickBookingPanelProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const dateOptions = useMemo(
    () => buildCurrentWeekDates(currentDate, showtimes),
    [currentDate, showtimes],
  );
  const todayDateValue = getDateKey(currentDate);
  const initialDate =
    dateOptions.find((date) => date.value === todayDateValue)?.value ??
    dateOptions[0]?.value ??
    dates[0]?.value ??
    "";
  const initialCinema =
    showtimes.find((showtime) => showtime.date === initialDate)?.cinema.slug ??
    cinemas[0]?.value ??
    "";
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedCinema, setSelectedCinema] = useState(initialCinema);
  const selectedDateValue = dateOptions.some(
    (date) => date.value === selectedDate,
  )
    ? selectedDate
    : initialDate;
  const selectedCinemaValue = cinemas.some(
    (cinema) => cinema.value === selectedCinema,
  )
    ? selectedCinema
    : initialCinema;

  const selectedDateInfo =
    dateOptions.find((date) => date.value === selectedDateValue) ??
    dateOptions[0];
  const selectedCinemaInfo =
    cinemas.find((cinema) => cinema.value === selectedCinemaValue) ??
    cinemas[0];

  const visibleShowtimes = useMemo(
    () =>
      sortShowtimes(
        showtimes.filter(
          (showtime) =>
            showtime.date === selectedDateValue &&
            showtime.cinema.slug === selectedCinemaValue,
        ),
      ),
    [selectedCinemaValue, selectedDateValue, showtimes],
  );

  const previewShowtimes = visibleShowtimes.slice(0, 4);
  const hiddenShowtimeCount = Math.max(
    visibleShowtimes.length - previewShowtimes.length,
    0,
  );
  const availableCount = visibleShowtimes.filter(
    (showtime) => showtime.availableSeats > 0,
  ).length;

  if (cinemas.length === 0) {
    return (
      <section className="mt-10 border-y border-white/10 bg-[#111417]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-10 text-center">
            <p className="font-bold text-white">Chưa có rạp chiếu</p>
            <p className="mt-2 text-sm text-white/45">
              Dữ liệu phim đã được tải từ database, nhưng hiện chưa có chi
              nhánh rạp để hiển thị lịch chiếu.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 border-y border-white/10 bg-[#111417]">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <h2 className="text-sm font-bold uppercase text-red-300">
            Tìm suất nhanh
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Lịch chiếu được lấy trực tiếp từ database theo từng rạp, phim,
            phòng chiếu, giá vé và số ghế còn lại.
          </p>

          <div className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 sm:grid-cols-2">
            <SelectField
              icon={<CalendarDays size={17} />}
              label="Ngày chiếu"
              value={selectedDateValue}
              options={dateOptions}
              onChange={setSelectedDate}
            />

            <SelectField
              icon={<MapPin size={17} />}
              label="Chi nhánh rạp"
              value={selectedCinemaValue}
              options={cinemas}
              onChange={setSelectedCinema}
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoPill
              icon={<CalendarDays size={16} />}
              label={selectedDateInfo?.label ?? "Ngày chiếu"}
              value={selectedDateInfo?.hint ?? "Chưa có suất"}
            />
            <InfoPill
              icon={<MapPin size={16} />}
              label={selectedCinemaInfo?.label ?? "Rạp"}
              value={selectedCinemaInfo?.address ?? "Chưa có rạp"}
            />
            <InfoPill
              icon={<Ticket size={16} />}
              label={`${visibleShowtimes.length} suất chiếu`}
              value={`${availableCount} suất còn ghế`}
            />
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">
                {selectedDateInfo?.label}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {selectedCinemaInfo?.label}
              </p>
            </div>
            <span className="rounded-md bg-white/8 px-3 py-1.5 text-xs font-bold text-white/65">
              {availableCount}/{visibleShowtimes.length} còn ghế
            </span>
          </div>

          {visibleShowtimes.length > 0 ? (
            <>
              {previewShowtimes.map((showtime) => (
                <ShowtimeCard key={showtime.id} showtime={showtime} />
              ))}

              {hiddenShowtimeCount > 0 ? (
                <Link
                  href="/movies/now-showing"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-red-500/45 bg-red-600/10 px-4 text-sm font-black text-red-200 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                >
                  <Ticket size={17} />
                  Xem thêm lịch chiếu
                </Link>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-10 text-center">
              <p className="font-bold text-white">Không có suất chiếu</p>
              <p className="mt-2 text-sm text-white/45">
                Ngày này chưa có suất chiếu tại chi nhánh rạp đang chọn.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SelectField({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase text-white/45">
      {label}
      <span className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
          {icon}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-md border border-white/10 bg-[#151719] pl-10 pr-3 text-sm font-semibold normal-case text-white outline-none transition focus:border-red-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="flex items-center gap-2 text-xs font-bold text-white/50">
        {icon}
        {label}
      </p>
      <p className="mt-1 line-clamp-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function ShowtimeCard({ showtime }: { showtime: HomeShowtime }) {
  const hasSeats = showtime.availableSeats > 0;
  const seatLabel = hasSeats ? `Còn ${showtime.availableSeats} ghế` : "Hết ghế";
  const language = showtime.movieLanguage ?? "Đang cập nhật";
  const cardContent = (
    <>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-md text-sm font-black ${
          hasSeats ? "bg-red-600 text-white" : "bg-white/10 text-white/35"
        }`}
      >
        {showtime.time}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-bold text-white">
          {showtime.movie}
        </span>
        <span className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-white/45">
          <span>{showtime.room.name}</span>
          <span>{language}</span>
          <span className="inline-flex items-center gap-1">
            <Armchair size={13} />
            {showtime.availableSeats}/{showtime.totalSeats}
          </span>
        </span>
      </span>
      <span className="text-right">
        <span className="block text-sm font-black text-red-300">
          {showtime.price}
        </span>
        <span
          className={`mt-1 inline-flex rounded-md px-2 py-1 text-xs font-bold ${
            hasSeats
              ? "bg-emerald-500/12 text-emerald-300"
              : "bg-red-500/12 text-red-300"
          }`}
        >
          {seatLabel}
        </span>
      </span>
    </>
  );

  if (!hasSeats) {
    return (
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-black/15 px-4 py-3 opacity-75">
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/ticket-booking?showtime=${showtime.id}`}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-black/25 px-4 py-3 transition hover:border-red-500/70 hover:bg-black/40"
    >
      {cardContent}
    </Link>
  );
}
