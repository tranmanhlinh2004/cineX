"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Baby,
  CalendarDays,
  Clapperboard,
  Clock3,
  Drama,
  Flame,
  Heart,
  Laugh,
  Play,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Ticket,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Genre = {
  id: string;
  name: string;
  description: string;
  movieCount: number;
  Icon: LucideIcon;
  previewImages: string[];
  accentClass: string;
  activeClass: string;
  iconClass: string;
};

type MovieStatus = "Đang chiếu" | "Sắp chiếu";

type Movie = {
  id: number;
  slug: string;
  title: string;
  image: string;
  rating: string;
  ageRating: string;
  duration: string;
  format: string;
  country: string;
  status: MovieStatus;
  releaseDate: string;
  genreIds: string[];
  description: string;
};

type Mood = {
  title: string;
  description: string;
  genreId: string;
  Icon: LucideIcon;
};

const genreCards: Genre[] = [
  {
    id: "action",
    name: "Hành động",
    description: "Nhịp nhanh, nhiều cao trào, hợp cho suất tối.",
    movieCount: 8,
    Icon: Zap,
    previewImages: ["/movies/end-game.jpg", "/movies/broly.jpg"],
    accentClass: "from-red-600/25 to-orange-400/10",
    activeClass: "border-red-500 bg-red-600/15",
    iconClass: "bg-red-600 text-white",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Thế giới giàu màu sắc, cảm xúc mạnh và fan service tốt.",
    movieCount: 6,
    Icon: Sparkles,
    previewImages: ["/movies/infinity-castle.jpg", "/movies/broly.jpg"],
    accentClass: "from-cyan-400/20 to-violet-500/10",
    activeClass: "border-cyan-400 bg-cyan-400/10",
    iconClass: "bg-cyan-400 text-black",
  },
  {
    id: "sci-fi",
    name: "Khoa học",
    description: "Không gian, công nghệ và những ý tưởng lớn.",
    movieCount: 5,
    Icon: Rocket,
    previewImages: ["/movies/Interstellar.jpg", "/movies/end-game.jpg"],
    accentClass: "from-indigo-400/20 to-cyan-300/10",
    activeClass: "border-indigo-300 bg-indigo-400/10",
    iconClass: "bg-indigo-300 text-black",
  },
  {
    id: "crime",
    name: "Tội phạm",
    description: "Căng thẳng, đấu trí, nhân vật có chiều sâu.",
    movieCount: 4,
    Icon: Shield,
    previewImages: ["/movies/dark-knight.jpg", "/movies/end-game.jpg"],
    accentClass: "from-slate-300/15 to-red-500/10",
    activeClass: "border-slate-300 bg-slate-300/10",
    iconClass: "bg-slate-200 text-black",
  },
  {
    id: "family",
    name: "Gia đình",
    description: "Dễ xem, ấm áp, phù hợp đi cùng trẻ nhỏ.",
    movieCount: 7,
    Icon: Baby,
    previewImages: ["/movies/demo.png", "/movies/broly.jpg"],
    accentClass: "from-emerald-400/20 to-yellow-300/10",
    activeClass: "border-emerald-300 bg-emerald-400/10",
    iconClass: "bg-emerald-300 text-black",
  },
  {
    id: "comedy",
    name: "Hài",
    description: "Nhẹ nhàng, giải trí nhanh, hợp nhóm bạn.",
    movieCount: 5,
    Icon: Laugh,
    previewImages: ["/movies/demo.png", "/movies/infinity-castle.jpg"],
    accentClass: "from-yellow-300/20 to-red-400/10",
    activeClass: "border-yellow-300 bg-yellow-300/10",
    iconClass: "bg-yellow-300 text-black",
  },
  {
    id: "romance",
    name: "Tình cảm",
    description: "Cảm xúc, chữa lành và dễ chọn cho buổi hẹn.",
    movieCount: 4,
    Icon: Heart,
    previewImages: ["/movies/demo.png", "/movies/Interstellar.jpg"],
    accentClass: "from-pink-400/20 to-red-500/10",
    activeClass: "border-pink-300 bg-pink-400/10",
    iconClass: "bg-pink-300 text-black",
  },
  {
    id: "drama",
    name: "Tâm lý",
    description: "Câu chuyện nặng nhân vật, hợp khán giả thích chiều sâu.",
    movieCount: 5,
    Icon: Drama,
    previewImages: ["/movies/dark-knight.jpg", "/movies/Interstellar.jpg"],
    accentClass: "from-purple-300/15 to-cyan-300/10",
    activeClass: "border-purple-300 bg-purple-300/10",
    iconClass: "bg-purple-300 text-black",
  },
];

