import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Film,
  Ticket,
  Users,
} from "lucide-react";

type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type StatusDistributionItem = {
  label: string;
  value: number;
  color: string;
  dotClass: string;
};

const summaryCards: SummaryCard[] = [
  {
    label: "Tổng doanh thu",
    value: "1,84 tỷ",
    helper: "+12,4% so với tuần trước",
    icon: CircleDollarSign,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Đơn đặt vé",
    value: "12.480",
    helper: "1.246 đơn mới trong tuần",
    icon: Ticket,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    label: "Tỷ lệ lấp đầy",
    value: "78%",
    helper: "+6% so với kỳ trước",
    icon: Activity,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Khách thành viên",
    value: "8.420",
    helper: "+126 tài khoản mới",
    icon: Users,
    tone: "bg-amber-50 text-amber-600",
  },
];

const monthlyRevenue = [
  { month: "T1", revenue: 0, orders: 0 },
  { month: "T2", revenue: 0, orders: 0 },
  { month: "T3", revenue: 0, orders: 0 },
  { month: "T4", revenue: 0, orders: 0 },
  { month: "T5", revenue: 128, orders: 9 },
  { month: "T6", revenue: 172, orders: 24 },
  { month: "T7", revenue: 0, orders: 0 },
  { month: "T8", revenue: 0, orders: 0 },
  { month: "T9", revenue: 0, orders: 0 },
  { month: "T10", revenue: 0, orders: 0 },
  { month: "T11", revenue: 0, orders: 0 },
  { month: "T12", revenue: 0, orders: 0 },
];

const statusDistribution: StatusDistributionItem[] = [
  { label: "Hoàn thành", value: 0, color: "#2563eb", dotClass: "bg-blue-600" },
  { label: "Đã xác nhận", value: 6, color: "#22c55e", dotClass: "bg-emerald-500" },
  { label: "Đang xử lý", value: 0, color: "#f97316", dotClass: "bg-orange-500" },
  { label: "Đã hủy", value: 26, color: "#ef4444", dotClass: "bg-red-500" },
  { label: "Chờ hủy", value: 1, color: "#f97316", dotClass: "bg-orange-500" },
];

const upcomingShowtimes = [
  {
    movie: "Dune: Part Two",
    cinema: "CineX Vinh Center",
    room: "IMAX 01",
    start: "12/06/2026 09:30",
    booked: 146,
    total: 168,
    remaining: 22,
  },
  {
    movie: "Inside Out 2",
    cinema: "CineX Lê Lợi",
    room: "Phòng 03",
    start: "12/06/2026 11:15",
    booked: 82,
    total: 112,
    remaining: 30,
  },
  {
    movie: "Deadpool & Wolverine",
    cinema: "CineX Quang Trung",
    room: "Phòng 06",
    start: "12/06/2026 13:45",
    booked: 96,
    total: 120,
    remaining: 24,
  },
  {
    movie: "A Quiet Place: Day One",
    cinema: "CineX Vinh Center",
    room: "Dolby 02",
    start: "12/06/2026 16:20",
    booked: 63,
    total: 108,
    remaining: 45,
  },
];

const recentActivities = [
  {
    title: "Đồng bộ giao dịch online thành công",
    description: "128 giao dịch từ ví điện tử và thẻ ngân hàng đã được đối soát.",
    time: "10:42",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "CineX Quang Trung cần cập nhật suất tối",
    description: "Còn 3 khung giờ sau 20:00 chưa gán phim.",
    time: "10:18",
    icon: AlertTriangle,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    title: "IMAX 01 sắp đạt 90% công suất",
    description: "Nên mở thêm suất sau 21:00 nếu còn khung phòng.",
    time: "09:54",
    icon: Ticket,
    tone: "bg-red-50 text-red-600",
  },
  {
    title: "Thêm phim mới vào danh mục",
    description: "Inside Out 2 đã được mở lịch bán vé tại 2 cụm rạp.",
    time: "09:20",
    icon: Film,
    tone: "bg-blue-50 text-blue-600",
  },
];

const topMovies = [
  ["Dune: Part Two", "428,6 tr", "2.946 vé", "23%"],
  ["Inside Out 2", "316,2 tr", "2.318 vé", "17%"],
  ["Deadpool & Wolverine", "284,8 tr", "1.984 vé", "15%"],
  ["A Quiet Place: Day One", "206,5 tr", "1.472 vé", "11%"],
];

