"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Film,
  Play,
  Search,
  Star,
  Ticket,
  X,
} from "lucide-react";
import type { HomeMovie, MovieCatalogPagination } from "@/lib/home-movies";

type MovieCatalogPageProps = {
  movies: HomeMovie[];
  pagination?: MovieCatalogPagination;
  variant: "now" | "soon";
  error?: string;
};

const allOption = "Tất cả";
const releaseMonthFormatter = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

const variantConfig = {
  now: {
    badge: "Đang chiếu nổi bật",
    eyebrow: "CineX Now Showing",
    heading: "Phim đang chiếu",
    countLabel: "phim đang chiếu mới nhất",
    accentText: "text-red-300",
    focusBorder: "focus:border-red-500",
    heroBadge: "bg-red-600 text-white shadow-red-950/40",
    cardHover: "hover:border-red-500/60",
    action: "bg-red-600 text-white hover:bg-red-700",
    chip: "bg-red-600 text-white",
    cta: "Đặt vé",
    ctaIcon: Ticket,
    emptyTitle: "Không tìm thấy phim đang chiếu phù hợp",
  },
  soon: {
    badge: "Sắp chiếu nổi bật",
    eyebrow: "CineX Coming Soon",
    heading: "Phim sắp chiếu",
    countLabel: "phim sắp chiếu mới nhất",
    accentText: "text-cyan-200",
    focusBorder: "focus:border-cyan-400",
    heroBadge: "bg-cyan-400 text-black shadow-cyan-950/40",
    cardHover: "hover:border-cyan-400/70",
    action: "bg-cyan-400 text-black hover:bg-cyan-300",
    chip: "bg-cyan-400 text-black",
    cta: "Nhắc tôi",
    ctaIcon: Bell,
    emptyTitle: "Không tìm thấy phim sắp chiếu phù hợp",
  },
} as const;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");

function getPrimaryGenre(movie: HomeMovie) {
  return movie.genres[0] ?? "Chưa phân loại";
}

function getReleaseMonth(movie: HomeMovie) {
  if (!movie.releaseDateIso) {
    return "Chưa rõ";
  }

  return releaseMonthFormatter.format(new Date(movie.releaseDateIso));
}

function getCatalogPath(variant: "now" | "soon") {
  return variant === "now" ? "/movies/now-showing" : "/movies/coming-soon";
}

