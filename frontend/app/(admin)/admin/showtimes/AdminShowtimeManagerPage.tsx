"use client";

import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createAdminShowtime,
  deleteAdminShowtime,
  getAdminShowtimes,
  updateAdminShowtime,
  type AdminShowtimeOptions,
  type AdminShowtimePayload,
  type AdminShowtimeRecord,
  type AdminShowtimeStats,
  type AdminShowtimeStatusCode,
} from "@/lib/admin-showtimes-api";

type AdminShowtimeManagerVariant = "schedule" | "sessions";

type AdminShowtimeManagerPageProps = {
  variant: AdminShowtimeManagerVariant;
};

type ShowtimeFilters = {
  query: string;
  dateKey: string;
  statusCode: "" | AdminShowtimeStatusCode;
};

type ShowtimeFormState = {
  id?: number;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  basePrice: string;
  statusCode: AdminShowtimeStatusCode;
};

type ShowtimeModalMode = "create" | "edit";

const showtimePageSize = 10;
const showtimeChangeoverMinutes = 15;
const emptyStats: AdminShowtimeStats = {
  totalShowtimes: 0,
  todayShowtimes: 0,
  activeShowtimes: 0,
  cancelledShowtimes: 0,
  finishedShowtimes: 0,
  ticketsSold: 0,
};
const emptyOptions: AdminShowtimeOptions = {
  movies: [],
  rooms: [],
};
const defaultFilters: ShowtimeFilters = {
  query: "",
  dateKey: "",
  statusCode: "",
};
const statusOptions: Array<{ value: AdminShowtimeStatusCode; label: string }> = [
  { value: "ACTIVE", label: "Đang mở bán" },
  { value: "CANCELLED", label: "Tạm dừng" },
  { value: "FINISHED", label: "Đã kết thúc" },
];
const variantConfig = {
  schedule: {
    title: "Quản lý lịch chiếu",
    description:
      "Theo dõi lịch chiếu theo ngày, phim, rạp và phòng chiếu từ database.",
    primaryAction: "Thêm lịch chiếu",
    tableTitle: "Danh sách lịch chiếu",
    tableDescription:
      "Mỗi dòng là một lịch chiếu cụ thể đang được dùng để mở bán vé.",
    searchPlaceholder: "Tìm theo ngày, phim, rạp, phòng...",
    emptyMessage: "Chưa có lịch chiếu phù hợp.",
  },
  sessions: {
    title: "Quản lý suất chiếu",
    description:
      "Tạo, cập nhật và xóa từng suất chiếu với phòng, khung giờ, giá vé và trạng thái.",
    primaryAction: "Thêm suất chiếu",
    tableTitle: "Danh sách suất chiếu",
    tableDescription:
      "Dữ liệu lấy trực tiếp từ bảng showtimes, liên kết phim, phòng chiếu và rạp.",
    searchPlaceholder: "Tìm phim, phòng chiếu, giá vé...",
    emptyMessage: "Chưa có suất chiếu phù hợp.",
  },
} as const;