function buildConicGradient(items: StatusDistributionItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = cursor;
      const end = cursor + (item.value / total) * 360;
      cursor = end;

      return `${item.color} ${start}deg ${end}deg`;
    });

  return `conic-gradient(${stops.join(", ")})`;
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Bảng điều khiển quản trị
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Tổng quan vận hành CineX, doanh thu, đơn đặt vé và trạng thái rạp
            theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">
            <CalendarClock size={17} className="text-red-600" />
            Năm 2026
          </div>
          <div className="flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            {["3 tháng", "6 tháng", "12 tháng"].map((label) => (
              <button
                key={label}
                type="button"
                className={`min-h-9 rounded-md px-4 text-sm font-black transition ${
                  label === "12 tháng"
                    ? "bg-red-600 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ${card.tone}`}
              >
                <Icon size={22} />
              </div>
              <p className="text-sm font-black text-slate-500">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {card.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.22fr)_minmax(360px,0.9fr)]">
        <RevenueOrdersChart />
        <OrderStatusChart />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="grid gap-5">
          <article className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Suất chiếu sắp diễn ra
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi số ghế đã đặt và trạng thái phòng trong ngày.
                </p>
              </div>
              <Link
                href="/admin/revenue"
                className="inline-flex w-fit items-center gap-2 text-sm font-black text-red-700"
              >
                Xem báo cáo
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-black">Phim</th>
                    <th className="px-5 py-3 font-black">Rạp / phòng</th>
                    <th className="px-5 py-3 font-black">Thời gian</th>
                    <th className="px-5 py-3 font-black">Đã đặt / Tổng</th>
                    <th className="px-5 py-3 font-black">Còn lại</th>
                    <th className="px-5 py-3 font-black">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingShowtimes.map((showtime) => {
                    const nearlyFull = showtime.remaining <= 24;

                    return (
                      <tr key={`${showtime.movie}-${showtime.start}`}>
                        <td className="px-5 py-4 font-black text-slate-950">
                          {showtime.movie}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-700">
                            {showtime.cinema}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-400">
                            {showtime.room}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {showtime.start}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {showtime.booked} / {showtime.total}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-950">
                          {showtime.remaining}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md border px-2.5 py-1.5 text-xs font-black ${
                              nearlyFull
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {nearlyFull ? "Sắp hết ghế" : "Còn ghế"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-black text-slate-950">
                Phim tạo doanh thu cao
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {topMovies.map(([movie, revenue, tickets, share]) => (
                <div
                  key={movie}
                  className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{movie}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {tickets}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-950">{revenue}</p>
                    <p className="mt-1 text-xs font-black text-red-700">
                      {share}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="grid content-start gap-5">
          <article className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-black text-slate-950">
                Hoạt động gần đây
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.title} className="p-5">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${activity.tone}`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-black leading-5 text-slate-950">
                            {activity.title}
                          </p>
                          <span className="shrink-0 text-xs font-bold text-slate-400">
                            {activity.time}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-md border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
            <h3 className="text-lg font-black text-blue-900">
              Gợi ý vận hành
            </h3>
            <p className="mt-2 text-sm leading-6 text-blue-900/70">
              Doanh thu tăng mạnh ở khung 18:00 - 22:00. Nên ưu tiên thêm suất
              cho phim có tỷ lệ lấp đầy trên 85%.
            </p>
            <Link
              href="/admin/revenue"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Xem phân tích doanh thu
              <ArrowRight size={16} />
            </Link>
          </article>
        </aside>
      </section>
    </div>
  );
}

function RevenueOrdersChart() {
  const chart = {
    width: 760,
    height: 300,
    left: 56,
    right: 36,
    top: 24,
    bottom: 52,
    maxRevenue: 220,
    maxOrders: 24,
  };
  const innerWidth = chart.width - chart.left - chart.right;
  const innerHeight = chart.height - chart.top - chart.bottom;
  const baseline = chart.top + innerHeight;
  const step = innerWidth / (monthlyRevenue.length - 1);
  const getX = (index: number) => chart.left + step * index;
  const getRevenueY = (value: number) =>
    baseline - (value / chart.maxRevenue) * innerHeight;
  const getOrderHeight = (value: number) =>
    (value / chart.maxOrders) * innerHeight;
  const linePoints = monthlyRevenue
    .map((item, index) => `${getX(index)},${getRevenueY(item.revenue)}`)
    .join(" ");
  const areaPoints = `${chart.left},${baseline} ${linePoints} ${
    chart.left + innerWidth
  },${baseline}`;
  const monthSix = monthlyRevenue[5];

  return (
    <article className="relative rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">
        Doanh thu &amp; Đơn đặt vé
      </h3>

      <div className="relative mt-5 overflow-hidden">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Biểu đồ doanh thu và đơn đặt vé theo tháng"
          className="h-[300px] w-full"
        >
          <defs>
            <linearGradient id="admin-revenue-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {[0, 55, 110, 165, 220].map((tick) => {
            const y = getRevenueY(tick);

            return (
              <g key={tick}>
                <line
                  x1={chart.left}
                  x2={chart.left + innerWidth}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                />
                <text
                  x={chart.left - 12}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="12"
                  textAnchor="end"
                >
                  {tick === 0 ? "0" : `${tick} tr`}
                </text>
              </g>
            );
          })}

          {[0, 6, 12, 18, 24].map((tick) => {
            const y = baseline - (tick / chart.maxOrders) * innerHeight;

            return (
              <text
                key={tick}
                x={chart.left + innerWidth + 14}
                y={y + 4}
                fill="#64748b"
                fontSize="12"
              >
                {tick}
              </text>
            );
          })}

          <line
            x1={chart.left}
            x2={chart.left}
            y1={chart.top}
            y2={baseline}
            stroke="#94a3b8"
          />
          <line
            x1={chart.left}
            x2={chart.left + innerWidth}
            y1={baseline}
            y2={baseline}
            stroke="#94a3b8"
          />
          <line
            x1={chart.left + innerWidth}
            x2={chart.left + innerWidth}
            y1={chart.top}
            y2={baseline}
            stroke="#94a3b8"
          />

          <polygon points={areaPoints} fill="url(#admin-revenue-area)" />
          <polyline
            points={linePoints}
            fill="none"
            stroke="#2563eb"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {monthlyRevenue.map((item, index) => {
            const barHeight = getOrderHeight(item.orders);
            const x = getX(index) - 9;
            const y = baseline - barHeight;

            return (
              <rect
                key={item.month}
                x={x}
                y={y}
                width="18"
                height={barHeight}
                rx="5"
                fill="#10b981"
              />
            );
          })}

          {monthlyRevenue.map((item, index) => (
            <text
              key={item.month}
              x={getX(index)}
              y={baseline + 24}
              fill="#475569"
              fontSize="13"
              textAnchor="middle"
            >
              {item.month}
            </text>
          ))}

          <circle
            cx={getX(5)}
            cy={getRevenueY(monthSix.revenue)}
            r="5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-sm font-bold">
        <span className="inline-flex items-center gap-2 text-blue-600">
          <span className="h-0.5 w-5 rounded-full bg-blue-600" />
          Doanh thu
        </span>
        <span className="inline-flex items-center gap-2 text-emerald-600">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          Đơn đặt vé
        </span>
      </div>
    </article>
  );
}

function OrderStatusChart() {
  const total = statusDistribution.reduce((sum, item) => sum + item.value, 0);
  const conicGradient = buildConicGradient(statusDistribution);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">
        Tỷ lệ trạng thái đơn
      </h3>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(180px,0.8fr)_1fr] lg:items-center xl:grid-cols-1 2xl:grid-cols-[minmax(180px,0.8fr)_1fr]">
        <div className="flex justify-center">
          <div
            className="relative h-48 w-48 rounded-full"
            style={{ background: conicGradient }}
          >
            <div className="absolute inset-8 rounded-full bg-white" />
          </div>
        </div>

        <div className="grid gap-2">
          {statusDistribution.map((status) => {
            const percent = total > 0 ? (status.value / total) * 100 : 0;

            return (
              <div
                key={status.label}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5"
              >
                <p className="flex min-w-0 items-center gap-2 text-sm font-bold text-slate-700">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${status.dotClass}`}
                  />
                  <span className="truncate">{status.label}</span>
                </p>
                <p className="text-sm font-black text-slate-950">
                  {status.value} ({percent.toFixed(1)}%)
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