function getCatalogPageHref(variant: "now" | "soon", page: number) {
  const path = getCatalogPath(variant);

  return page <= 1 ? path : `${path}?page=${page}`;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  for (let page = 1; page <= totalPages; page += 1) {
    if (
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1 ||
      (currentPage <= 3 && page <= 4) ||
      (currentPage >= totalPages - 2 && page >= totalPages - 3)
    ) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const items: Array<number | "gap"> = [];

  for (const page of sortedPages) {
    const previousItem = items.at(-1);

    if (typeof previousItem === "number" && page - previousItem > 1) {
      items.push("gap");
    }

    items.push(page);
  }

  return items;
}

export default function MovieCatalogPage({
  movies,
  pagination,
  variant,
  error,
}: MovieCatalogPageProps) {
  const styles = variantConfig[variant];
  const featuredMovie = movies[0];
  const totalMovieCount = pagination?.totalItems ?? movies.length;
  const currentPage = pagination?.page ?? 1;
  const [selectedGenre, setSelectedGenre] = useState(allOption);
  const [selectedLanguage, setSelectedLanguage] = useState(allOption);
  const [selectedMonth, setSelectedMonth] = useState(allOption);
  const [query, setQuery] = useState("");

  const genreOptions = useMemo(
    () => [allOption, ...new Set(movies.flatMap((movie) => movie.genres))],
    [movies],
  );
  const languageOptions = useMemo(
    () => [allOption, ...new Set(movies.map((movie) => movie.language))],
    [movies],
  );
  const monthOptions = useMemo(
    () => [allOption, ...new Set(movies.map(getReleaseMonth))],
    [movies],
  );

  const filteredMovies = useMemo(() => {
    const keyword = normalizeText(query.trim());

    return movies.filter((movie) => {
      const matchesGenre =
        selectedGenre === allOption || movie.genres.includes(selectedGenre);
      const matchesLanguage =
        selectedLanguage === allOption || movie.language === selectedLanguage;
      const matchesMonth =
        variant === "now" ||
        selectedMonth === allOption ||
        getReleaseMonth(movie) === selectedMonth;
      const searchable = normalizeText(
        [
          movie.title,
          movie.description,
          movie.country ?? "",
          movie.language,
          movie.releaseDate ?? "",
          movie.genres.join(" "),
        ].join(" "),
      );

      return (
        matchesGenre &&
        matchesLanguage &&
        matchesMonth &&
        searchable.includes(keyword)
      );
    });
  }, [movies, query, selectedGenre, selectedLanguage, selectedMonth, variant]);

  const resetFilters = () => {
    setSelectedGenre(allOption);
    setSelectedLanguage(allOption);
    setSelectedMonth(allOption);
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {error}
          </div>
        ) : null}

        {featuredMovie ? (
          <HeroMovie movie={featuredMovie} variant={variant} />
        ) : null}

        <section className="mt-8 rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {variant === "soon" ? (
                <FilterSelect
                  label="Tháng khởi chiếu"
                  value={selectedMonth}
                  options={monthOptions}
                  onChange={setSelectedMonth}
                  focusBorder={styles.focusBorder}
                />
              ) : null}

              <FilterSelect
                label="Thể loại"
                value={selectedGenre}
                options={genreOptions}
                onChange={setSelectedGenre}
                focusBorder={styles.focusBorder}
              />

              <FilterSelect
                label="Ngôn ngữ"
                value={selectedLanguage}
                options={languageOptions}
                onChange={setSelectedLanguage}
                focusBorder={styles.focusBorder}
              />
            </div>

            <div className="relative w-full lg:w-[360px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm phim, thể loại, quốc gia..."
                className={`h-11 w-full rounded-md border border-white/10 bg-black/30 px-11 text-sm text-white outline-none placeholder:text-white/35 ${styles.focusBorder}`}
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
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-white/75 transition hover:border-white/30 hover:text-white"
            >
              <Filter size={17} />
              Đặt lại
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={`text-sm font-bold ${styles.accentText}`}>
                {totalMovieCount} {styles.countLabel}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                {styles.heading}
              </h2>
            </div>

            <p className="text-sm text-white/50">
              {filteredMovies.length} phim phu hop tren trang {currentPage}
            </p>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} variant={variant} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#151719] px-5 py-12 text-center">
              <p className="text-lg font-bold">{styles.emptyTitle}</p>
              <p className="mt-2 text-sm text-white/50">
                Thử đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-md bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
              >
                Xem lại danh sách
              </button>
            </div>
          )}

          {pagination ? (
            <PaginationControls pagination={pagination} variant={variant} />
          ) : null}
        </section>
      </section>
    </div>
  );
}

