"use client";

import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Film,
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getAdminGenres,
  type AdminGenreRecord,
  type AdminGenresStats,
} from "@/lib/admin-genres-api";

type GenreFilters = {
  query: string;
  status: string;
  displayArea: string;
};

const genrePageSize = 10;
const emptyStats: AdminGenresStats = {
  totalGenres: 0,
  activeGenres: 0,
  unusedGenres: 0,
  movieGenreLinks: 0,
};
const defaultFilters: GenreFilters = {
  query: "",
  status: "",
  displayArea: "",
};

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

function statusClass(value: string) {
  const normalized = normalizeText(value);

  if (normalized.includes("hoat dong")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("chua")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function matchesGenreFilters(genre: AdminGenreRecord, filters: GenreFilters) {
  const normalizedQuery = normalizeText(filters.query.trim());
  const searchableText = normalizeText(
    [
      genre.name,
      genre.slug,
      genre.description,
      genre.displayArea,
      genre.status,
      genre.movieCountLabel,
    ].join(" "),
  );
  const matchesQuery =
    !normalizedQuery || searchableText.includes(normalizedQuery);
  const matchesStatus = !filters.status || genre.status === filters.status;
  const matchesDisplayArea =
    !filters.displayArea || genre.displayArea === filters.displayArea;

  return matchesQuery && matchesStatus && matchesDisplayArea;
}

export default function AdminMovieGenresPageClient() {
  const [genres, setGenres] = useState<AdminGenreRecord[]>([]);
  const [genreStats, setGenreStats] = useState<AdminGenresStats>(emptyStats);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);

  const loadGenres = useCallback(async () => {
    setGenresLoading(true);
    setGenresError("");

    try {
      const data = await getAdminGenres();

      setGenres(data.genres);
      setGenreStats(data.stats);
    } catch (error) {
      setGenresError(
        error instanceof Error
          ? error.message
          : "Không thể tải thể loại phim từ database.",
      );
    } finally {
      setGenresLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGenres();
  }, [loadGenres]);

  const statusOptions = useMemo(
    () => [...new Set(genres.map((genre) => genre.status))].sort(),
    [genres],
  );
  const displayAreaOptions = useMemo(
    () => [...new Set(genres.map((genre) => genre.displayArea))].sort(),
    [genres],
  );
  const filteredGenres = useMemo(
    () => genres.filter((genre) => matchesGenreFilters(genre, filters)),
    [filters, genres],
  );
  const totalPages = Math.max(1, Math.ceil(filteredGenres.length / genrePageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * genrePageSize;
  const paginatedGenres = filteredGenres.slice(
    startIndex,
    startIndex + genrePageSize,
  );
  const endIndex = startIndex + paginatedGenres.length;
  const stats = [
    {
      label: "Tổng thể loại",
      value: formatStatValue(genreStats.totalGenres),
      helper: "Trong bảng genres",
      icon: Layers3,
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Đang hoạt động",
      value: formatStatValue(genreStats.activeGenres),
      helper: "Đã gắn với phim",
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Chưa sử dụng",
      value: formatStatValue(genreStats.unusedGenres),
      helper: "Chưa có phim",
      icon: CalendarClock,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Lượt gắn phim",
      value: formatStatValue(genreStats.movieGenreLinks),
      helper: "Tổng liên kết phim - thể loại",
      icon: Film,
      tone: "bg-blue-50 text-blue-700",
    },
  ];

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const updateFilter = <Key extends keyof GenreFilters>(
    key: Key,
    value: GenreFilters[Key],
  ) => {
    setCurrentPage(1);
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            3.4.3
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Quản lý thể loại phim
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi các thể loại phim lấy trực tiếp từ database, dùng cho danh
            mục phim, bộ lọc và trang hiển thị công khai.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          Thêm thể loại
        </button>
      </section>

      {genresError ? (
        <section className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {genresError}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
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
              placeholder="Tìm thể loại theo tên, slug, mô tả..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
            value={filters.displayArea}
            onChange={(event) => updateFilter("displayArea", event.target.value)}
          >
            <option value="">Khu vực hiển thị</option>
            {displayAreaOptions.map((displayArea) => (
              <option key={displayArea} value={displayArea}>
                {displayArea}
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
              Danh sách thể loại phim
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredGenres.length > 0
                ? `Hiển thị ${startIndex + 1}-${endIndex} / ${filteredGenres.length} thể loại`
                : `Hiển thị 0 / ${genres.length} thể loại`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <th className="px-4 py-4 font-black">Thể loại</th>
                <th className="px-4 py-4 font-black">Slug</th>
                <th className="px-4 py-4 text-center font-black">Số phim</th>
                <th className="px-4 py-4 font-black">Khu vực hiển thị</th>
                <th className="px-4 py-4 text-center font-black">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {paginatedGenres.length > 0 ? (
                paginatedGenres.map((genre) => (
                  <tr
                    key={genre.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-slate-950">
                        {genre.name}
                      </p>
                      {genre.description ? (
                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">
                          {genre.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {genre.slug}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                      {genre.movieCountLabel}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                      {genre.displayArea}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${statusClass(
                          genre.status,
                        )}`}
                      >
                        {genre.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm font-bold text-slate-500"
                  >
                    {genresLoading
                      ? "Đang tải thể loại phim từ database..."
                      : "Không tìm thấy thể loại phim phù hợp."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredGenres.length > genrePageSize ? (
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
