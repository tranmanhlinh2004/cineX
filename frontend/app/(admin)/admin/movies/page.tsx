import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  Film,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Ticket,
  Trash2,
} from "lucide-react";
import { adminMovies } from "./movie-data";

const movieStats = [
  {
    label: "Tổng phim",
    value: "68",
    helper: "Trong thư viện CineX",
    icon: Film,
    tone: "bg-red-50 text-red-700",
  },
  {
    label: "Đang chiếu",
    value: "12",
    helper: "Đang mở bán vé",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Sắp chiếu",
    value: "9",
    helper: "Đã lên kế hoạch",
    icon: CalendarClock,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    label: "Đã bán vé",
    value: "12.480",
    helper: "Theo các phim đang chiếu",
    icon: Ticket,
    tone: "bg-amber-50 text-amber-700",
  },
];

function statusClass(status: string) {
  if (status === "Đang hoạt động") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Sắp chiếu") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function AdminMoviesPage() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            3.4.3
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Quản lý phim
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Khung quản lý danh mục phim, lịch phát hành, trạng thái chiếu và nội
            dung hiển thị trên website.
          </p>
        </div>

        <Link
          href="/admin/movies/new"
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
        >
          <Plus size={17} />
          Thêm phim
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {movieStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${stat.tone}`}
                >
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {stat.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_210px_auto]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Tìm phim theo tên, thể loại, mã phim..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500">
            <option>Tất cả trạng thái</option>
            <option>Đang hoạt động</option>
            <option>Sắp chiếu</option>
            <option>Tạm dừng</option>
          </select>

          <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500">
            <option>Tất cả thể loại</option>
            <option>Hành động</option>
            <option>Hoạt hình</option>
            <option>Kinh dị</option>
            <option>Tâm lý</option>
          </select>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={17} />
            Lọc
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <th className="px-4 py-4 text-center font-black">Tên phim</th>
                <th className="px-4 py-4 font-black">Thể loại</th>
                <th className="px-4 py-4 text-center font-black">Quốc gia</th>
                <th className="px-4 py-4 text-center font-black">Giới hạn độ tuổi</th>
                <th className="px-4 py-4 text-center font-black">Trạng thái</th>
                <th className="px-4 py-4 text-center font-black">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {adminMovies.map((movie) => (
                <tr
                  key={movie.title}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-black text-slate-950">
                          {movie.title}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {movie.duration} - {movie.language}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                    {movie.genre}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-black text-slate-950">
                    {movie.country}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">
                    {movie.ageRating}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-sm font-black ${statusClass(
                        movie.status,
                      )}`}
                    >
                      {movie.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/movies/${movie.id}`}
                        aria-label={`Xem ${movie.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        aria-label={`Sửa ${movie.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-500 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Xóa ${movie.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-red-500 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