const movies: Movie[] = [
  {
    id: 1,
    slug: "avenger-end-game",
    title: "Avenger: End Game",
    image: "/movies/end-game.jpg",
    rating: "9.0",
    ageRating: "T13",
    duration: "182 phút",
    format: "IMAX",
    country: "Mỹ",
    status: "Đang chiếu",
    releaseDate: "26/04/2019",
    genreIds: ["action", "sci-fi"],
    description:
      "Những siêu anh hùng còn lại tìm cách đảo ngược cú búng tay của Thanos.",
  },
  {
    id: 2,
    slug: "demon-slayer-infinity-castle",
    title: "Demon Slayer: Infinity Castle",
    image: "/movies/infinity-castle.jpg",
    rating: "9.1",
    ageRating: "T16",
    duration: "165 phút",
    format: "Phụ đề",
    country: "Nhật Bản",
    status: "Sắp chiếu",
    releaseDate: "14/06/2026",
    genreIds: ["anime", "action", "drama"],
    description:
      "Tanjiro cùng Sát Quỷ Đoàn bước vào Vô Hạn Thành cho trận chiến quyết định.",
  },
  {
    id: 3,
    slug: "dragon-ball-super-broly",
    title: "Dragon Ball Super: Broly",
    image: "/movies/broly.jpg",
    rating: "8.8",
    ageRating: "T13",
    duration: "101 phút",
    format: "Thuyết minh",
    country: "Nhật Bản",
    status: "Đang chiếu",
    releaseDate: "14/12/2018",
    genreIds: ["anime", "action", "comedy"],
    description:
      "Goku và Vegeta đối đầu Broly trong trận chiến Saiyan bùng nổ năng lượng.",
  },
  {
    id: 4,
    slug: "interstellar",
    title: "Interstellar",
    image: "/movies/Interstellar.jpg",
    rating: "9.2",
    ageRating: "T13",
    duration: "169 phút",
    format: "IMAX",
    country: "Mỹ",
    status: "Đang chiếu",
    releaseDate: "07/11/2014",
    genreIds: ["sci-fi", "drama"],
    description:
      "Một nhóm phi hành gia vượt qua hố sâu không gian để tìm hy vọng mới.",
  },
  {
    id: 5,
    slug: "the-dark-knight",
    title: "The Dark Knight",
    image: "/movies/dark-knight.jpg",
    rating: "9.3",
    ageRating: "T16",
    duration: "152 phút",
    format: "Phụ đề",
    country: "Mỹ",
    status: "Đang chiếu",
    releaseDate: "18/07/2008",
    genreIds: ["crime", "action", "drama"],
    description:
      "Batman đối mặt Joker, kẻ gieo hỗn loạn khắp Gotham bằng những lựa chọn khó khăn.",
  },
  {
    id: 6,
    slug: "chu-meo-cau-kinh",
    title: "Chú Mèo Cáu Kỉnh",
    image: "/movies/demo.png",
    rating: "8.4",
    ageRating: "P",
    duration: "98 phút",
    format: "Lồng tiếng",
    country: "Việt Nam",
    status: "Sắp chiếu",
    releaseDate: "16/08/2026",
    genreIds: ["family", "comedy", "romance"],
    description:
      "Một chuyến phiêu lưu nhẹ nhàng, vui nhộn dành cho gia đình vào cuối tuần.",
  },
];

