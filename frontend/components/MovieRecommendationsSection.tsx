"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Clock3,
  Film,
  Loader2,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import {
  AUTH_STORAGE_EVENT,
  getAuthToken,
} from "@/lib/auth";
import type {
  HomeMovie,
  MovieRecommendationsData,
} from "@/lib/home-movies";
import { getMovieRecommendations } from "@/lib/movie-recommendations-api";

type MovieRecommendationsSectionProps = {
  movieId: number;
};

export default function MovieRecommendationsSection({
  movieId,
}: MovieRecommendationsSectionProps) {
  const [data, setData] = useState<MovieRecommendationsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;
    let requestId = 0;

    const loadRecommendations = async () => {
      requestId += 1;
      const currentRequestId = requestId;

      setIsLoading(true);

      const result = await getMovieRecommendations(movieId);

      if (isCancelled || currentRequestId !== requestId) {
        return;
      }

      setData(result);
      setError(result.error ?? "");
      setIsLoading(false);
    };

    const syncAuthAndReload = () => {
      getAuthToken();
      void loadRecommendations();
    };

    void loadRecommendations();

    window.addEventListener("storage", syncAuthAndReload);
    window.addEventListener(AUTH_STORAGE_EVENT, syncAuthAndReload);
    window.addEventListener("pageshow", syncAuthAndReload);

    return () => {
      isCancelled = true;
      window.removeEventListener("storage", syncAuthAndReload);
      window.removeEventListener(AUTH_STORAGE_EVENT, syncAuthAndReload);
      window.removeEventListener("pageshow", syncAuthAndReload);
    };
  }, [movieId]);

  const recommendations = data?.recommendations ?? [];

  if (!isLoading && !error && recommendations.length === 0) {
    return null;
  }

  const isPersonalized = data?.basis.isPersonalized ?? false;
  const topGenres = data?.basis.topGenres ?? [];
  const title = isPersonalized
    ? "Goi y danh rieng cho ban"
    : "Phim cung the loai";
  const subtitle =
    topGenres.length > 0
      ? `The loai noi bat: ${topGenres.join(", ")}`
      : "Nhung phim phu hop voi lua chon hien tai.";

  return (
    <section className="mt-8 rounded-lg border border-white/10 bg-[#151719] p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Sparkles
              className={isPersonalized ? "text-red-300" : "text-cyan-200"}
              size={23}
            />
            <h2 className="text-2xl font-black">{title}</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-white/55">
            {subtitle}
          </p>
        </div>

        {isPersonalized ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-100">
            <Ticket size={14} />
            Tu lich su dat ve
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100">
            <Film size={14} />
            Cung so thich phim
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[360px] animate-pulse rounded-lg border border-white/10 bg-black/25"
            >
              <div className="aspect-[2/3] rounded-t-lg bg-white/10" />
              <div className="space-y-3 p-4">
                <div className="h-5 rounded bg-white/10" />
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-md border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">
          <Loader2 size={17} />
          {error}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((movie) => (
            <RecommendationCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecommendationCard({ movie }: { movie: HomeMovie }) {
  const isComingSoon = movie.statusCode === "COMING_SOON";
  const actionHref = isComingSoon
    ? `/ticket-booking?movie=${movie.slug}&notify=true`
    : `/ticket-booking?movie=${movie.slug}`;
  const detailHref = `/movies/${movie.id}`;
  const ActionIcon = isComingSoon ? Bell : Ticket;
  const actionLabel = isComingSoon ? "Nhac toi" : "Dat ve";
  const badgeClass = isComingSoon
    ? "bg-cyan-400 text-black"
    : "bg-red-600 text-white";
  const actionClass = isComingSoon
    ? "bg-cyan-400 text-black hover:bg-cyan-300"
    : "bg-red-600 text-white hover:bg-red-700";
  const metadata = [movie.duration, movie.genres[0], movie.language].filter(
    (item): item is string => Boolean(item),
  );

  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-[#101216] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-red-500/60">
      <Link
        href={detailHref}
        className="relative block aspect-[2/3] overflow-hidden bg-black"
      >
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-black ${badgeClass}`}
          >
            <Film size={13} />
            {movie.status}
          </span>
          <span className="rounded-md bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
            {movie.ageRating}
          </span>
        </div>

        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          {movie.rating}
        </span>
      </Link>

      <div className="p-4">
        <Link
          href={detailHref}
          className="line-clamp-1 text-xl font-black text-white transition hover:text-white/75"
        >
          {movie.title}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/55">
          {movie.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/72">
          {metadata.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5"
            >
              {item === movie.duration ? <Clock3 size={13} /> : null}
              {item}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Film size={15} />
            Chi tiet
          </Link>
          <Link
            href={actionHref}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-black transition ${actionClass}`}
          >
            <ActionIcon size={15} />
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
