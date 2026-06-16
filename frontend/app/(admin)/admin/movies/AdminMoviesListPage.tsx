"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Ticket,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  deleteAdminMovie,
  getAdminMovies,
  type AdminMovieRecord,
  type AdminMoviesStats,
  type AdminMovieStatusCode,
} from "@/lib/admin-movies-api";
import CalendarDatePicker, {
  formatCalendarDateIso,
  parseCalendarDateValue,
} from "@/components/CalendarDatePicker";

type AdminMovieListVariant = "all" | "now-showing" | "coming-soon";

type AdminMoviesListPageProps = {
  variant?: AdminMovieListVariant;
};

type MovieFilters = {
  query: string;
  statusCode: "" | AdminMovieStatusCode;
  genre: string;
  releaseDate: string;
};

const emptyStats: AdminMoviesStats = {
  totalMovies: 0,
  nowShowingMovies: 0,
  comingSoonMovies: 0,
  endedMovies: 0,
  ticketsSold: 0,
};

const defaultFilters: MovieFilters = {
  query: "",
  statusCode: "",
  genre: "",
  releaseDate: "",
};
const moviePageSize = 10;

const movieListConfigs: Record<
  AdminMovieListVariant,
  {
    title: string;
    description: string;
    statusFilter: AdminMovieStatusCode | null;
    statusSelectLabel: string;
    emptyMessage: string;
  }
> = {
  all: {
    title: "Quản lý phim",
    description:
      "Quản lý danh mục phim, lịch phát hành, trạng thái chiếu và nội dung hiển thị trên website CineX.",
    statusFilter: null,
    statusSelectLabel: "Tất cả trạng thái",
    emptyMessage: "Chưa có phim nào trong danh mục.",
  },
  "now-showing": {
    title: "Quản lý phim đang chiếu",
    description:
      "Theo dõi các phim đang mở bán vé và hiển thị trên lịch chiếu của CineX.",
    statusFilter: "NOW_SHOWING",
    statusSelectLabel: "Đang chiếu",
    emptyMessage: "Chưa có phim đang chiếu.",
  },
  "coming-soon": {
    title: "Quản lý phim sắp chiếu",
    description:
      "Quản lý các phim đã lên kế hoạch phát hành và nội dung truyền thông trước khi mở bán.",
    statusFilter: "COMING_SOON",
    statusSelectLabel: "Sắp chiếu",
    emptyMessage: "Chưa có phim sắp chiếu.",
  },
};

const statusOptions: Array<{ value: "" | AdminMovieStatusCode; label: string }> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "NOW_SHOWING", label: "Đang chiếu" },
  { value: "COMING_SOON", label: "Sắp chiếu" },
  { value: "ENDED", label: "Ngừng chiếu" },
];

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

