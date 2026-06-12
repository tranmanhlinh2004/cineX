import Link from "next/link";
import HeroMovieSlider from "@/components/HeroMoviesSlider";
import NowShowingMovies from "@/components/NowShowingMovies";
import ComingSoonMovies from "@/components/ComingsoonMovies";
import QuickBookingPanel from "@/components/QuickBookingPanel";
import { getHomePageData, type HomeCinemaBranch } from "@/lib/home-movies";
import {
  BadgePercent,
  CalendarDays,
  Clock3,
  MapPin,
  MonitorPlay,
  ShieldCheck,
  Ticket,
  Utensils,
} from "lucide-react";

export default async function HomePage() {
  const homeData = await getHomePageData();

  return (
    <main className="min-h-screen bg-[#0d0f12] text-white">
      {homeData.error ? <HomeDataNotice message={homeData.error} /> : null}
      <HeroMovieSlider movies={homeData.heroMovies} />
      <QuickBookingPanel
        dates={homeData.quickBooking.dates}
        cinemas={homeData.quickBooking.cinemas}
        showtimes={homeData.quickBooking.showtimes}
      />
      <NowShowingMovies movies={homeData.nowShowingMovies} />
      <ComingSoonMovies movies={homeData.comingSoonMovies} />
      <CinemaHighlights cinemas={homeData.quickBooking.cinemas} />
    </main>
  );
}

function HomeDataNotice({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
        {message}
      </div>
    </section>
  );
}

function CinemaHighlights({ cinemas }: { cinemas: HomeCinemaBranch[] }) {
  const visibleCinemas = cinemas.slice(0, 3);
  const items = [
    {
      icon: Ticket,
      title: "Vé điện tử",
      description: "Nhận mã vé ngay sau khi hoàn tất đặt chỗ.",
      accent: "text-red-300",
    },
    {
      icon: MonitorPlay,
      title: "Phòng chiếu đa định dạng",
      description: "Dữ liệu phòng chiếu được đồng bộ theo từng rạp.",
      accent: "text-cyan-200",
    },
    {
      icon: Utensils,
      title: "Combo bắp nước",
      description: "Các gói combo được gợi ý theo từng suất chiếu.",
      accent: "text-amber-200",
    },
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-white/10 bg-[#151719] p-5">
          <div className="mb-5 flex items-center gap-3">
            <MapPin className="text-cyan-200" size={24} />
            <h2 className="text-2xl font-black">Rạp đang mở bán</h2>
          </div>

          <div className="space-y-3">
            {visibleCinemas.length > 0 ? (
              visibleCinemas.map((cinema, index) => (
                <div
                  key={cinema.value}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 px-4 py-3"
                >
                  <div>
                    <p className="font-bold">{cinema.label}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-white/45">
                      <Clock3 size={13} />
                      {cinema.roomCount} phòng đang hoạt động
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    {index === 0 ? "Nhiều suất" : "Còn vé"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-white/10 bg-black/25 px-4 py-6 text-sm font-semibold text-white/45">
                Chưa có dữ liệu rạp.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-lg border border-white/10 bg-[#151719] p-5"
              >
                <Icon className={item.accent} size={26} />
                <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Link
          href="/showtimes"
          className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#151719] px-5 py-4 transition hover:border-red-500/70"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-bold text-red-300">
              <CalendarDays size={17} />
              Lịch chiếu hôm nay
            </span>
            <span className="mt-1 block text-lg font-black">
              Xem toàn bộ suất đang bán
            </span>
          </span>
          <Ticket className="shrink-0 text-white/55" size={28} />
        </Link>

        <Link
          href="/ticket-booking"
          className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#151719] px-5 py-4 transition hover:border-amber-300/60"
        >
          <span>
            <span className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <BadgePercent size={17} />
              Ưu đãi CineX
            </span>
            <span className="mt-1 block text-lg font-black">
              Combo và giá vé thành viên
            </span>
          </span>
          <ShieldCheck className="shrink-0 text-white/55" size={28} />
        </Link>
      </div>
    </section>
  );
}
