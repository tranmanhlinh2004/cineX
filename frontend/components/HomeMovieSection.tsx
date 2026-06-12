import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  Play,
  Star,
  Ticket,
} from "lucide-react";
import type { HomeMovie } from "@/lib/home-movies";

type HomeMovieSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  movies: HomeMovie[];
  variant: "now" | "soon";
};

const variantStyles = {
  now: {
    accentText: "text-red-300",
    badge: "bg-red-600 text-white",
    action: "bg-red-600 text-white hover:bg-red-700",
    borderHover: "hover:border-red-500/70",
    icon: Flame,
    cta: "Đặt vé",
  },
  soon: {
    accentText: "text-cyan-200",
    badge: "bg-cyan-400 text-black",
    action: "bg-cyan-400 text-black hover:bg-cyan-300",
    borderHover: "hover:border-cyan-400/70",
    icon: CalendarDays,
    cta: "Nhắc tôi",
  },
} as const;

export default function HomeMovieSection({
  eyebrow,
  title,
  description,
  href,
  movies,
  variant,
}: HomeMovieSectionProps) {
  const styles = variantStyles[variant];

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={`text-sm font-bold uppercase ${styles.accentText}`}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            {description}
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white/78 transition hover:border-white/30 hover:text-white"
        >
          Xem tất cả
          <ChevronRight size={17} />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {movies.map((movie) => (
          <MovieCard key={`${variant}-${movie.slug}`} movie={movie} variant={variant} />
        ))}
      </div>
    </section>
  );
}

function MovieCard({ movie, variant }: { movie: HomeMovie; variant: "now" | "soon" }) {
  const styles = variantStyles[variant];
  const StatusIcon = styles.icon;
  const bookingHref =
    variant === "now"
      ? `/ticket-booking?movie=${movie.slug}`
      : `/ticket-booking?movie=${movie.slug}&notify=true`;
  const detailHref = `/movies/${movie.id}`;
  const metadata = [
    variant === "soon" && movie.releaseDate ? movie.releaseDate : movie.duration,
    movie.genres[0],
    movie.language,
  ].filter((item): item is string => Boolean(item));

  return (
    <article
      className={`group overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 ${styles.borderHover}`}
    >
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
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-black ${styles.badge}`}
          >
            <StatusIcon size={13} />
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
          <a
            href={movie.trailerUrl ?? bookingHref}
            target={movie.trailerUrl ? "_blank" : undefined}
            rel={movie.trailerUrl ? "noreferrer" : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Play size={15} className="fill-black" />
            Trailer
          </a>
          <Link
            href={bookingHref}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-black transition ${styles.action}`}
          >
            {variant === "now" ? <Ticket size={15} /> : <Bell size={15} />}
            {styles.cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
