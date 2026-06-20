"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Film,
  Play,
  Star,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { HomeMovie } from "@/lib/home-movies";

const slideDuration = 5200;

type HeroMovieSliderProps = {
  movies: HomeMovie[];
};

export default function HeroMovieSlider({ movies }: HeroMovieSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeIndex = movies.length > 0 ? currentIndex % movies.length : 0;
  const currentMovie = movies[activeIndex] ?? movies[0];

  const goToNextSlide = () => {
    setCurrentIndex((index) => (index + 1) % movies.length);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((index) =>
      index === 0 ? movies.length - 1 : index - 1,
    );
  };

  useEffect(() => {
    if (movies.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % movies.length);
    }, slideDuration);

    return () => window.clearInterval(timer);
  }, [movies.length]);

  if (movies.length === 0 || !currentMovie) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/40">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {movies.map((movie, index) => (
            <article key={movie.slug} className="relative min-w-full overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={movie.bannerImage ?? movie.image}
                  alt={movie.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/35" />
              </div>

              <div className="relative z-10 flex min-h-[560px] flex-col justify-between p-5 sm:min-h-[620px] sm:p-8 lg:p-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-950/40">
                    <Ticket size={15} />
                    {movie.showtimes.length > 0
                      ? `${movie.showtimes.length} suất gần nhất`
                      : movie.status}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    {movie.rating}/10
                  </span>
                </div>

                <div className="max-w-[680px]">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    CineX Premier
                  </p>
                  <h1 className="max-w-[820px] text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                    <Link
                      href={`/movies/${movie.id}`}
                      className="transition hover:text-white/80"
                    >
                      {movie.title}
                    </Link>
                  </h1>
                  <p className="mt-5 max-w-[610px] text-sm leading-7 text-white/76 sm:text-base">
                    {movie.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-white/85 sm:text-sm">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                      <CalendarDays size={15} />
                      {movie.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                      <Clock3 size={15} />
                      {movie.duration}
                    </span>
                    <span className="rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                      {movie.language}
                    </span>
                    <span className="rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                      {movie.genres.slice(0, 2).join(" / ")}
                    </span>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/ticket-booking?movie=${movie.slug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-950/40 transition hover:bg-red-700"
                    >
                      <Ticket size={18} />
                        Đặt vé ngay
                    </Link>

                    <Link
                      href={`/movies/${movie.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:border-white/35 hover:bg-white/15"
                    >
                      <Film size={18} />
                      Chi tiết phim
                    </Link>

                    <a
                      href={movie.trailerUrl ?? `/ticket-booking?movie=${movie.slug}`}
                      target={movie.trailerUrl ? "_blank" : undefined}
                      rel={movie.trailerUrl ? "noreferrer" : undefined}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-gray-200"
                    >
                      <Play size={18} className="fill-black" />
                      Xem trailer
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label="Phim trước"
          onClick={goToPreviousSlide}
          className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur transition hover:bg-white hover:text-black md:flex"
        >
          <ChevronLeft size={26} />
        </button>

        <button
          type="button"
          aria-label="Phim tiếp theo"
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur transition hover:bg-white hover:text-black md:flex"
        >
          <ChevronRight size={26} />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {movies.map((movie, index) => (
            <button
              key={movie.slug}
              type="button"
              aria-label={`Chọn ${movie.title}`}
              aria-current={activeIndex === index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-9 bg-red-500"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-5 right-5 hidden rounded-md border border-white/10 bg-black/45 px-4 py-3 backdrop-blur lg:block">
          <p className="text-xs font-bold uppercase text-white/45">
            Suất gần nhất
          </p>
          <div className="mt-2 flex gap-2">
            {currentMovie.showtimes?.slice(0, 4).map((time) => (
              <Link
                key={time}
                href={`/ticket-booking?movie=${currentMovie.slug}&time=${time}`}
                className="rounded-md bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-red-600"
              >
                {time}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