function statusClass(statusCode: AdminMovieStatusCode) {
  if (statusCode === "NOW_SHOWING") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (statusCode === "COMING_SOON") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

function getMovieReleaseDateKey(movie: AdminMovieRecord) {
  const date = parseCalendarDateValue(movie.releaseDate);

  return date ? formatCalendarDateIso(date) : "";
}

function matchesMovieFilters(movie: AdminMovieRecord, filters: MovieFilters) {
  const normalizedQuery = normalizeText(filters.query.trim());
  const searchableText = normalizeText(
    [
      movie.title,
      movie.slug,
      movie.genre,
      movie.country,
      movie.language,
      movie.director,
      movie.ageRating,
      movie.status,
    ].join(" "),
  );
  const matchesQuery =
    !normalizedQuery || searchableText.includes(normalizedQuery);
  const matchesStatus =
    !filters.statusCode || movie.statusCode === filters.statusCode;
  const matchesGenre = !filters.genre || movie.genres.includes(filters.genre);
  const matchesReleaseDate =
    !filters.releaseDate || getMovieReleaseDateKey(movie) === filters.releaseDate;

  return matchesQuery && matchesStatus && matchesGenre && matchesReleaseDate;
}

export default function AdminMoviesListPage({
  variant = "all",
}: AdminMoviesListPageProps) {
  const config = movieListConfigs[variant];
  const [movies, setMovies] = useState<AdminMovieRecord[]>([]);
  const [movieStats, setMovieStats] = useState<AdminMoviesStats>(emptyStats);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState("");
  const [deletingMovieId, setDeletingMovieId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<MovieFilters>({
    ...defaultFilters,
    statusCode: config.statusFilter ?? "",
  });

  const loadMovies = useCallback(async () => {
    setMoviesLoading(true);
    setMoviesError("");

    try {
      const data = await getAdminMovies();

      setMovies(data.movies);
      setMovieStats(data.stats);
    } catch (error) {
      setMoviesError(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách phim từ database.",
      );
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      statusCode: config.statusFilter ?? currentFilters.statusCode,
    }));
    setCurrentPage(1);
  }, [config.statusFilter]);

  const availableGenres = useMemo(
    () => [...new Set(movies.flatMap((movie) => movie.genres))].sort(),
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const scopedMovies = config.statusFilter
      ? movies.filter((movie) => movie.statusCode === config.statusFilter)
      : movies;

    return scopedMovies.filter((movie) => matchesMovieFilters(movie, filters));
  }, [config.statusFilter, filters, movies]);

  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / moviePageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * moviePageSize;
  const paginatedMovies = filteredMovies.slice(
    startIndex,
    startIndex + moviePageSize,
  );
  const endIndex = startIndex + paginatedMovies.length;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const updateFilter = <Key extends keyof MovieFilters>(
    key: Key,
    value: MovieFilters[Key],
  ) => {
    setCurrentPage(1);
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  const deleteMovie = async (movie: AdminMovieRecord) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa phim "${movie.title}" không?`,
    );

    if (!confirmed) {
      return;
    }

    setMoviesError("");
    setDeletingMovieId(movie.id);

    try {
      await deleteAdminMovie(movie.id);
      await loadMovies();
    } catch (error) {
      setMoviesError(
        error instanceof Error
          ? error.message
          : "Không thể xóa phim khỏi database.",
      );
    } finally {
      setDeletingMovieId(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            3.4.3
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {config.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {config.description}
          </p>
        </div>

        <Link
          href="/admin/movies/new"
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          Thêm phim
        </Link>
      </section>

      {moviesError ? (
        <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {moviesError}
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_190px_190px_auto]"
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
              placeholder="Tìm phim theo tên, thể loại, mã phim..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500 disabled:bg-slate-50 disabled:text-slate-500"
            value={config.statusFilter ?? filters.statusCode}
            disabled={Boolean(config.statusFilter)}
            onChange={(event) =>
              updateFilter("statusCode", event.target.value as MovieFilters["statusCode"])
            }
          >
            {config.statusFilter ? (
              <option value={config.statusFilter}>{config.statusSelectLabel}</option>
            ) : (
              statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
            value={filters.genre}
            onChange={(event) => updateFilter("genre", event.target.value)}
          >
            <option value="">Tất cả thể loại</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <CalendarDatePicker
            ariaLabel="Chọn ngày khởi chiếu"
            value={filters.releaseDate}
            onChange={(value) => updateFilter("releaseDate", value)}
            theme="light"
            accent="red"
            placeholder="Ngày khởi chiếu"
            buttonClassName="h-11 border-slate-200 bg-white text-sm font-bold text-slate-700"
          />

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
        <div className="border-b border-slate-100 px-5 py-4 text-sm font-bold text-slate-500">
          {filteredMovies.length > 0
            ? `Hiển thị ${startIndex + 1}-${endIndex} / ${filteredMovies.length} phim`
            : `Hiển thị 0 / ${movies.length} phim`}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1240px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <th className="px-4 py-4 text-center font-black">Tên phim</th>
                <th className="px-4 py-4 font-black">Thể loại</th>
                <th className="px-4 py-4 text-center font-black">Ngày khởi chiếu</th>
                <th className="px-4 py-4 text-center font-black">Quốc gia</th>
                <th className="px-4 py-4 text-center font-black">
                  Giới hạn độ tuổi
                </th>
                <th className="px-4 py-4 text-center font-black">Trạng thái</th>
                <th className="px-4 py-4 text-center font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {paginatedMovies.length > 0 ? (
                paginatedMovies.map((movie) => (
                  <tr
                    key={movie.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={movie.poster || "/movies/demo.png"}
                            alt={movie.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-black text-slate-950">
                            {movie.title}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {movie.duration} - {movie.language}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                      {movie.genre}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                      {movie.releaseDate || "Chưa cập nhật"}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                      {movie.country}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                      {movie.ageRating}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${statusClass(
                          movie.statusCode,
                        )}`}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/movies/${movie.id}`}
                          aria-label={`Xem ${movie.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/movies/${movie.id}/edit`}
                          aria-label={`Sửa ${movie.title}`}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Xóa ${movie.title}`}
                          disabled={deletingMovieId === movie.id}
                          onClick={() => void deleteMovie(movie)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    {moviesLoading
                      ? "Đang tải dữ liệu phim từ database..."
                      : config.emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredMovies.length > moviePageSize ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-slate-500">
              Trang {activePage}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                type="button"
                disabled={activePage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