function HeroMovie({
  movie,
  variant,
}: {
  movie: HomeMovie;
  variant: "now" | "soon";
}) {
  const styles = variantConfig[variant];
  const ActionIcon = styles.ctaIcon;
  const actionHref =
    variant === "now"
      ? `/ticket-booking?movie=${movie.slug}`
      : `/ticket-booking?movie=${movie.slug}&notify=true`;
  const detailHref = `/movies/${movie.id}`;

  return (
    <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl sm:min-h-[520px]">
      <Image
        src={movie.bannerImage ?? movie.image}
        alt={movie.title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1280px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/30" />

      <div className="relative z-10 flex min-h-[460px] flex-col justify-between p-5 sm:min-h-[520px] sm:p-8 lg:p-12">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-lg ${styles.heroBadge}`}
          >
            <Film size={15} />
            {styles.badge}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-4 py-2 text-xs font-bold backdrop-blur">
            <Star size={15} className="fill-yellow-400 text-yellow-400" />
            {movie.rating}/10
          </span>
        </div>

        <div className="max-w-[680px]">
          <p className={`mb-3 text-xs font-bold uppercase ${styles.accentText}`}>
            {styles.eyebrow}
          </p>
          <Link
            href={detailHref}
            className="block max-w-[780px] text-4xl font-black leading-tight transition hover:text-white/80 sm:text-6xl"
          >
            {movie.title}
          </Link>
          <p className="mt-4 max-w-[600px] text-sm leading-7 text-white/75 sm:text-base">
            {movie.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              variant === "soon" ? movie.releaseDate : null,
              getPrimaryGenre(movie),
              movie.duration,
              movie.language,
              movie.ageRating,
            ]
              .filter((item): item is string => Boolean(item))
              .map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur"
                >
                  {item}
                </span>
              ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={actionHref}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-bold shadow-lg transition ${styles.action}`}
            >
              <ActionIcon size={18} />
              {styles.cta}
            </Link>

            <Link
              href={detailHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:border-white/35 hover:bg-white/15"
            >
              <Film size={18} />
              Chi tiet phim
            </Link>

            <a
              href={movie.trailerUrl ?? actionHref}
              target={movie.trailerUrl ? "_blank" : undefined}
              rel={movie.trailerUrl ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-gray-200"
            >
              <Play size={18} className="fill-black" />
              Xem trailer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationControls({
  pagination,
  variant,
}: {
  pagination: MovieCatalogPagination;
  variant: "now" | "soon";
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(pagination.page, pagination.totalPages);

  return (
    <nav
      aria-label="Movie catalog pagination"
      className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-semibold text-white/50">
        Trang {pagination.page}/{pagination.totalPages} - {pagination.totalItems} phim
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink
          page={pagination.page - 1}
          variant={variant}
          disabled={!pagination.hasPreviousPage}
        >
          <ChevronLeft size={16} />
          Truoc
        </PaginationLink>

        {items.map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/5 bg-white/5 px-3 text-sm font-bold text-white/35"
            >
              ...
            </span>
          ) : (
            <PaginationLink
              key={item}
              page={item}
              variant={variant}
              active={item === pagination.page}
            >
              {item}
            </PaginationLink>
          ),
        )}

        <PaginationLink
          page={pagination.page + 1}
          variant={variant}
          disabled={!pagination.hasNextPage}
        >
          Sau
          <ChevronRight size={16} />
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  page,
  variant,
  active,
  disabled,
  children,
}: {
  page: number;
  variant: "now" | "soon";
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  const activeClass =
    variant === "now"
      ? "border-red-500 bg-red-600 text-white"
      : "border-cyan-300 bg-cyan-400 text-black";
  const inactiveClass =
    "border-white/10 bg-[#151719] text-white/72 hover:border-white/35 hover:text-white";
  const disabledClass = "border-white/5 bg-white/5 text-white/25";
  const className = `inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${
    disabled ? disabledClass : active ? activeClass : inactiveClass
  }`;

  if (disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={getCatalogPageHref(variant, page)}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  focusBorder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  focusBorder: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase text-white/45">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 rounded-md border border-white/10 bg-black/30 px-3 text-sm font-semibold normal-case text-white outline-none ${focusBorder}`}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#151719]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MovieCard({
  movie,
  variant,
}: {
  movie: HomeMovie;
  variant: "now" | "soon";
}) {
  const styles = variantConfig[variant];
  const ActionIcon = styles.ctaIcon;
  const actionHref =
    variant === "now"
      ? `/ticket-booking?movie=${movie.slug}`
      : `/ticket-booking?movie=${movie.slug}&notify=true`;
  const detailHref = `/movies/${movie.id}`;

  return (
    <article
      className={`group overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 ${styles.cardHover}`}
    >
      <Link
        href={detailHref}
        className="relative block aspect-[16/10] overflow-hidden bg-black"
      >
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${styles.chip}`}
          >
            {movie.status}
          </span>
          <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
            {movie.ageRating}
          </span>
        </div>

        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          {movie.rating}
        </span>
      </Link>

      <div className="p-4">
        <Link
          href={detailHref}
          className="line-clamp-1 text-xl font-black transition hover:text-white/75"
        >
          {movie.title}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/55">
          {movie.description}
        </p>

        <MovieMetadata>
          {variant === "soon" && movie.releaseDate ? (
            <MetaPill icon={<CalendarDays size={13} />} label={movie.releaseDate} />
          ) : null}
          <MetaPill icon={<Clock3 size={13} />} label={movie.duration} />
          <MetaPill label={getPrimaryGenre(movie)} />
          <MetaPill label={movie.language} />
        </MovieMetadata>

        {variant === "now" ? (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase text-white/40">
              Suất chiếu
            </p>
            {movie.showtimes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {movie.showtimes.slice(0, 4).map((time) => (
                  <Link
                    key={time}
                    href={`/ticket-booking?movie=${movie.slug}&time=${encodeURIComponent(time)}`}
                    className="rounded-md border border-white/10 bg-black/25 px-2 py-2 text-center text-xs font-bold text-white transition hover:border-red-500 hover:bg-red-600"
                  >
                    {time}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white/45">
                Chưa có suất chiếu.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white/55">
            Dự kiến mở bán tại CineX
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={movie.trailerUrl ?? actionHref}
            target={movie.trailerUrl ? "_blank" : undefined}
            rel={movie.trailerUrl ? "noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Play size={15} className="fill-black" />
            Trailer
          </a>
          <Link
            href={actionHref}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-black transition ${styles.action}`}
          >
            <ActionIcon size={15} />
            {styles.cta}
          </Link>
        </div>
      </div>
    </article>
  );
}

function MovieMetadata({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
      {children}
    </div>
  );
}

function MetaPill({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5">
      {icon}
      {label}
    </span>
  );
}
