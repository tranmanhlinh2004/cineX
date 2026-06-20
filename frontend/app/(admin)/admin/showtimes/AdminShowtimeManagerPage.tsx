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
  getAdminMovies,
  updateAdminMovieSchedule,
  type AdminMovieRecord,
} from "@/lib/admin-movies-api";
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
import { PermissionButton } from "@/components/admin/PermissionControls";
import {
  canUsePermissionRule,
  permissionDeniedMessage,
  type PermissionRule,
} from "@/lib/admin-permissions";
import { showToast } from "@/lib/toast";
import { useAuthUser } from "@/lib/use-auth-user";

type AdminShowtimeManagerVariant = "schedule" | "sessions";

type AdminShowtimeManagerPageProps = {
  variant: AdminShowtimeManagerVariant;
};

type ShowtimeFilters = {
  query: string;
  dateKey: string;
  roomId: string;
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

type MovieScheduleFormState = {
  movieId: string;
  releaseDate: string;
  endDate: string;
};

type ShowtimeModalMode = "create" | "edit";
type MovieScheduleModalMode = "create" | "edit";

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

function getVietnamDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getDefaultShowtimeStartTime(dateKey?: string) {
  return `${dateKey || getVietnamDateKey()}T09:00`;
}

const defaultFilters: ShowtimeFilters = {
  query: "",
  dateKey: "",
  roomId: "",
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
      "Thêm phim vào lịch chiếu theo khoảng ngày, trước khi tạo các suất chiếu cụ thể.",
    primaryAction: "Thêm lịch chiếu",
    tableTitle: "Phim trong lịch chiếu",
    tableDescription:
      "Mỗi dòng là một phim được mở trong lịch chiếu của ngày đang chọn.",
    searchPlaceholder: "Tìm theo phim, thể loại, trạng thái...",
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

function formatDateKeyLabel(dateKey: string) {
  const dateKeyMatch = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateKeyMatch) {
    return dateKey;
  }

  const [, year, month, day] = dateKeyMatch;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, Number(day)));
}

function addDaysToDateKey(dateKey: string, days: number) {
  const dateKeyMatch = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!dateKeyMatch) {
    return dateKey;
  }

  const [, year, month, day] = dateKeyMatch;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  date.setDate(date.getDate() + days);

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function dateKeyFromIso(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? getVietnamDateKey(date) : "";
}

function isMovieScheduledOnDate(movie: AdminMovieRecord, dateKey: string) {
  const releaseDateKey = dateKeyFromIso(movie.releaseDateIso);
  const endDateKey = dateKeyFromIso(movie.endDateIso);

  return (
    movie.statusCode === "NOW_SHOWING" &&
    (!releaseDateKey || releaseDateKey <= dateKey) &&
    (!endDateKey || endDateKey >= dateKey)
  );
}

