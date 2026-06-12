import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Armchair,
  BadgePercent,
  Building2,
  CalendarDays,
  ChevronRight,
  Clapperboard,
  Clock3,
  Film,
  MapPin,
  ShieldCheck,
  Star,
  Ticket,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Giới thiệu về CineX - Hệ thống rạp phim hiện đại tại TP. Vinh",
  description:
    "Tìm hiểu về hệ thống rạp phim CineX, không gian chiếu phim, công nghệ âm thanh hình ảnh và dịch vụ đặt vé.",
};

type Stat = {
  value: string;
  label: string;
};

type Feature = {
  title: string;
  description: string;
  Icon: LucideIcon;
  accentClass: string;
};

type Cinema = {
  name: string;
  address: string;
  rooms: string;
  formats: string[];
  image: string;
};

const stats: Stat[] = [
  { value: "3", label: "cụm rạp tại TP. Vinh" },
  { value: "18", label: "phòng chiếu đang vận hành" },
  { value: "2.4K+", label: "ghế tiêu chuẩn, VIP và couple" },
  { value: "08:00", label: "mở cửa mỗi ngày" },
];

const features: Feature[] = [
  {
    title: "Màn chiếu sắc nét",
    description:
      "Không gian chiếu tối ưu cho các định dạng 2D, 3D và IMAX với độ sáng ổn định ở nhiều vị trí ghế.",
    Icon: Film,
    accentClass: "bg-red-600/15 text-red-300",
  },
  {
    title: "Âm thanh sống động",
    description:
      "Hệ thống âm thanh vòm giúp lời thoại rõ, hiệu ứng giàu lực và cân bằng tốt trong từng phòng chiếu.",
    Icon: Volume2,
    accentClass: "bg-cyan-400/15 text-cyan-200",
  },
  {
    title: "Ghế ngồi thoải mái",
    description:
      "Bố trí hàng ghế rộng, có lựa chọn VIP và couple để phù hợp đi một mình, đi đôi hoặc theo nhóm.",
    Icon: Armchair,
    accentClass: "bg-amber-300/15 text-amber-200",
  },
  {
    title: "Đặt vé nhanh",
    description:
      "Chọn rạp, ngày, suất chiếu, ghế ngồi và combo bắp nước trong cùng một luồng đặt vé rõ ràng.",
    Icon: Ticket,
    accentClass: "bg-emerald-400/15 text-emerald-200",
  },
];

const cinemas: Cinema[] = [
  {
    name: "CineX Vinh Center",
    address: "Tầng 4, TTTM Vinh Center, 69 Hồ Tùng Mậu, TP. Vinh",
    rooms: "7 phòng chiếu",
    formats: ["2D", "3D", "IMAX", "Dolby 7.1"],
    image: "/movies/end-game.jpg",
  },
  {
    name: "CineX Lê Lợi",
    address: "18 Lê Lợi, TP. Vinh, Nghệ An",
    rooms: "5 phòng chiếu",
    formats: ["2D", "Dolby 7.1", "Lồng tiếng"],
    image: "/movies/dark-knight.jpg",
  },
  {
    name: "CineX Quang Trung",
    address: "72 Quang Trung, TP. Vinh, Nghệ An",
    rooms: "6 phòng chiếu",
    formats: ["2D", "3D", "IMAX"],
    image: "/movies/Interstellar.jpg",
  },
];

const commitments = [
  {
    title: "Lịch chiếu rõ ràng",
    description:
      "Thông tin suất chiếu, phòng chiếu, giá vé và số ghế còn lại được trình bày để người dùng chọn nhanh.",
    Icon: CalendarDays,
  },
  {
    title: "Dịch vụ ổn định",
    description:
      "Quầy vé, khu bắp nước và hỗ trợ khách hàng được vận hành xuyên suốt trong giờ mở cửa.",
    Icon: ShieldCheck,
  },
  {
    title: "Không gian cho cộng đồng",
    description:
      "CineX phù hợp cho buổi hẹn, nhóm bạn, gia đình và các sự kiện xem phim theo cụm.",
    Icon: Users,
  },
];

