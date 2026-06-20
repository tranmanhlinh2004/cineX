"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Clapperboard,
  Clock3,
  Film,
  Play,
  Search,
  Star,
  Ticket,
  X,
} from "lucide-react";
import type {
  GenreMovieCatalogData,
  HomeMovie,
  PublicGenre,
} from "@/lib/home-movies";

type GenreMoviesPageProps = {
  data: GenreMovieCatalogData;
};

const allOption = "Tất cả";
const statusOptions = [allOption, "Đang chiếu", "Sắp chiếu"];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getGenreHref(genre?: PublicGenre | null) {
  return genre ? `/genres?genre=${genre.slug}` : "/genres";
}

function getPrimaryGenre(movie: HomeMovie) {
  return movie.genres[0] ?? "Chưa phân loại";
}

export default function GenreMoviesPage({ data }: GenreMoviesPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(allOption);
  const selectedGenre = data.selectedGenre;
  const genres = data.genres;
  const movies = data.movies;

  const filteredMovies = useMemo(() => {
    const keyword = normalizeText(query.trim());

    return movies.filter((movie) => {
      const matchesStatus =
        statusFilter === allOption || movie.status === statusFilter;
      const searchable = normalizeText(
        [
          movie.title,
          movie.description,
          movie.country ?? "",
          movie.language,
          movie.genres.join(" "),
        ].join(" "),
      );

      return matchesStatus && searchable.includes(keyword);
    });
  }, [movies, query, statusFilter]);

  const title = selectedGenre
    ? `Phim thể loại ${selectedGenre.name}`
    : "Phim theo thể loại";
  const description =
    selectedGenre?.description ||
    "Chọn một thể loại để xem danh sách phim đang chiếu và sắp chiếu được lấy trực tiếp từ database CineX.";

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {data.error ? (
          <div className="mb-5 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {data.error}
          </div>
        ) : null}

        <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#151719] shadow-2xl">
          <Image
            src={movies[0]?.bannerImage || movies[0]?.image || "/movies/dark-knight.jpg"}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/30" />

          <div className="relative z-10 grid min-h-[360px] content-end gap-6 p-5 sm:p-8 lg:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-black uppercase text-white shadow-lg shadow-red-950/40">
              <Clapperboard size={15} />
              CineX Genres
            </span>

            <div className="max-w-[760px]">
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-[660px] text-sm leading-7 text-white/72 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatPill label="Thể loại" value={genres.length.toString()} />
              <StatPill label="Phim phù hợp" value={movies.length.toString()} />
              {selectedGenre ? (
                <StatPill label="Đang chọn" value={selectedGenre.name} />
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-md border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="flex flex-wrap gap-2">
              <GenreChip active={!selectedGenre} href="/genres">
                Tất cả
              </GenreChip>
              {genres.map((genre) => (
                <GenreChip
                  key={genre.id}
                  active={selectedGenre?.id === genre.id}
                  href={getGenreHref(genre)}
                >
                  {genre.name}
                  <span className="ml-1 text-xs opacity-60">({genre.movieCount})</span>
                </GenreChip>
              ))}
            </div>

            <div className="grid gap-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm phim trong thể loại..."
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

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-2 text-xs font-black transition ${
                      statusFilter === status
                        ? "bg-white text-black"
                        : "bg-white/8 text-white/70 hover:bg-white/14 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-300">
                {selectedGenre?.name ?? "Tất cả thể loại"}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Danh sách phim
              </h2>
            </div>

            <p className="text-sm text-white/50">
              {filteredMovies.length} phim phù hợp
            </p>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMovies.map((movie) => (
                <GenreMovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-white/10 bg-[#151719] px-5 py-12 text-center">
              <p className="text-lg font-bold">Không tìm thấy phim phù hợp</p>
              <p className="mt-2 text-sm text-white/50">
                Thử đổi trạng thái phim hoặc từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function GenreChip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-9 items-center rounded-md border px-3 text-sm font-black transition ${
        active
          ? "border-red-500 bg-red-600 text-white"
          : "border-white/10 bg-white/8 text-white/72 hover:border-red-500/70 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-white/85 backdrop-blur">
      {label}: {value}
    </span>
  );
}

function GenreMovieCard({ movie }: { movie: HomeMovie }) {
  const isNowShowing = movie.statusCode === "NOW_SHOWING";
  const actionHref = isNowShowing
    ? `/ticket-booking?movie=${movie.slug}`
    : `/ticket-booking?movie=${movie.slug}&notify=true`;
  const detailHref = `/movies/${movie.id}`;

  return (
    <article className="group overflow-hidden rounded-md border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-red-500/60">
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
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              isNowShowing ? "bg-red-600 text-white" : "bg-cyan-400 text-black"
            }`}
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

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
          {movie.releaseDate ? (
            <MetaPill icon={<CalendarDays size={13} />} label={movie.releaseDate} />
          ) : null}
          <MetaPill icon={<Clock3 size={13} />} label={movie.duration} />
          <MetaPill icon={<Film size={13} />} label={getPrimaryGenre(movie)} />
          <MetaPill label={movie.language} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href={movie.trailerUrl ?? detailHref}
            target={movie.trailerUrl ? "_blank" : undefined}
            rel={movie.trailerUrl ? "noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Play size={15} className="fill-black" />
            Trailer
          </a>
          <Link
            href={actionHref}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-black transition ${
              isNowShowing
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-cyan-400 text-black hover:bg-cyan-300"
            }`}
          >
            <Ticket size={15} />
            {isNowShowing ? "Đặt vé" : "Nhắc tôi"}
          </Link>
        </div>
      </div>
    </article>
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
