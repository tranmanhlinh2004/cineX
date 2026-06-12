import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CreditCard,
  Download,
  Filter,
  Landmark,
  ReceiptText,
  Ticket,
  Wallet,
} from "lucide-react";

const revenueStats = [
  {
    label: "Doanh thu thuần",
    value: "1,84 tỷ",
    helper: "+12,4% so với tuần trước",
    icon: Banknote,
    tone: "border-emerald-100 bg-emerald-50 text-emerald-700",
    positive: true,
  },
  {
    label: "Vé đã thanh toán",
    value: "12.480",
    helper: "+1.246 vé trong 7 ngày",
    icon: Ticket,
    tone: "border-red-100 bg-red-50 text-red-700",
    positive: true,
  },
  {
    label: "Giá trị đơn TB",
    value: "147.000đ",
    helper: "+8.500đ mỗi đơn",
    icon: ReceiptText,
    tone: "border-sky-100 bg-sky-50 text-sky-700",
    positive: true,
  },
  {
    label: "Hoàn vé",
    value: "18,6 tr",
    helper: "-3,2% so với kỳ trước",
    icon: Wallet,
    tone: "border-amber-100 bg-amber-50 text-amber-700",
    positive: false,
  },
];

const revenueByDay = [
  { day: "Thứ 2", value: 62, amount: "214 tr" },
  { day: "Thứ 3", value: 54, amount: "188 tr" },
  { day: "Thứ 4", value: 71, amount: "246 tr" },
  { day: "Thứ 5", value: 68, amount: "231 tr" },
  { day: "Thứ 6", value: 82, amount: "284 tr" },
  { day: "Thứ 7", value: 100, amount: "356 tr" },
  { day: "CN", value: 94, amount: "327 tr" },
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

type StatusDistributionItem = {
  label: string;
  value: number;
  color: string;
  dotClass: string;
};

const statusDistribution: StatusDistributionItem[] = [
  { label: "Hoàn thành", value: 0, color: "#2563eb", dotClass: "bg-blue-600" },
  { label: "Đã xác nhận", value: 6, color: "#22c55e", dotClass: "bg-emerald-500" },
  { label: "Đang xử lý", value: 0, color: "#f97316", dotClass: "bg-orange-500" },
  { label: "Đã hủy", value: 26, color: "#ef4444", dotClass: "bg-red-500" },
  { label: "Chờ hủy", value: 1, color: "#f97316", dotClass: "bg-orange-500" },
];

const branchRevenue = [
  {
    name: "CineX Vinh Center",
    revenue: "792,4 tr",
    tickets: "5.218 vé",
    percent: 43,
    change: "+14%",
  },
  {
    name: "CineX Lê Lợi",
    revenue: "548,8 tr",
    tickets: "3.822 vé",
    percent: 30,
    change: "+9%",
  },
  {
    name: "CineX Quang Trung",
    revenue: "496,6 tr",
    tickets: "3.440 vé",
    percent: 27,
    change: "+6%",
  },
];

const paymentChannels = [
  { label: "Ví điện tử", value: "682,5 tr", percent: 37, icon: Wallet },
  { label: "Thẻ ngân hàng", value: "571,2 tr", percent: 31, icon: CreditCard },
  { label: "Quầy vé", value: "438,9 tr", percent: 24, icon: Banknote },
  { label: "Chuyển khoản", value: "146,4 tr", percent: 8, icon: Landmark },
];

const topMovies = [
  ["Dune: Part Two", "428,6 tr", "2.946 vé", "23%"],
  ["Inside Out 2", "316,2 tr", "2.318 vé", "17%"],
  ["Deadpool & Wolverine", "284,8 tr", "1.984 vé", "15%"],
  ["A Quiet Place: Day One", "206,5 tr", "1.472 vé", "11%"],
];

const transactions = [
  {
    code: "CX240612-8842",
    customer: "Nguyễn Hoàng Minh",
    cinema: "CineX Vinh Center",
    channel: "Ví điện tử",
    amount: "420.000đ",
    time: "10:42",
    status: "Đã thanh toán",
  },
  {
    code: "CX240612-8841",
    customer: "Trần Bảo Ngọc",
    cinema: "CineX Lê Lợi",
    channel: "Thẻ ngân hàng",
    amount: "310.000đ",
    time: "10:38",
    status: "Đã thanh toán",
  },
  {
    code: "CX240612-8839",
    customer: "Lê Đức Anh",
    cinema: "CineX Quang Trung",
    channel: "Quầy vé",
    amount: "180.000đ",
    time: "10:21",
    status: "Đã thanh toán",
  },
  {
    code: "CX240612-8836",
    customer: "Phạm Thu Hà",
    cinema: "CineX Vinh Center",
    channel: "Ví điện tử",
    amount: "260.000đ",
    time: "10:08",
    status: "Chờ đối soát",
  },
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

export default function AdminRevenuePage() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
              3.4.9
            </span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
              01/06 - 07/06/2026
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Dashboard doanh thu
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi doanh thu bán vé, kênh thanh toán, hiệu quả từng cụm rạp
            và các giao dịch cần đối soát.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <CalendarDays size={17} />
            7 ngày gần nhất
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Filter size={17} />
            Lọc dữ liệu
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
          >
            <Download size={17} />
            Xuất báo cáo
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {revenueStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.positive ? ArrowUpRight : ArrowDownRight;

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
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${stat.tone}`}
                >
                  <Icon size={21} />
                </span>
              </div>
              <p
                className={`mt-4 flex items-center gap-1 text-sm font-bold ${
                  stat.positive ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                <TrendIcon size={15} />
                {stat.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)]">
        <MonthlyRevenueChart />
        <OrderStatusChart />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <div className="grid gap-5">
          <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Doanh thu theo ngày
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Đơn vị triệu đồng, đã trừ hoàn vé và mã giảm giá.
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                Đỉnh: 356 tr
              </span>
            </div>

            <div className="mt-6 grid h-72 grid-cols-7 items-end gap-3">
              {revenueByDay.map((item) => (
                <div key={item.day} className="grid h-full items-end gap-3">
                  <div className="flex h-full items-end rounded-md bg-slate-50 px-2 pt-3">
                    <div
                      className="w-full rounded-t-md bg-red-600"
                      style={{ height: `${item.value}%` }}
                      title={`${item.day}: ${item.amount}`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-950">
                      {item.amount}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      {item.day}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Giao dịch gần đây
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Danh sách giao dịch mới nhất từ online và quầy vé.
                </p>
              </div>
              <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                4 giao dịch mới
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-black">Mã đơn</th>
                    <th className="px-5 py-3 font-black">Khách hàng</th>
                    <th className="px-5 py-3 font-black">Cụm rạp</th>
                    <th className="px-5 py-3 font-black">Kênh</th>
                    <th className="px-5 py-3 font-black">Giá trị</th>
                    <th className="px-5 py-3 font-black">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.code}>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950">
                          {transaction.code}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-400">
                          {transaction.time}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {transaction.customer}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {transaction.cinema}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {transaction.channel}
                      </td>
                      <td className="px-5 py-4 font-black text-slate-950">
                        {transaction.amount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md px-2.5 py-1.5 text-xs font-black ${
                            transaction.status === "Đã thanh toán"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="grid content-start gap-5">
          <article className="rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-black text-slate-950">
                Doanh thu theo cụm rạp
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Tỷ trọng trên tổng doanh thu kỳ này.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {branchRevenue.map((branch) => (
                <div key={branch.name} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{branch.name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {branch.tickets}
                      </p>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      {branch.change}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${branch.percent}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm font-black text-slate-950">
                      {branch.revenue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">
              Kênh thanh toán
            </h3>
            <div className="mt-4 grid gap-3">
              {paymentChannels.map((channel) => {
                const Icon = channel.icon;

                return (
                  <div
                    key={channel.label}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 font-black text-slate-950">
                        <Icon size={17} className="shrink-0 text-red-600" />
                        <span className="truncate">{channel.label}</span>
                      </p>
                      <span className="text-sm font-black text-slate-600">
                        {channel.percent}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-slate-950"
                        style={{ width: `${channel.percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {channel.value}
                    </p>
                  </div>
                );
              })}
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
        </aside>
      </section>
    </div>
  );
}

function MonthlyRevenueChart() {
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-950">
            Doanh thu &amp; Đơn đặt vé
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Tổng hợp doanh thu và số đơn đặt vé theo từng tháng.
          </p>
        </div>
        <span className="w-fit rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
          Năm 2026
        </span>
      </div>

      <div className="relative mt-5 overflow-hidden">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          aria-label="Biểu đồ doanh thu và đơn đặt vé theo tháng"
          className="h-[300px] w-full"
        >
          <defs>
            <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
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

          <polygon points={areaPoints} fill="url(#revenue-area)" />
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
