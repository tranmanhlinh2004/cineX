"use client";

import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Undo2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  approveAdminRefundRequest,
  getAdminRefundRequests,
  rejectAdminRefundRequest,
  type AdminRefundRequest,
  type AdminRefundStats,
  type AdminRefundStatusCode,
} from "@/lib/admin-refunds-api";

type Notice = {
  type: "success" | "error";
  text: string;
};

const statusFilterOptions: { value: "ALL" | AdminRefundStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

const emptyStats: AdminRefundStats = {
  totalRequests: 0,
  pendingRequests: 0,
  approvedRequests: 0,
  rejectedRequests: 0,
  overdueRequests: 0,
  approvedAmount: 0,
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function AdminRefundApprovalsPageClient() {
  const [refundRequests, setRefundRequests] = useState<AdminRefundRequest[]>([]);
  const [stats, setStats] = useState<AdminRefundStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminRefundStatusCode>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<AdminRefundRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadRefundRequests = async (options: { silent?: boolean } = {}) => {
    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setNotice(null);

    try {
      const data = await getAdminRefundRequests();

      setRefundRequests(data.refundRequests);
      setStats(data.stats);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách yêu cầu hoàn tiền.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRefundRequests();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return refundRequests.filter((refundRequest) => {
      const matchesStatus =
        statusFilter === "ALL" || refundRequest.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          refundRequest.refundCode,
          refundRequest.ticketCode,
          refundRequest.bookingCode,
          refundRequest.customer.fullName,
          refundRequest.customer.email,
          refundRequest.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, refundRequests, statusFilter]);

  const replaceRefundRequest = (updatedRequest: AdminRefundRequest) => {
    setRefundRequests((current) =>
      current.map((item) => (item.id === updatedRequest.id ? updatedRequest : item)),
    );
    setSelectedRequest((current) =>
      current?.id === updatedRequest.id ? updatedRequest : current,
    );
  };

  const handleReview = async (
    refundRequest: AdminRefundRequest,
    decision: "approve" | "reject",
  ) => {
    const reviewerNote =
      decision === "reject"
        ? window.prompt("Nhập lý do từ chối hoàn tiền", "Không đủ điều kiện hoàn tiền.") ?? ""
        : "";

    if (decision === "reject" && !reviewerNote.trim()) {
      return;
    }

    setActionId(refundRequest.id);
    setNotice(null);

    try {
      const result =
        decision === "approve"
          ? await approveAdminRefundRequest(refundRequest.id)
          : await rejectAdminRefundRequest(refundRequest.id, reviewerNote.trim());

      if (result.refundRequest) {
        replaceRefundRequest(result.refundRequest);
      }

      setNotice({ type: "success", text: result.message });
      await loadRefundRequests({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật yêu cầu hoàn tiền.",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            Quản lý thanh toán
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Phê duyệt hoàn tiền
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi và xử lý các yêu cầu hủy vé, hoàn tiền từ khách hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRefundRequests({ silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Chờ duyệt"
          value={stats.pendingRequests.toString()}
          helper="Yêu cầu cần xử lý"
          icon={<Undo2 size={21} />}
          tone="warning"
        />
        <StatBox
          label="Đã duyệt"
          value={stats.approvedRequests.toString()}
          helper={formatMoney(stats.approvedAmount)}
          icon={<CheckCircle2 size={21} />}
          tone="success"
        />
        <StatBox
          label="Từ chối"
          value={stats.rejectedRequests.toString()}
          helper="Yêu cầu không hợp lệ"
          icon={<XCircle size={21} />}
          tone="danger"
        />
        <StatBox
          label="Tổng yêu cầu"
          value={stats.totalRequests.toString()}
          helper={`${stats.overdueRequests} yêu cầu quá 24 giờ`}
          icon={<Banknote size={21} />}
        />
      </section>

      {notice ? <NoticeBox notice={notice} /> : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã hoàn tiền, mã vé, khách hàng..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | AdminRefundStatusCode)
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
              Danh sách yêu cầu hoàn tiền
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredRequests.length} yêu cầu đang hiển thị
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Mã hoàn tiền</TableHead>
                <TableHead>Mã vé</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Thời gian đặt</TableHead>
                <TableHead>Thời gian yêu cầu hủy</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead align="center">Thao tác</TableHead>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Đang tải yêu cầu hoàn tiền...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    Chưa có yêu cầu hoàn tiền phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((refundRequest) => {
                  const isPending = refundRequest.status === "PENDING";
                  const isActing = actionId === refundRequest.id;

                  return (
                    <tr
                      key={refundRequest.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <TableCell strong>{refundRequest.refundCode}</TableCell>
                      <TableCell>{refundRequest.ticketCode}</TableCell>
                      <TableCell>
                        <div className="grid gap-0.5">
                          <span className="font-black text-slate-900">
                            {refundRequest.customer.fullName}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {refundRequest.customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(refundRequest.bookedAt)}</TableCell>
                      <TableCell>{formatDateTime(refundRequest.requestedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={refundRequest.status} label={refundRequest.statusLabel} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            label={`Xem chi tiết ${refundRequest.refundCode}`}
                            tone="neutral"
                            onClick={() => setSelectedRequest(refundRequest)}
                          >
                            <Eye size={16} />
                          </IconButton>
                          <IconButton
                            label={`Phê duyệt ${refundRequest.refundCode}`}
                            tone="success"
                            disabled={!isPending || isActing}
                            onClick={() => void handleReview(refundRequest, "approve")}
                          >
                            {isActing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </IconButton>
                          <IconButton
                            label={`Từ chối ${refundRequest.refundCode}`}
                            tone="danger"
                            disabled={!isPending || isActing}
                            onClick={() => void handleReview(refundRequest, "reject")}
                          >
                            <XCircle size={16} />
                          </IconButton>
                        </div>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRequest ? (
        <RefundDetailModal
          refundRequest={selectedRequest}
          actionId={actionId}
          onClose={() => setSelectedRequest(null)}
          onReview={handleReview}
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
  icon: React.ReactNode;
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

function NoticeBox({ notice }: { notice: Notice }) {
  const isSuccess = notice.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-bold ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{notice.text}</span>
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
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
  children: React.ReactNode;
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
  status: AdminRefundStatusCode;
  label: string;
}) {
  const className =
    status === "APPROVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "REJECTED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${className}`}>
      {label}
    </span>
  );
}

function IconButton({
  label,
  tone,
  disabled,
  onClick,
  children,
}: {
  label: string;
  tone: "neutral" | "success" | "danger";
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const className =
    tone === "success"
      ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      : tone === "danger"
        ? "border-red-500 text-red-600 hover:bg-red-50"
        : "border-slate-400 text-slate-600 hover:bg-slate-50";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 ${className}`}
    >
      {children}
    </button>
  );
}

function RefundDetailModal({
  refundRequest,
  actionId,
  onClose,
  onReview,
}: {
  refundRequest: AdminRefundRequest;
  actionId: number | null;
  onClose: () => void;
  onReview: (refundRequest: AdminRefundRequest, decision: "approve" | "reject") => Promise<void>;
}) {
  const isPending = refundRequest.status === "PENDING";
  const isActing = actionId === refundRequest.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-red-600">
              {refundRequest.refundCode}
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              Chi tiết yêu cầu hoàn tiền
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
          <DetailLine label="Mã vé" value={refundRequest.ticketCode} />
          <DetailLine label="Mã đặt vé" value={refundRequest.bookingCode} />
          <DetailLine label="Khách hàng" value={refundRequest.customer.fullName} />
          <DetailLine label="Email" value={refundRequest.customer.email} />
          <DetailLine label="Phim" value={refundRequest.movieTitle} />
          <DetailLine label="Ghế" value={refundRequest.seats.label || "Chưa có ghế"} />
          <DetailLine label="Rạp" value={refundRequest.room?.cinemaName ?? "Chưa xác định"} />
          <DetailLine label="Suất chiếu" value={refundRequest.showtime ? `${refundRequest.showtime.date} ${refundRequest.showtime.time}` : "Chưa xác định"} />
          <DetailLine label="Số tiền hoàn" value={refundRequest.amountLabel} />
          <DetailLine label="Trạng thái" value={refundRequest.statusLabel} />
          <DetailLine label="Thời gian đặt" value={formatDateTime(refundRequest.bookedAt)} />
          <DetailLine label="Thời gian yêu cầu hủy" value={formatDateTime(refundRequest.requestedAt)} />
          <div className="sm:col-span-2">
            <DetailLine label="Lý do hoàn tiền" value={refundRequest.reason} />
          </div>
          {refundRequest.reviewerNote ? (
            <div className="sm:col-span-2">
              <DetailLine label="Ghi chú xử lý" value={refundRequest.reviewerNote} />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!isPending || isActing}
            onClick={() => void onReview(refundRequest, "reject")}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-500 px-4 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            <XCircle size={17} />
            Từ chối
          </button>
          <button
            type="button"
            disabled={!isPending || isActing}
            onClick={() => void onReview(refundRequest, "approve")}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isActing ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
            Phê duyệt
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

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
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
