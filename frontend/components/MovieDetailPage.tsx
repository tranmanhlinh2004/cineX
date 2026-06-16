import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Film,
  Globe2,
  Play,
  Star,
  Ticket,
  Users,
  Video,
} from "lucide-react";
import MovieRecommendationsSection from "@/components/MovieRecommendationsSection";
import MovieReviewsSection from "@/components/MovieReviewsSection";
import type { HomeMovie } from "@/lib/home-movies";

type MovieDetailPageProps = {
  movie: HomeMovie | null;
  error?: string;
};

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host.endsWith("youtube.com")) {
      const watchId = parsedUrl.searchParams.get("v");

      if (watchId) {
        return `https://www.youtube.com/embed/${watchId}`;
      }

      const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
      const embeddedId =
        pathParts[0] === "embed" || pathParts[0] === "shorts"
          ? pathParts[1]
          : null;

      if (embeddedId) {
        return `https://www.youtube.com/embed/${embeddedId}`;
      }

      const searchQuery = parsedUrl.searchParams.get("search_query");

      if (parsedUrl.pathname === "/results" && searchQuery) {
        return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
          searchQuery,
        )}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function splitDescription(description: string) {
  const normalized = description.trim();

  if (!normalized) {
    return ["Noi dung phim dang duoc cap nhat."];
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function MovieDetailPage({ movie, error }: MovieDetailPageProps) {
  if (!movie) {
    return (
      <main className="min-h-screen bg-[#0d0f12] px-4 py-14 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[900px] rounded-lg border border-amber-300/30 bg-amber-300/10 p-6 text-center">
          <Film className="mx-auto text-amber-200" size={34} />
          <h1 className="mt-4 text-2xl font-black">Khong tai duoc chi tiet phim</h1>
          <p className="mt-2 text-sm font-semibold text-amber-100/80">
            {error ?? "Du lieu phim khong kha dung."}
          </p>
          <Link
            href="/movies/now-showing"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-gray-200"
          >
            <ArrowLeft size={17} />
            Quay lai danh sach phim
          </Link>
        </section>
      </main>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);
  const bookingHref =
    movie.statusCode === "COMING_SOON"
      ? `/ticket-booking?movie=${movie.slug}&notify=true`
      : `/ticket-booking?movie=${movie.slug}`;
  const catalogHref =
    movie.statusCode === "COMING_SOON"
      ? "/movies/coming-soon"
      : "/movies/now-showing";
  const statusClass =
    movie.statusCode === "COMING_SOON"
      ? "bg-cyan-400 text-black"
      : movie.statusCode === "NOW_SHOWING"
        ? "bg-red-600 text-white"
        : "bg-white/15 text-white";
  const descriptionParagraphs = splitDescription(movie.description);

  return (
    <main className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-5 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="mb-5 flex flex-col gap-4 border-b border-white/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Film className="text-red-300" size={24} />
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Noi dung phim
            </h1>
          </div>

          <Link
            href={catalogHref}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-white/35 hover:text-white"
          >
            <ArrowLeft size={17} />
            Quay lai
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#171011] shadow-2xl shadow-black/35">
          <div className="absolute inset-0 opacity-35">
            <Image
              src={movie.bannerImage ?? movie.image}
              alt={movie.title}
              fill
              priority
              sizes="1180px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#170709] via-[#170709]/90 to-[#170709]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171011] via-transparent to-black/40" />
          </div>

          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[170px_1fr] lg:gap-8">
            <div className="relative aspect-[2/3] w-[150px] overflow-hidden rounded-md border border-white/10 bg-black shadow-xl sm:w-[170px]">
              <Image
                src={movie.posterUrl ?? movie.image}
                alt={movie.title}
                fill
                sizes="170px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-black ${statusClass}`}
                >
                  <Video size={14} />
                  {movie.status}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {movie.rating}/10
                </span>
                <span className="rounded-md bg-black/40 px-3 py-1.5 text-xs font-black text-white">
                  {movie.ageRating}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
                {movie.title}
              </h2>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <MovieFact label="Đạo diễn" value={movie.director} />
                <MovieFact label="Diễn viên" value={movie.actors} />
                <MovieFact label="Thể loại" value={movie.genres.join(", ")} />
                <MovieFact label="Thời lượng" value={movie.duration} />
                <MovieFact label="Năm sản xuất" value={movie.releaseDate} />
                <MovieFact label="Ngôn ngữ" value={movie.language} />
                <MovieFact label="Quốc gia" value={movie.country} />
                <MovieFact label="Đánh giá" value={`${movie.reviewCount} review`} />
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={bookingHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black transition ${
                    movie.statusCode === "COMING_SOON"
                      ? "bg-cyan-400 text-black hover:bg-cyan-300"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  <Ticket size={18} />
                  {movie.statusCode === "COMING_SOON" ? "Nhac toi" : "Dat ve"}
                </Link>

                
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/30">
          <div className="relative aspect-video">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#151719] px-5 text-center">
                <Play className="text-red-300" size={42} />
                <p className="max-w-md text-sm font-semibold text-white/60">
                  Trailer chua co dang nhung truc tiep. Ban co the mo trailer o
                  tab moi.
                </p>
                {movie.trailerUrl ? (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white px-5 py-2.5 text-sm font-black text-black transition hover:bg-gray-200"
                  >
                    Mo trailer
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <article className="rounded-lg border border-white/10 bg-[#151719] p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <Film className="text-red-300" size={22} />
              <h2 className="text-2xl font-black">Tóm tắt nội dung</h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-white/68 sm:text-base">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-[#151719] p-5">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <Clock3 className="text-cyan-200" size={20} />
                Suất chiếu gần nhất
              </h2>

              {movie.showtimeDetails.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {movie.showtimeDetails.slice(0, 8).map((showtime) => (
                    <Link
                      key={showtime.id}
                      href={`/ticket-booking?movie=${movie.slug}&time=${encodeURIComponent(
                        showtime.time,
                      )}`}
                      className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-center text-xs font-black text-white transition hover:border-red-500 hover:bg-red-600"
                    >
                      {showtime.time}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-md border border-white/10 bg-black/25 px-3 py-3 text-sm font-semibold text-white/45">
                  Chua co suat chieu dang ban.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#151719] p-5">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <Users className="text-amber-200" size={20} />
                Thong tin nhanh
              </h2>
              <div className="mt-4 grid gap-3 text-sm">
                <QuickFact icon={<CalendarDays size={16} />} label={movie.releaseDate ?? "Dang cap nhat"} />
                <QuickFact icon={<Clock3 size={16} />} label={movie.duration} />
                <QuickFact icon={<Globe2 size={16} />} label={movie.country ?? "Dang cap nhat"} />
              </div>
            </div>
          </aside>
        </section>

        <MovieReviewsSection
          movieId={movie.id}
          movieTitle={movie.title}
          initialRating={movie.rating}
          initialReviewCount={movie.reviewCount}
          initialReviews={movie.reviews}
        />

        <MovieRecommendationsSection movieId={movie.id} />
      </section>
    </main>
  );
}

function MovieFact({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-black uppercase text-white/38">{label}</dt>
      <dd className="min-w-0 text-sm font-semibold text-white/76">
        {value || "Dang cap nhat"}
      </dd>
    </div>
  );
}

function QuickFact({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-black/25 px-3 py-2.5 font-semibold text-white/72">
      <span className="text-white/50">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