function formatStatValue(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function statusClass(statusCode: AdminShowtimeStatusCode) {
  if (statusCode === "ACTIVE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (statusCode === "CANCELLED") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function addMinutesToDateTimeLocal(value: string, minutes: number) {
  if (!value || !Number.isFinite(minutes)) {
    return "";
  }

  const localDateTimeMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );

  if (!localDateTimeMatch) {
    return "";
  }

  const [, year, month, day, hour, minute] = localDateTimeMatch;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  date.setMinutes(date.getMinutes() + minutes);

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getSelectedMovieDuration(
  options: AdminShowtimeOptions,
  movieId: string,
) {
  return options.movies.find((movie) => movie.id === Number(movieId))?.duration ?? null;
}

function getCalculatedEndTime(
  options: AdminShowtimeOptions,
  formState: ShowtimeFormState,
) {
  const movieDuration = getSelectedMovieDuration(options, formState.movieId);

  if (!movieDuration) {
    return formState.endTime;
  }

  return addMinutesToDateTimeLocal(
    formState.startTime,
    movieDuration + showtimeChangeoverMinutes,
  );
}

function buildFormState(
  options: AdminShowtimeOptions,
  showtime?: AdminShowtimeRecord,
): ShowtimeFormState {
  return {
    id: showtime?.id,
    movieId: String(showtime?.movieId ?? options.movies[0]?.id ?? ""),
    roomId: String(showtime?.roomId ?? options.rooms[0]?.id ?? ""),
    startTime: toDateTimeLocal(showtime?.startTime),
    endTime: toDateTimeLocal(showtime?.endTime),
    basePrice: showtime ? String(showtime.basePrice) : "90000",
    statusCode: showtime?.statusCode ?? "ACTIVE",
  };
}

function buildPayload(
  formState: ShowtimeFormState,
  options: AdminShowtimeOptions,
): AdminShowtimePayload {
  return {
    movieId: Number(formState.movieId),
    roomId: Number(formState.roomId),
    startTime: formState.startTime,
    endTime: getCalculatedEndTime(options, formState),
    basePrice: Number(formState.basePrice),
    statusCode: formState.statusCode,
  };
}

function matchesShowtimeFilters(
  showtime: AdminShowtimeRecord,
  filters: ShowtimeFilters,
) {
  const normalizedQuery = normalizeText(filters.query.trim());
  const searchableText = normalizeText(
    [
      showtime.movieTitle,
      showtime.movieSlug,
      showtime.cinemaName,
      showtime.roomName,
      showtime.date,
      showtime.dateKey,
      showtime.timeRange,
      showtime.price,
      showtime.status,
    ].join(" "),
  );
  const matchesQuery =
    !normalizedQuery || searchableText.includes(normalizedQuery);
  const matchesDate = !filters.dateKey || showtime.dateKey === filters.dateKey;
  const matchesStatus =
    !filters.statusCode || showtime.statusCode === filters.statusCode;

  return matchesQuery && matchesDate && matchesStatus;
}

export default function AdminShowtimeManagerPage({
  variant,
}: AdminShowtimeManagerPageProps) {
  const config = variantConfig[variant];
  const [showtimes, setShowtimes] = useState<AdminShowtimeRecord[]>([]);
  const [options, setOptions] = useState<AdminShowtimeOptions>(emptyOptions);
  const [stats, setStats] = useState<AdminShowtimeStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingShowtimeId, setDeletingShowtimeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [modalMode, setModalMode] = useState<ShowtimeModalMode>("create");
  const [formState, setFormState] = useState<ShowtimeFormState | null>(null);
  const [saving, setSaving] = useState(false);

  const loadShowtimes = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const data = await getAdminShowtimes({
        sort: variant === "sessions" ? "recent" : "schedule",
      });

      setShowtimes(data.showtimes);
      setOptions(data.options);
      setStats(data.stats);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch chiếu từ database.",
      );
    } finally {
      setLoading(false);
    }
  }, [variant]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadShowtimes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShowtimes]);

  const filteredShowtimes = useMemo(
    () =>
      showtimes.filter((showtime) => matchesShowtimeFilters(showtime, filters)),
    [filters, showtimes],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredShowtimes.length / showtimePageSize),
  );
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * showtimePageSize;
  const paginatedShowtimes = filteredShowtimes.slice(
    startIndex,
    startIndex + showtimePageSize,
  );
  const endIndex = startIndex + paginatedShowtimes.length;
  const statCards = [
    {
      label: "Tổng suất",
      value: formatStatValue(stats.totalShowtimes),
      helper: "Trong bảng showtimes",
      icon: CalendarClock,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Hôm nay",
      value: formatStatValue(stats.todayShowtimes),
      helper: "Theo ngày hiện tại",
      icon: Clock3,
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Đang mở bán",
      value: formatStatValue(stats.activeShowtimes),
      helper: "Có thể đặt vé online",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Vé đã bán",
      value: formatStatValue(stats.ticketsSold),
      helper: "Theo bảng tickets",
      icon: Ticket,
      tone: "bg-amber-50 text-amber-700",
    },
  ];
  const calculatedEndTime = formState ? getCalculatedEndTime(options, formState) : "";

  const updateFilter = <Key extends keyof ShowtimeFilters>(
    key: Key,
    value: ShowtimeFilters[Key],
  ) => {
    setCurrentPage(1);
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const openCreateModal = () => {
    setActionError("");
    setModalMode("create");
    setFormState(buildFormState(options));
  };

  const openEditModal = (showtime: AdminShowtimeRecord) => {
    setActionError("");
    setModalMode("edit");
    setFormState(buildFormState(options, showtime));
  };

  const updateFormState = <Key extends keyof ShowtimeFormState>(
    key: Key,
    value: ShowtimeFormState[Key],
  ) => {
    setFormState((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const saveShowtime = async () => {
    if (!formState) {
      return;
    }

    setActionError("");

    const payload = buildPayload(formState, options);

    if (!payload.movieId || !payload.roomId || !payload.startTime) {
      setActionError("Vui lòng chọn phim, phòng chiếu và thời gian bắt đầu.");
      return;
    }

    if (!payload.endTime) {
      setActionError("Không thể tính thời gian kết thúc từ phim và thời gian bắt đầu.");
      return;
    }

    if (!Number.isFinite(payload.basePrice) || payload.basePrice < 0) {
      setActionError("Vui lòng nhập giá vé hợp lệ.");
      return;
    }

    setSaving(true);

    try {
      if (modalMode === "edit" && formState.id) {
        await updateAdminShowtime(formState.id, payload);
      } else {
        await createAdminShowtime(payload);
      }

      await loadShowtimes();
      setFormState(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể lưu suất chiếu.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeShowtime = async (showtime: AdminShowtimeRecord) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa suất chiếu "${showtime.movieTitle}" lúc ${showtime.timeRange} không?`,
    );

    if (!confirmed) {
      return;
    }

    setPageError("");
    setDeletingShowtimeId(showtime.id);

    try {
      await deleteAdminShowtime(showtime.id);
      await loadShowtimes();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể xóa suất chiếu.",
      );
    } finally {
      setDeletingShowtimeId(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            3.4.6
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {config.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {config.description}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          {config.primaryAction}
        </button>
      </section>

      {pageError ? (
        <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {pageError}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${stat.tone}`}
                >
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {stat.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 lg:grid-cols-[1fr_210px_210px_auto]"
        >
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => updateFilter("query", event.target.value)}
              placeholder={config.searchPlaceholder}
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <input
            type="date"
            value={filters.dateKey}
            onChange={(event) => updateFilter("dateKey", event.target.value)}
            aria-label="Tim theo ngay chieu"
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          />

          <select
            value={filters.statusCode}
            onChange={(event) =>
              updateFilter("statusCode", event.target.value as ShowtimeFilters["statusCode"])
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={17} />
            Lọc
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              {config.tableTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredShowtimes.length > 0
                ? `Hiển thị ${startIndex + 1}-${endIndex} / ${filteredShowtimes.length} dòng`
                : `Hiển thị 0 / ${showtimes.length} dòng`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1160px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              {variant === "schedule" ? (
                <tr>
                  <th className="px-4 py-4 font-black">Ngày chiếu</th>
                  <th className="px-4 py-4 font-black">Phim</th>
                  <th className="px-4 py-4 font-black">Cụm rạp</th>
                  <th className="px-4 py-4 font-black">Phòng</th>
                  <th className="px-4 py-4 text-center font-black">Khung giờ</th>
                  <th className="px-4 py-4 text-center font-black">Trạng thái</th>
                  <th className="px-4 py-4 text-center font-black">Thao tác</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-4 font-black">Phim</th>
                  <th className="px-4 py-4 font-black">Rạp / phòng</th>
                  <th className="px-4 py-4 font-black">Bắt đầu</th>
                  <th className="px-4 py-4 font-black">Kết thúc</th>
                  <th className="px-4 py-4 text-center font-black">Giá vé</th>
                  <th className="px-4 py-4 text-center font-black">Ghế</th>
                  <th className="px-4 py-4 text-center font-black">Trạng thái</th>
                  <th className="px-4 py-4 text-center font-black">Thao tác</th>
                </tr>
              )}
            </thead>
            <tbody className="text-slate-900">
              {paginatedShowtimes.length > 0 ? (
                paginatedShowtimes.map((showtime) =>
                  variant === "schedule" ? (
                    <tr
                      key={showtime.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm font-black text-slate-950">
                        {showtime.date}
                      </td>
                      <td className="px-4 py-4">
                        <p className="line-clamp-1 text-sm font-black text-slate-950">
                          {showtime.movieTitle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {showtime.movieDuration} phút
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {showtime.cinemaName}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {showtime.roomName}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                        {showtime.timeRange}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge showtime={showtime} />
                      </td>
                      <ActionCell
                        showtime={showtime}
                        deletingShowtimeId={deletingShowtimeId}
                        onEdit={openEditModal}
                        onDelete={removeShowtime}
                      />
                    </tr>
                  ) : (
                    <tr
                      key={showtime.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="line-clamp-1 text-sm font-black text-slate-950">
                          {showtime.movieTitle}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {showtime.movieLanguage || "Đang cập nhật"} -{" "}
                          {showtime.movieAgeLimit || "P"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        <p>{showtime.cinemaName}</p>
                        <p className="mt-1 text-slate-500">{showtime.roomName}</p>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {showtime.startLabel}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {showtime.endLabel}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                        {showtime.price}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-slate-600">
                        {showtime.availableSeats}/{showtime.totalSeats}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge showtime={showtime} />
                      </td>
                      <ActionCell
                        showtime={showtime}
                        deletingShowtimeId={deletingShowtimeId}
                        onEdit={openEditModal}
                        onDelete={removeShowtime}
                      />
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={variant === "schedule" ? 7 : 8}
                    className="px-4 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    {loading ? "Đang tải dữ liệu từ database..." : config.emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredShowtimes.length > showtimePageSize ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">
              Trang {activePage}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                type="button"
                disabled={activePage >= totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {formState ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="showtime-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6"
        >
          <div className="flex max-h-[calc(100vh-48px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-6">
              <div className="min-w-0">
                <h3
                  id="showtime-modal-title"
                  className="text-xl font-black text-slate-950"
                >
                  {modalMode === "create" ? config.primaryAction : "Cập nhật suất chiếu"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Chọn phim, phòng chiếu, khung giờ và giá vé.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng form suất chiếu"
                onClick={() => setFormState(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X size={22} />
              </button>
            </div>

            {actionError ? (
              <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm font-bold text-red-700">
                {actionError}
              </div>
            ) : null}

            <div className="grid gap-5 overflow-y-auto px-6 py-6 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Phim</span>
                <select
                  value={formState.movieId}
                  onChange={(event) => updateFormState("movieId", event.target.value)}
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                >
                  <option value="">Chọn phim</option>
                  {options.movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Phòng chiếu</span>
                <select
                  value={formState.roomId}
                  onChange={(event) => updateFormState("roomId", event.target.value)}
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                >
                  <option value="">Chọn phòng</option>
                  {options.rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.cinemaName} - {room.name} ({room.totalSeats} ghế)
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Bắt đầu</span>
                <input
                  type="datetime-local"
                  value={formState.startTime}
                  onChange={(event) => updateFormState("startTime", event.target.value)}
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Kết thúc</span>
                <input
                  type="datetime-local"
                  value={calculatedEndTime}
                  readOnly
                  className="h-11 cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-500 outline-none"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Giá vé cơ bản</span>
                <span className="relative">
                  <CircleDollarSign
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formState.basePrice}
                    onChange={(event) =>
                      updateFormState("basePrice", event.target.value)
                    }
                    className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Trạng thái</span>
                <select
                  value={formState.statusCode}
                  onChange={(event) =>
                    updateFormState(
                      "statusCode",
                      event.target.value as AdminShowtimeStatusCode,
                    )
                  }
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFormState(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void saveShowtime()}
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Save size={17} />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ showtime }: { showtime: AdminShowtimeRecord }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${statusClass(
        showtime.statusCode,
      )}`}
    >
      {showtime.status}
    </span>
  );
}

function ActionCell({
  showtime,
  deletingShowtimeId,
  onEdit,
  onDelete,
}: {
  showtime: AdminShowtimeRecord;
  deletingShowtimeId: number | null;
  onEdit: (showtime: AdminShowtimeRecord) => void;
  onDelete: (showtime: AdminShowtimeRecord) => void;
}) {
  return (
    <td className="px-4 py-4">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`Sửa ${showtime.movieTitle}`}
          onClick={() => onEdit(showtime)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
        >
          <Pencil size={16} />
        </button>
        <button
          type="button"
          aria-label={`Xóa ${showtime.movieTitle}`}
          disabled={deletingShowtimeId === showtime.id}
          onClick={() => void onDelete(showtime)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  );
}