function movieScheduleStatusClass(statusCode: AdminMovieRecord["statusCode"]) {
  if (statusCode === "NOW_SHOWING") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (statusCode === "COMING_SOON") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
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
  dateKey?: string,
): ShowtimeFormState {
  return {
    id: showtime?.id,
    movieId: String(showtime?.movieId ?? options.movies[0]?.id ?? ""),
    roomId: String(showtime?.roomId ?? options.rooms[0]?.id ?? ""),
    startTime: showtime
      ? toDateTimeLocal(showtime.startTime)
      : getDefaultShowtimeStartTime(dateKey),
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
  const matchesRoom =
    !filters.roomId || showtime.roomId === Number(filters.roomId);
  const matchesStatus =
    !filters.statusCode || showtime.statusCode === filters.statusCode;

  return matchesQuery && matchesDate && matchesRoom && matchesStatus;
}

function matchesMovieScheduleFilters(
  movie: AdminMovieRecord,
  dailyShowtimes: AdminShowtimeRecord[],
  query: string,
) {
  const normalizedQuery = normalizeText(query.trim());

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = normalizeText(
    [
      movie.title,
      movie.genre,
      movie.genres.join(" "),
      movie.status,
      movie.releaseDate,
      movie.endDate,
      ...dailyShowtimes.flatMap((showtime) => [
        showtime.cinemaName,
        showtime.roomName,
        showtime.timeRange,
      ]),
    ].join(" "),
  );

  return searchableText.includes(normalizedQuery);
}

export default function AdminShowtimeManagerPage({
  variant,
}: AdminShowtimeManagerPageProps) {
  const config = variantConfig[variant];
  const authUser = useAuthUser();
  const [movies, setMovies] = useState<AdminMovieRecord[]>([]);
  const [showtimes, setShowtimes] = useState<AdminShowtimeRecord[]>([]);
  const [options, setOptions] = useState<AdminShowtimeOptions>(emptyOptions);
  const [stats, setStats] = useState<AdminShowtimeStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingShowtimeId, setDeletingShowtimeId] = useState<number | null>(null);
  const [deletingMovieScheduleId, setDeletingMovieScheduleId] =
    useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ShowtimeFilters>(() => ({
    ...defaultFilters,
    dateKey: getVietnamDateKey(),
  }));
  const [modalMode, setModalMode] = useState<ShowtimeModalMode>("create");
  const [scheduleModalMode, setScheduleModalMode] =
    useState<MovieScheduleModalMode>("create");
  const [formState, setFormState] = useState<ShowtimeFormState | null>(null);
  const [movieScheduleForm, setMovieScheduleForm] =
    useState<MovieScheduleFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingMovieSchedule, setSavingMovieSchedule] = useState(false);

  const loadShowtimes = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const [data, movieData] = await Promise.all([
        getAdminShowtimes({
          sort: variant === "sessions" ? "recent" : "schedule",
          date: filters.dateKey || undefined,
        }),
        variant === "schedule" ? getAdminMovies() : Promise.resolve(null),
      ]);

      setShowtimes(data.showtimes);
      setOptions(data.options);
      setStats(data.stats);
      if (movieData) {
        setMovies(movieData.movies);
      }
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch chiếu từ database.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters.dateKey, variant]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadShowtimes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadShowtimes]);

  const selectedDateKey = filters.dateKey || getVietnamDateKey();
  const selectedRoomId = filters.roomId ? Number(filters.roomId) : null;
  const selectedRoom =
    options.rooms.find((room) => room.id === selectedRoomId) ?? null;
  const filteredShowtimes = useMemo(
    () =>
      showtimes.filter((showtime) => matchesShowtimeFilters(showtime, filters)),
    [filters, showtimes],
  );
  const dailyShowtimesByMovieId = useMemo(() => {
    const groupedShowtimes = new Map<number, AdminShowtimeRecord[]>();

    for (const showtime of showtimes) {
      if (showtime.dateKey !== selectedDateKey) {
        continue;
      }

      groupedShowtimes.set(showtime.movieId, [
        ...(groupedShowtimes.get(showtime.movieId) ?? []),
        showtime,
      ]);
    }

    return groupedShowtimes;
  }, [selectedDateKey, showtimes]);
  const scheduledMovies = useMemo(
    () =>
      movies.filter((movie) => isMovieScheduledOnDate(movie, selectedDateKey)),
    [movies, selectedDateKey],
  );
  const filteredScheduleMovies = useMemo(
    () =>
      scheduledMovies.filter((movie) =>
        matchesMovieScheduleFilters(
          movie,
          dailyShowtimesByMovieId.get(movie.id) ?? [],
          filters.query,
        ),
      ),
    [dailyShowtimesByMovieId, filters.query, scheduledMovies],
  );
  const availableScheduleMovies = useMemo(
    () =>
      movies
        .filter((movie) => !isMovieScheduledOnDate(movie, selectedDateKey))
        .sort((left, right) => left.title.localeCompare(right.title, "vi")),
    [movies, selectedDateKey],
  );
  const scheduledMoviesWithDailyShowtimes = scheduledMovies.filter(
    (movie) => (dailyShowtimesByMovieId.get(movie.id)?.length ?? 0) > 0,
  );
  const scheduledMoviesWithoutDailyShowtimes = scheduledMovies.filter(
    (movie) => (dailyShowtimesByMovieId.get(movie.id)?.length ?? 0) === 0,
  );
  const moviesWithoutDailyShowtimes = useMemo(() => {
    const movieIdsWithShowtimes = new Set(
      showtimes
        .filter(
          (showtime) => selectedRoomId === null || showtime.roomId === selectedRoomId,
        )
        .map((showtime) => showtime.movieId),
    );

    return options.movies.filter((movie) => !movieIdsWithShowtimes.has(movie.id));
  }, [options.movies, selectedRoomId, showtimes]);
  const visibleRowCount =
    variant === "schedule" ? filteredScheduleMovies.length : filteredShowtimes.length;
  const sourceRowCount =
    variant === "schedule" ? scheduledMovies.length : showtimes.length;
  const totalPages = Math.max(
    1,
    Math.ceil(visibleRowCount / showtimePageSize),
  );
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * showtimePageSize;
  const paginatedScheduleMovies = filteredScheduleMovies.slice(
    startIndex,
    startIndex + showtimePageSize,
  );
  const paginatedShowtimes = filteredShowtimes.slice(
    startIndex,
    startIndex + showtimePageSize,
  );
  const activePageRowCount =
    variant === "schedule"
      ? paginatedScheduleMovies.length
      : paginatedShowtimes.length;
  const endIndex = startIndex + activePageRowCount;
  const statCards =
    variant === "schedule"
      ? [
          {
            label: "Phim trong lịch",
            value: formatStatValue(scheduledMovies.length),
            helper: `Ngày ${formatDateKeyLabel(selectedDateKey)}`,
            icon: CalendarClock,
            tone: "bg-blue-50 text-blue-700",
          },
          {
            label: "Đã có suất",
            value: formatStatValue(scheduledMoviesWithDailyShowtimes.length),
            helper: "Đã tạo bên menu suất chiếu",
            icon: CheckCircle2,
            tone: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Chưa có suất",
            value: formatStatValue(scheduledMoviesWithoutDailyShowtimes.length),
            helper: "Chờ tạo suất chiếu",
            icon: Clock3,
            tone: "bg-red-50 text-red-700",
          },
          {
            label: "Vé đã bán",
            value: formatStatValue(stats.ticketsSold),
            helper: "Từ các suất trong ngày",
            icon: Ticket,
            tone: "bg-amber-50 text-amber-700",
          },
        ]
      : [
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
  const movieScheduleOptions =
    movieScheduleForm && scheduleModalMode === "edit"
      ? movies.filter((movie) => String(movie.id) === movieScheduleForm.movieId)
      : availableScheduleMovies;
  const permissionsLoaded = Array.isArray(authUser?.permissions);
  const primaryActionPermissionRule: PermissionRule =
    variant === "schedule"
      ? { permission: "showtime.schedule.create" }
      : { permission: "showtime.session.create" };
  const canUseAction = (rule: PermissionRule) =>
    !permissionsLoaded || canUsePermissionRule(authUser, rule);
  const guardAction = (rule: PermissionRule) => {
    if (canUseAction(rule)) {
      return true;
    }

    showToast(permissionDeniedMessage, "error");
    return false;
  };

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

  const openMovieScheduleModal = () => {
    const defaultMovie = availableScheduleMovies[0];

    setActionError("");
    setScheduleModalMode("create");
    setMovieScheduleForm({
      movieId: String(defaultMovie?.id ?? ""),
      releaseDate: selectedDateKey,
      endDate: addDaysToDateKey(selectedDateKey, 13),
    });
  };

  const openCreateModal = () => {
    if (variant === "schedule") {
      openMovieScheduleModal();
      return;
    }

    setActionError("");
    setModalMode("create");
    setFormState(buildFormState(options, undefined, filters.dateKey));
  };

  const openCreateModalForMovie = (movieId: number) => {
    setActionError("");
    setModalMode("create");
    setFormState({
      ...buildFormState(options, undefined, filters.dateKey),
      movieId: String(movieId),
      roomId: filters.roomId || String(options.rooms[0]?.id ?? ""),
    });
  };

  const openEditModal = (showtime: AdminShowtimeRecord) => {
    setActionError("");
    setModalMode("edit");
    setFormState(buildFormState(options, showtime));
  };

  const openEditMovieScheduleModal = (movie: AdminMovieRecord) => {
    setActionError("");
    setScheduleModalMode("edit");
    setMovieScheduleForm({
      movieId: String(movie.id),
      releaseDate: dateKeyFromIso(movie.releaseDateIso) || selectedDateKey,
      endDate:
        dateKeyFromIso(movie.endDateIso) || addDaysToDateKey(selectedDateKey, 13),
    });
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

  const updateMovieScheduleForm = <Key extends keyof MovieScheduleFormState>(
    key: Key,
    value: MovieScheduleFormState[Key],
  ) => {
    setMovieScheduleForm((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current,
    );
  };

  const saveMovieSchedule = async () => {
    if (!movieScheduleForm) {
      return;
    }

    setActionError("");

    if (
      !guardAction({
        permission:
          scheduleModalMode === "create"
            ? "showtime.schedule.create"
            : "showtime.manage",
      })
    ) {
      return;
    }

    const movieId = Number(movieScheduleForm.movieId);

    if (!movieId) {
      setActionError("Vui lòng chọn phim cần thêm vào lịch chiếu.");
      return;
    }

    if (!movieScheduleForm.releaseDate || !movieScheduleForm.endDate) {
      setActionError("Vui lòng chọn ngày bắt đầu và ngày kết thúc lịch chiếu.");
      return;
    }

    if (movieScheduleForm.endDate < movieScheduleForm.releaseDate) {
      setActionError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
      return;
    }

    setSavingMovieSchedule(true);

    try {
      const selectedMovie = movies.find((movie) => movie.id === movieId);
      const currentReleaseDate = dateKeyFromIso(
        selectedMovie?.releaseDateIso ?? null,
      );
      const currentEndDate = dateKeyFromIso(selectedMovie?.endDateIso ?? null);
      const shouldExtendCurrentSchedule =
        scheduleModalMode === "create" && selectedMovie?.statusCode === "NOW_SHOWING";
      const releaseDate =
        shouldExtendCurrentSchedule &&
        currentReleaseDate &&
        currentReleaseDate < movieScheduleForm.releaseDate
          ? currentReleaseDate
          : movieScheduleForm.releaseDate;
      const endDate =
        shouldExtendCurrentSchedule &&
        currentEndDate &&
        currentEndDate > movieScheduleForm.endDate
          ? currentEndDate
          : movieScheduleForm.endDate;

      await updateAdminMovieSchedule(movieId, {
        releaseDate,
        endDate,
        statusCode: "NOW_SHOWING",
      });

      await loadShowtimes();
      setMovieScheduleForm(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Không thể lưu lịch chiếu phim.",
      );
    } finally {
      setSavingMovieSchedule(false);
    }
  };

  const saveShowtime = async () => {
    if (!formState) {
      return;
    }

    setActionError("");

    if (
      !guardAction({
        permission:
          modalMode === "create"
            ? "showtime.session.create"
            : "showtime.manage",
      })
    ) {
      return;
    }

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

  const removeMovieSchedule = async (movie: AdminMovieRecord) => {
    const totalShowtimes = movie.schedule.length;

    if (totalShowtimes > 0) {
      setPageError(
        `Không thể xóa lịch chiếu của phim "${movie.title}" vì phim đã có ${totalShowtimes} suất chiếu. Vui lòng xóa các suất chiếu trước.`,
      );
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch chiếu của phim "${movie.title}" không?`,
    );

    if (!confirmed) {
      return;
    }

    setPageError("");
    setDeletingMovieScheduleId(movie.id);

    try {
      await updateAdminMovieSchedule(movie.id, {
        statusCode: "COMING_SOON",
      });
      await loadShowtimes();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Không thể xóa lịch chiếu phim.",
      );
    } finally {
      setDeletingMovieScheduleId(null);
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

        <PermissionButton
          type="button"
          permissionRule={primaryActionPermissionRule}
          onClick={openCreateModal}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          {config.primaryAction}
        </PermissionButton>
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
          className={
            variant === "schedule"
              ? "grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_auto]"
              : "grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_240px_190px_auto]"
          }
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
            aria-label="Tìm theo ngày chiếu"
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          />

          {variant === "sessions" ? (
            <>
              <select
                value={filters.roomId}
                onChange={(event) => updateFilter("roomId", event.target.value)}
                aria-label="Tìm theo phòng chiếu"
                className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
              >
                <option value="">Tất cả phòng chiếu</option>
                {options.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.cinemaName} - {room.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.statusCode}
                onChange={(event) =>
                  updateFilter(
                    "statusCode",
                    event.target.value as ShowtimeFilters["statusCode"],
                  )
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
            </>
          ) : null}

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
              {visibleRowCount > 0
                ? `Hiển thị ${startIndex + 1}-${endIndex} / ${visibleRowCount} dòng`
                : `Hiển thị 0 / ${sourceRowCount} dòng`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full border-collapse text-left ${
              variant === "schedule" ? "min-w-[940px]" : "min-w-[1160px]"
            }`}
          >
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              {variant === "schedule" ? (
                <tr>
                  <th className="px-4 py-4 font-black">Phim</th>
                  <th className="px-4 py-4 font-black">Lịch chiếu phim</th>
                  <th className="px-4 py-4 text-center font-black">Suất đã tạo</th>
                  <th className="px-4 py-4 font-black">Rạp đã có suất</th>
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
              {variant === "schedule" ? (
                paginatedScheduleMovies.length > 0 ? (
                  paginatedScheduleMovies.map((movie) => {
                    const dailyShowtimes =
                      dailyShowtimesByMovieId.get(movie.id) ?? [];
                    const totalShowtimes = movie.schedule.length;
                    const hasCreatedShowtimes = totalShowtimes > 0;
                    const cinemaNames = [
                      ...new Set(
                        dailyShowtimes.map((showtime) => showtime.cinemaName),
                      ),
                    ];

                    return (
                      <tr
                        key={movie.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <p className="line-clamp-1 text-sm font-black text-slate-950">
                            {movie.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {movie.duration} • {movie.genre}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                          <p>{movie.releaseDate || "Chưa đặt ngày bắt đầu"}</p>
                          <p className="mt-1 text-slate-500">
                            {movie.endDate || "Không giới hạn ngày kết thúc"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-600">
                          <p className="font-black text-slate-950">
                            {dailyShowtimes.length}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                          {cinemaNames.length > 0
                            ? cinemaNames.join(", ")
                            : "Chưa tạo suất"}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${movieScheduleStatusClass(
                              movie.statusCode,
                            )}`}
                          >
                            {movie.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <PermissionButton
                              type="button"
                              permissionRule={{ permission: "showtime.manage" }}
                              aria-label={`Sửa lịch chiếu ${movie.title}`}
                              onClick={() => openEditMovieScheduleModal(movie)}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </PermissionButton>
                            <PermissionButton
                              type="button"
                              permissionRule={{ permission: "showtime.manage" }}
                              aria-label={`Xóa lịch chiếu ${movie.title}`}
                              title={
                                hasCreatedShowtimes
                                  ? "Không thể xóa vì phim đã có suất chiếu"
                                  : "Xóa lịch chiếu"
                              }
                              disabled={
                                deletingMovieScheduleId === movie.id ||
                                hasCreatedShowtimes
                              }
                              onClick={() => void removeMovieSchedule(movie)}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </PermissionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm font-bold text-slate-500"
                    >
                      {loading ? "Đang tải dữ liệu từ database..." : config.emptyMessage}
                    </td>
                  </tr>
                )
              ) : paginatedShowtimes.length > 0 ? (
                paginatedShowtimes.map((showtime) => (
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    {loading ? "Đang tải dữ liệu từ database..." : config.emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {visibleRowCount > showtimePageSize ? (
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

      {variant === "sessions" ? (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Phim có lịch chiếu trong ngày nhưng chưa có suất chiếu
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Ngày {formatDateKeyLabel(selectedDateKey)}
                {selectedRoom
                  ? ` tại ${selectedRoom.cinemaName} - ${selectedRoom.name}`
                  : " trên tất cả phòng chiếu"}
              </p>
            </div>
            <span className="w-fit rounded-md bg-amber-50 px-3 py-1.5 text-sm font-black text-amber-700">
              {moviesWithoutDailyShowtimes.length} phim
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-100 text-sm uppercase text-slate-950">
                <tr>
                  <th className="px-4 py-4 font-black">Phim</th>
                  <th className="px-4 py-4 text-center font-black">Thời lượng</th>
                  <th className="px-4 py-4 font-black">Ngày kiểm tra</th>
                  <th className="px-4 py-4 font-black">Phạm vi</th>
                  <th className="px-4 py-4 text-center font-black">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-slate-900">
                {moviesWithoutDailyShowtimes.length > 0 ? (
                  moviesWithoutDailyShowtimes.map((movie) => (
                    <tr
                      key={movie.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="line-clamp-1 text-sm font-black text-slate-950">
                          {movie.title}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-slate-600">
                        {movie.duration} phút
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {formatDateKeyLabel(selectedDateKey)}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {selectedRoom
                          ? `${selectedRoom.cinemaName} - ${selectedRoom.name}`
                          : "Tất cả phòng chiếu"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <PermissionButton
                            type="button"
                            permissionRule={{ permission: "showtime.session.create" }}
                            onClick={() => openCreateModalForMovie(movie.id)}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-black text-white transition hover:bg-red-700"
                          >
                            <Plus size={16} />
                            Tạo suất
                          </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                    >
                      {loading
                        ? "Đang kiểm tra dữ liệu suất chiếu..."
                        : options.movies.length === 0
                          ? "Không có phim trong lịch chiếu của ngày này."
                          : "Tất cả phim trong ngày đã có suất chiếu."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {movieScheduleForm ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-schedule-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6"
        >
          <div className="flex max-h-[calc(100vh-48px)] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-6">
              <div className="min-w-0">
                <h3
                  id="movie-schedule-modal-title"
                  className="text-xl font-black text-slate-950"
                >
                  {scheduleModalMode === "create"
                    ? "Thêm lịch chiếu"
                    : "Cập nhật lịch chiếu"}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Chọn phim và khoảng ngày phim xuất hiện trong lịch chiếu.
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng form lịch chiếu"
                onClick={() => setMovieScheduleForm(null)}
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

            <div className="grid gap-5 overflow-y-auto px-6 py-6">
              <label className="grid gap-2">
                <span className="text-sm font-black text-slate-700">Phim</span>
                <select
                  value={movieScheduleForm.movieId}
                  disabled={scheduleModalMode === "edit"}
                  onChange={(event) =>
                    updateMovieScheduleForm("movieId", event.target.value)
                  }
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">
                    {movieScheduleOptions.length > 0
                      ? "Chọn phim"
                      : "Không còn phim để thêm vào ngày này"}
                  </option>
                  {movieScheduleOptions.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration})
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">
                    Ngày bắt đầu
                  </span>
                  <input
                    type="date"
                    value={movieScheduleForm.releaseDate}
                    onChange={(event) =>
                      updateMovieScheduleForm("releaseDate", event.target.value)
                    }
                    className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black text-slate-700">
                    Ngày kết thúc
                  </span>
                  <input
                    type="date"
                    value={movieScheduleForm.endDate}
                    onChange={(event) =>
                      updateMovieScheduleForm("endDate", event.target.value)
                    }
                    className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-red-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMovieScheduleForm(null)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X size={17} />
                Đóng
              </button>
              <PermissionButton
                type="button"
                onClick={() => void saveMovieSchedule()}
                permissionRule={{
                  permission:
                    scheduleModalMode === "create"
                      ? "showtime.schedule.create"
                      : "showtime.manage",
                }}
                disabled={savingMovieSchedule}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Save size={17} />
                {savingMovieSchedule ? "Đang lưu..." : "Lưu"}
              </PermissionButton>
            </div>
          </div>
        </div>
      ) : null}

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
              <PermissionButton
                type="button"
                onClick={() => void saveShowtime()}
                permissionRule={{
                  permission:
                    modalMode === "create"
                      ? "showtime.session.create"
                      : "showtime.manage",
                }}
                disabled={saving}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Save size={17} />
                {saving ? "Đang lưu..." : "Lưu"}
              </PermissionButton>
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
        <PermissionButton
          type="button"
          permissionRule={{ permission: "showtime.manage" }}
          aria-label={`Sửa ${showtime.movieTitle}`}
          onClick={() => onEdit(showtime)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
        >
          <Pencil size={16} />
        </PermissionButton>
        <PermissionButton
          type="button"
          permissionRule={{ permission: "showtime.manage" }}
          aria-label={`Xóa ${showtime.movieTitle}`}
          disabled={deletingShowtimeId === showtime.id}
          onClick={() => void onDelete(showtime)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
        </PermissionButton>
      </div>
    </td>
  );
}