const moods: Mood[] = [
  {
    title: "Muốn xem thật đã",
    description: "Chọn phim hành động, nhịp nhanh và nhiều cảnh lớn.",
    genreId: "action",
    Icon: Flame,
  },
  {
    title: "Đi cùng gia đình",
    description: "Ưu tiên phim nhẹ, dễ xem, có lồng tiếng.",
    genreId: "family",
    Icon: Baby,
  },
  {
    title: "Fan anime",
    description: "Các phim Nhật Bản, màu sắc mạnh và nhiều cảm xúc.",
    genreId: "anime",
    Icon: Sparkles,
  },
  {
    title: "Muốn suy ngẫm",
    description: "Phim khoa học, tâm lý, câu chuyện có chiều sâu.",
    genreId: "sci-fi",
    Icon: Rocket,
  },
];

const statusFilters: Array<MovieStatus | "Tất cả"> = [
  "Tất cả",
  "Đang chiếu",
  "Sắp chiếu",
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export default function GenresPage() {
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statusFilters)[number]>("Tất cả");
  const [query, setQuery] = useState("");

  const selectedGenre = genreCards.find((genre) => genre.id === selectedGenreId);
  const keyword = normalizeText(query.trim());

  const filteredMovies = movies.filter((movie) => {
    const matchesGenre =
      selectedGenreId === "all" || movie.genreIds.includes(selectedGenreId);
    const matchesStatus =
      selectedStatus === "Tất cả" || movie.status === selectedStatus;
    const movieGenres = movie.genreIds
      .map((id) => genreCards.find((genre) => genre.id === id)?.name ?? "")
      .join(" ");
    const searchable = normalizeText(
      `${movie.title} ${movie.description} ${movie.country} ${movie.format} ${movieGenres}`,
    );

    return matchesGenre && matchesStatus && searchable.includes(keyword);
  });

  const resetFilters = () => {
    setSelectedGenreId("all");
    setSelectedStatus("Tất cả");
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl">
          <Image
            src="/movies/dark-knight.jpg"
            alt="Thể loại phim CineX"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/30" />

          <div className="relative z-10 grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_380px] lg:p-10">
            <div className="max-w-[760px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40">
                <Clapperboard size={15} />
                CineX Genres
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
                Khám phá phim theo gu xem của bạn
              </h1>

              <p className="mt-4 max-w-[620px] text-sm leading-7 text-white/72 sm:text-base">
                Chọn thể loại, trạng thái phim hoặc tìm nhanh theo tên để mở ra
                danh sách phim phù hợp trước khi đặt vé.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["8 thể loại", "6 phim nổi bật", "Đang chiếu & sắp chiếu"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white/50">Đang chọn</p>
              <p className="mt-2 text-3xl font-black">
                {selectedGenre?.name ?? "Tất cả thể loại"}
              </p>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-white/55">
                {selectedGenre?.description ??
                  "Xem toàn bộ phim đang có trên CineX theo nhiều gu xem khác nhau."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Stat label="Thể loại" value={genreCards.length.toString()} />
                <Stat label="Phim hợp gu" value={filteredMovies.length.toString()} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-white/10 bg-[#151719] p-4 shadow-xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={selectedStatus === status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                    selectedStatus === status
                      ? "bg-white text-black"
                      : "bg-white/8 text-white/70 hover:bg-white/14 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-[390px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm phim, thể loại, quốc gia..."
                className="h-11 w-full rounded-md border border-white/10 bg-black/30 px-11 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-500"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-300">Bộ sưu tập CineX</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Thể loại phim
              </h2>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-red-500 hover:text-white"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              aria-pressed={selectedGenreId === "all"}
              onClick={() => setSelectedGenreId("all")}
              className={`overflow-hidden rounded-lg border p-4 text-left transition hover:-translate-y-1 ${
                selectedGenreId === "all"
                  ? "border-red-500 bg-red-600/15"
                  : "border-white/10 bg-[#151719] hover:border-red-500/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-black">
                  <Clapperboard size={22} />
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/60">
                  {movies.length} phim
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black">Tất cả</h3>
              <p className="mt-2 min-h-[44px] text-sm leading-6 text-white/50">
                Xem toàn bộ thư viện phim theo nhiều gu xem khác nhau.
              </p>
            </button>

            {genreCards.map((genre) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                active={selectedGenreId === genre.id}
                onSelect={() => setSelectedGenreId(genre.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-4">
          {moods.map((mood) => {
            const Icon = mood.Icon;

            return (
              <button
                key={mood.title}
                type="button"
                onClick={() => setSelectedGenreId(mood.genreId)}
                className="rounded-lg border border-white/10 bg-[#151719] p-4 text-left transition hover:-translate-y-1 hover:border-red-500/60"
              >
                <Icon className="text-red-300" size={24} />
                <h3 className="mt-4 font-black">{mood.title}</h3>
                <p className="mt-2 text-sm leading-5 text-white/50">
                  {mood.description}
                </p>
              </button>
            );
          })}
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-300">
                {selectedGenre?.name ?? "Tất cả thể loại"}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Phim phù hợp
              </h2>
            </div>

            <p className="text-sm text-white/50">
              {filteredMovies.length} phim phù hợp
            </p>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#151719] px-5 py-12 text-center">
              <p className="text-lg font-bold">Không tìm thấy phim phù hợp</p>
              <p className="mt-2 text-sm text-white/50">
                Thử đổi trạng thái phim, thể loại hoặc từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-md bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-gray-200"
              >
                Xem tất cả phim
              </button>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

function GenreCard({
  genre,
  active,
  onSelect,
}: {
  genre: Genre;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = genre.Icon;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`group overflow-hidden rounded-lg border p-4 text-left transition hover:-translate-y-1 ${
        active
          ? genre.activeClass
          : "border-white/10 bg-[#151719] hover:border-red-500/60"
      }`}
    >
      <div className={`-mx-4 -mt-4 mb-4 bg-gradient-to-br ${genre.accentClass} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-md ${genre.iconClass}`}
          >
            <Icon size={22} />
          </span>

          <div className="flex -space-x-3">
            {genre.previewImages.map((image) => (
              <span
                key={image}
                className="relative h-12 w-12 overflow-hidden rounded-md border border-white/20 bg-black"
              >
                <Image
                  src={image}
                  alt={genre.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black">{genre.name}</h3>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/60">
          {genre.movieCount}
        </span>
      </div>
      <p className="mt-2 min-h-[44px] text-sm leading-6 text-white/50">
        {genre.description}
      </p>
    </button>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const statusClass =
    movie.status === "Đang chiếu"
      ? "bg-red-600 text-white"
      : "bg-cyan-400 text-black";
  const ctaHref =
    movie.status === "Đang chiếu"
      ? `/booking?movie=${movie.slug}`
      : `/booking?movie=${movie.slug}&notify=true`;

  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-red-500/60">
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusClass}`}>
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
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-xl font-black">{movie.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/55">
          {movie.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5">
            <Clock3 size={13} />
            {movie.duration}
          </span>
          <span className="rounded-md bg-white/8 px-2.5 py-1.5">
            {movie.format}
          </span>
          <span className="rounded-md bg-white/8 px-2.5 py-1.5">
            {movie.country}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/8 px-2.5 py-1.5">
            <CalendarDays size={13} />
            {movie.releaseDate}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-black text-black transition hover:bg-gray-200"
          >
            <Play size={15} className="fill-black" />
            Trailer
          </button>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700"
          >
            <Ticket size={15} />
            {movie.status === "Đang chiếu" ? "Đặt vé" : "Nhắc tôi"}
          </Link>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/8 p-4">
      <p className="text-xs font-bold uppercase text-white/45">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
