"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  Pencil,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminMovie,
  type AdminMovieRecord,
  type AdminMovieStatusCode,
} from "@/lib/admin-movies-api";

type AdminMovieDetailPageClientProps = {
  movieId: string;
};

function statusClass(statusCode: AdminMovieStatusCode) {
  if (statusCode === "NOW_SHOWING") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (statusCode === "COMING_SOON") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

const adminMoviesFallbackPath = "/admin/movies/now-showing";

function getAdminMovieListPath(statusCode?: AdminMovieStatusCode) {
  if (statusCode === "COMING_SOON") {
    return "/admin/movies/coming-soon";
  }

  return adminMoviesFallbackPath;
}

export default function AdminMovieDetailPageClient({
  movieId,
}: AdminMovieDetailPageClientProps) {
  const [movie, setMovie] = useState<AdminMovieRecord | null>(null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMovie() {
      setMovieLoading(true);
      setMovieError("");

      try {
        const data = await getAdminMovie(movieId);

        if (!cancelled) {
          setMovie(data.movie);
        }
      } catch (error) {
        if (!cancelled) {
          setMovieError(
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu phim từ database.",
          );
        }
      } finally {
        if (!cancelled) {
          setMovieLoading(false);
        }
      }
    }

    void loadMovie();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  if (movieLoading) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6">
        <section className="rounded-md border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">
          Đang tải dữ liệu phim từ database...
        </section>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-6">
        <Link
          href={adminMoviesFallbackPath}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Quay lại danh sách phim
        </Link>
        <section className="rounded-md border border-red-200 bg-red-50 p-6 text-sm font-bold text-red-700">
          {movieError || "Không tìm thấy phim."}
        </section>
      </div>
    );
  }

  const movieListPath = getAdminMovieListPath(movie.statusCode);

  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href={movieListPath}
            aria-label="Quay lại danh sách phim"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Chi tiết phim
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Thông tin chi tiết phim ID: {movie.id}
            </p>
          </div>
        </div>

        <Link
          href={`/admin/movies/${movie.id}/edit`}
          className="hidden min-h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 sm:inline-flex"
        >
          <Pencil size={17} />
          Sửa phim
        </Link>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-black text-slate-950">
              Thông tin phim
            </h3>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-black ${statusClass(
                movie.statusCode,
              )}`}
            >
              {movie.status}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row">
            <div className="h-40 w-32 shrink-0 overflow-hidden rounded-md bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.poster || "/movies/demo.png"}
                alt={movie.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xl font-black text-slate-950">
                {movie.title}
              </h4>
              <p className="mt-3 text-sm font-bold text-slate-600">
                Thể loại: {movie.genre}
              </p>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Globe2 size={16} className="text-slate-500" />
                  Quốc gia: <strong>{movie.country}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-slate-500" />
                  Độ tuổi: <strong>{movie.ageRating}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 size={16} className="text-slate-500" />
                  Thời lượng: <strong>{movie.duration}</strong>
                </p>
                <p className="flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  Ngôn ngữ: <strong>{movie.language}</strong>
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <Ticket size={16} className="text-slate-500" />
                  Đạo diễn: <strong>{movie.director || "Đang cập nhật"}</strong>
                </p>
                <p className="flex items-center gap-2 sm:col-span-2">
                  <Users size={16} className="text-slate-500" />
                  Diễn viên: <strong>{movie.actors || "Đang cập nhật"}</strong>
                </p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Thời gian</h3>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
            <p>
              Thời lượng: <strong>{movie.duration}</strong>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays size={16} />
              Khởi chiếu: <strong>{movie.releaseDate || "Chưa cập nhật"}</strong>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays size={16} />
              Kết thúc dự kiến:{" "}
              <strong>{movie.endDate || "Chưa cập nhật"}</strong>
            </p>
            <p className="flex items-center gap-2">
              <Ticket size={16} />
              Vé đã bán:{" "}
              <strong>{new Intl.NumberFormat("vi-VN").format(movie.ticketsSold)}</strong>
            </p>
          </div>
        </article>
      </section>

      <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Mô tả phim</h3>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {movie.description || "Chưa cập nhật mô tả phim."}
        </p>
      </article>

      <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Rạp có lịch chiếu</h3>
        {movie.cinemas.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {movie.cinemas.map((cinema, index) => (
              <div key={cinema} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-black text-slate-950">{cinema}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    Theo lịch chiếu trong database
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Chưa có rạp nào gắn lịch chiếu cho phim này.
          </p>
        )}
      </article>

      <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Lịch chiếu</h3>
        {movie.schedule.length > 0 ? (
          <div className="mt-5 grid gap-4">
            {movie.schedule.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Chưa có lịch chiếu cho phim này.
          </p>
        )}
      </article>
    </div>
  );
}