const milestones = [
  ["2024", "Ra mắt cụm rạp CineX đầu tiên tại trung tâm TP. Vinh."],
  ["2025", "Mở rộng thêm phòng chiếu IMAX và khu trải nghiệm combo tự chọn."],
  ["2026", "Đồng bộ hệ thống đặt vé trực tuyến trên website CineX."],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-white">
      <section className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-2xl">
          <Image
            src="/movies/Interstellar.jpg"
            alt="Không gian rạp phim CineX"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-black/30" />

          <div className="relative z-10 grid min-h-[540px] gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_380px] lg:p-10">
            <div className="flex max-w-[780px] flex-col justify-center">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-950/40">
                <Clapperboard size={15} />
                Giới thiệu CineX
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
                Rạp phim hiện đại cho những buổi xem trọn vẹn
              </h1>

              <p className="mt-5 max-w-[650px] text-sm leading-7 text-white/72 sm:text-base">
                CineX xây dựng trải nghiệm điện ảnh liền mạch từ lúc chọn phim,
                đặt ghế đến khi thưởng thức phim tại rạp. Không gian được thiết
                kế gọn gàng, âm thanh hình ảnh rõ nét và dịch vụ tập trung vào
                tốc độ, sự thoải mái, tính minh bạch.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/showtimes"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700"
                >
                  Xem lịch chiếu
                  <ChevronRight size={18} />
                </Link>
                <Link
                  href="/ticket-booking"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-gray-200"
                >
                  Đặt vé ngay
                  <Ticket size={18} />
                </Link>
              </div>
            </div>

            <div className="grid content-end gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur"
                >
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-sm leading-5 text-white/55">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold text-red-300">Câu chuyện CineX</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Tập trung vào trải nghiệm xem phim thực tế
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
              CineX không chỉ là nơi bán vé. Mỗi cụm rạp được tổ chức để khách
              dễ tìm suất chiếu, dễ chọn ghế, dễ lấy combo và có đủ thông tin
              trước khi thanh toán. Cách tiếp cận này giúp việc đi xem phim nhẹ
              hơn, nhất là khi đi theo nhóm hoặc đặt vé vào giờ cao điểm.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {commitments.map((item) => {
              const Icon = item.Icon;

              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-[#151719] p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-red-600/15 text-red-300">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-300">
                Trải nghiệm tại rạp
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Những điểm CineX đầu tư
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              Dành cho phim bom tấn, anime và gia đình
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.Icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-lg border border-white/10 bg-[#151719] p-5 transition hover:-translate-y-1 hover:border-red-500/60"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-md ${feature.accentClass}`}
                  >
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/52">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-red-300">Hệ thống rạp</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Các cụm rạp CineX
              </h2>
            </div>
            <Link
              href="/showtimes"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-gray-200"
            >
              Xem suất chiếu
              <ChevronRight size={17} />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {cinemas.map((cinema) => (
              <article
                key={cinema.name}
                className="group overflow-hidden rounded-lg border border-white/10 bg-[#151719] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-red-500/60"
              >
                <div className="relative aspect-[16/10] bg-black">
                  <Image
                    src={cinema.image}
                    alt={cinema.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    <Building2 size={14} />
                    {cinema.rooms}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black">{cinema.name}</h3>
                  <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/55">
                    <MapPin size={16} className="mt-1 shrink-0 text-red-300" />
                    {cinema.address}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {cinema.formats.map((format) => (
                      <span
                        key={format}
                        className="rounded-md bg-white/8 px-2.5 py-1.5 text-xs font-bold text-white/72"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-white/10 bg-[#151719] p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <BadgePercent className="text-red-300" size={24} />
              <h2 className="text-2xl font-black sm:text-3xl">
                Dấu mốc phát triển
              </h2>
            </div>

            <div className="space-y-4">
              {milestones.map(([year, description]) => (
                <div
                  key={year}
                  className="grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 sm:grid-cols-[92px_1fr]"
                >
                  <p className="text-2xl font-black text-red-300">{year}</p>
                  <p className="text-sm leading-6 text-white/58">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-[#151719] p-5 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-400/15 text-cyan-200">
              <Clock3 size={24} />
            </div>
            <h2 className="mt-5 text-2xl font-black">Sẵn sàng cho suất chiếu hôm nay</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Kiểm tra lịch chiếu theo rạp, chọn ghế còn trống và đặt vé trực
              tuyến trước khi đến CineX.
            </p>
            <Link
              href="/ticket-booking"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              Bắt đầu đặt vé
              <Ticket size={18} />
            </Link>
          </aside>
        </section>
      </section>
    </div>
  );
}
