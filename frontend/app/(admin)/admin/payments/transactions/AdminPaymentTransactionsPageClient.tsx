"use client";

import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getAdminPaymentTransactions,
  type AdminPaymentMethodCode,
  type AdminPaymentStats,
  type AdminPaymentStatusCode,
  type AdminPaymentTransaction,
} from "@/lib/admin-payments-api";
import { showToast } from "@/lib/toast";

const emptyStats: AdminPaymentStats = {
  totalTransactions: 0,
  successfulTransactions: 0,
  pendingTransactions: 0,
  failedTransactions: 0,
  refundedTransactions: 0,
  onlineTransactions: 0,
  successfulRevenue: 0,
};

const statusFilterOptions: { value: "ALL" | AdminPaymentStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SUCCESS", label: "Đã thanh toán" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const methodFilterOptions: { value: "ALL" | AdminPaymentMethodCode; label: string }[] = [
  { value: "ALL", label: "Tất cả kênh" },
  { value: "CASH", label: "Quầy vé" },
  { value: "MOMO", label: "MoMo" },
  { value: "VNPAY", label: "VNPay" },
  { value: "ZALOPAY", label: "ZaloPay" },
  { value: "BANKING", label: "Chuyển khoản" },
  { value: "CARD", label: "Thẻ ngân hàng" },
];

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function AdminPaymentTransactionsPageClient() {
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [stats, setStats] = useState<AdminPaymentStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminPaymentStatusCode>("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | AdminPaymentMethodCode>("ALL");
  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminPaymentTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = async (options: { silent?: boolean } = {}) => {
    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await getAdminPaymentTransactions();

      setTransactions(data.transactions);
      setStats(data.stats);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể tải danh sách giao dịch.",
        "error",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return transactions.filter((transaction) => {
      const matchesStatus =
        statusFilter === "ALL" || transaction.status === statusFilter;
      const matchesMethod =
        methodFilter === "ALL" || transaction.method === methodFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          [
            transaction.transactionCode,
            transaction.bookingCode,
            transaction.customer.fullName,
            transaction.customer.email,
            transaction.customer.phone ?? "",
            transaction.methodLabel,
            transaction.statusLabel,
            transaction.movieTitle,
            transaction.room?.cinemaName ?? "",
            transaction.seats.label,
          ].join(" "),
        ).includes(normalizedQuery);

      return matchesStatus && matchesMethod && matchesQuery;
    });
  }, [methodFilter, query, statusFilter, transactions]);

  const successRate =
    stats.totalTransactions > 0
      ? Math.round((stats.successfulTransactions / stats.totalTransactions) * 100)
      : 0;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            Quản lý thanh toán
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Lịch sử giao dịch
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi các giao dịch thanh toán lấy trực tiếp từ bảng payments và
            thông tin đặt vé liên quan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTransactions({ silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Giao dịch"
          value={stats.totalTransactions.toString()}
          helper="Tổng số bản ghi trong database"
          icon={<CreditCard size={21} />}
        />
        <StatBox
          label="Thành công"
          value={stats.successfulTransactions.toString()}
          helper={`${successRate}% giao dịch`}
          icon={<CheckCircle2 size={21} />}
          tone="success"
        />
        <StatBox
          label="Doanh thu"
          value={formatMoney(stats.successfulRevenue)}
          helper="Từ giao dịch đã thanh toán"
          icon={<CircleDollarSign size={21} />}
          tone="danger"
        />
        <StatBox
          label="Chờ xử lý"
          value={stats.pendingTransactions.toString()}
          helper={`${stats.onlineTransactions} giao dịch online`}
          icon={<ClipboardCheck size={21} />}
          tone="warning"
        />
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã giao dịch, mã đặt vé, khách hàng..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(event.target.value as "ALL" | AdminPaymentMethodCode)
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            {methodFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | AdminPaymentStatusCode)
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Danh sách giao dịch
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredTransactions.length} giao dịch đang hiển thị
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Mã giao dịch</TableHead>
                <TableHead>Mã đặt vé</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Thời điểm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead align="center">Thao tác</TableHead>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Đang tải giao dịch từ database...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Chưa có giao dịch phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <TableCell strong>{transaction.transactionCode}</TableCell>
                    <TableCell>{transaction.bookingCode}</TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="font-black text-slate-900">
                          {transaction.customer.fullName}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {transaction.customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.methodLabel}</TableCell>
                    <TableCell>{transaction.amountLabel}</TableCell>
                    <TableCell>{formatDateTime(transaction.displayAt)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={transaction.status}
                        label={transaction.statusLabel}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <IconButton
                          label={`Xem giao dịch ${transaction.transactionCode}`}
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTransaction ? (
        <PaymentDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      ) : null}
    </div>
  );
}

function StatBox({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : tone === "danger"
          ? "bg-red-50 text-red-700"
          : "bg-blue-50 text-blue-700";

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{helper}</p>
    </article>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th className={`px-4 py-4 font-black ${align === "center" ? "text-center" : ""}`}>
      {children}
    </th>
  );
}

function TableCell({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <td className={`px-4 py-4 text-sm ${strong ? "font-black text-slate-950" : "font-semibold text-slate-600"}`}>
      {children}
    </td>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: AdminPaymentStatusCode;
  label: string;
}) {
  const className =
    status === "SUCCESS"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "FAILED"
        ? "border-red-200 bg-red-50 text-red-700"
        : status === "REFUNDED"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${className}`}>
      {label}
    </span>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 text-slate-600 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function PaymentDetailModal({
  transaction,
  onClose,
}: {
  transaction: AdminPaymentTransaction;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-red-600">
              {transaction.transactionCode}
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              Chi tiết giao dịch
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <DetailLine label="Mã giao dịch" value={transaction.transactionCode} />
          <DetailLine label="Mã đặt vé" value={transaction.bookingCode} />
          <DetailLine label="Khách hàng" value={transaction.customer.fullName} />
          <DetailLine label="Email" value={transaction.customer.email} />
          <DetailLine
            label="Số điện thoại"
            value={transaction.customer.phone ?? "Chưa cập nhật"}
          />
          <DetailLine label="Kênh thanh toán" value={transaction.methodLabel} />
          <DetailLine label="Số tiền" value={transaction.amountLabel} />
          <DetailLine label="Trạng thái" value={transaction.statusLabel} />
          <DetailLine label="Phim" value={transaction.movieTitle} />
          <DetailLine
            label="Suất chiếu"
            value={
              transaction.showtime
                ? `${transaction.showtime.date} ${transaction.showtime.time}`
                : "Chưa xác định"
            }
          />
          <DetailLine
            label="Rạp"
            value={transaction.room?.cinemaName ?? "Chưa xác định"}
          />
          <DetailLine label="Phòng" value={transaction.room?.name ?? "Chưa xác định"} />
          <DetailLine
            label="Ghế"
            value={transaction.seats.label || "Chưa có ghế"}
          />
          <DetailLine
            label="Mã vé"
            value={
              transaction.tickets.map((ticket) => ticket.ticketCode).join(", ") ||
              "Chưa phát hành"
            }
          />
          <DetailLine
            label="Thời điểm tạo"
            value={formatDateTime(transaction.createdAt)}
          />
          <DetailLine
            label="Thời điểm thanh toán"
            value={formatDateTime(transaction.paidAt)}
          />
          {transaction.paymentUrl ? (
            <div className="sm:col-span-2">
              <DetailLine label="Payment URL" value={transaction.paymentUrl} />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa ghi nhận";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Chưa ghi nhận";
  }

  return dateTimeFormatter.format(date).replace(",", "");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, "");
}
