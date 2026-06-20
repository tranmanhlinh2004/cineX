"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Star,
  XCircle,
} from "lucide-react";
import { PermissionButton } from "@/components/admin/PermissionControls";
import {
  getAdminMovieReviews,
  hideAdminMovieReview,
  sendAdminMovieReviewReply,
  showAdminMovieReview,
  type AdminMovieReview,
  type AdminMovieReviewStats,
  type AdminMovieReviewStatusCode,
} from "@/lib/admin-reviews-api";
import { showToast } from "@/lib/toast";

const emptyStats: AdminMovieReviewStats = {
  totalReviews: 0,
  totalReplies: 0,
  visibleReviews: 0,
  hiddenReviews: 0,
  pendingReviews: 0,
  averageRating: 0,
  averageRatingLabel: "0.0/5",
};

const statusFilterOptions: { value: "ALL" | AdminMovieReviewStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "VISIBLE", label: "Hiển thị" },
  { value: "HIDDEN", label: "Đã ẩn" },
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

export default function AdminMovieReviewsPageClient() {
  const [reviews, setReviews] = useState<AdminMovieReview[]>([]);
  const [stats, setStats] = useState<AdminMovieReviewStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | AdminMovieReviewStatusCode>("ALL");
  const [selectedReview, setSelectedReview] = useState<AdminMovieReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async (options: { silent?: boolean } = {}) => {
    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      const data = await getAdminMovieReviews();

      setReviews(data.reviews);
      setStats(data.stats);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu đánh giá từ database.";

      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviews();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return reviews.filter((review) => {
      const matchesStatus =
        statusFilter === "ALL" || review.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          [
            review.movieTitle,
            review.customerName,
            review.customer.email,
            review.ratingLabel,
            review.content,
            review.replies.map((reply) => `${reply.userName} ${reply.content}`).join(" "),
          ].join(" "),
        ).includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, reviews, statusFilter]);

  const replaceReview = (nextReview: AdminMovieReview) => {
    setReviews((current) =>
      current.map((review) =>
        review.id === nextReview.id ? nextReview : review,
      ),
    );
    setSelectedReview((current) =>
      current?.id === nextReview.id ? nextReview : current,
    );
  };

  const handleToggleVisibility = async (review: AdminMovieReview) => {
    setActionId(review.id);

    try {
      const result = review.isHidden
        ? await showAdminMovieReview(review.id)
        : await hideAdminMovieReview(review.id);

      replaceReview(result.review);
      showToast(result.message, "success");
      await loadReviews({ silent: true });
    } catch (toggleError) {
      showToast(
        toggleError instanceof Error
          ? toggleError.message
          : "Không thể cập nhật trạng thái đánh giá.",
        "error",
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReply = async (review: AdminMovieReview, content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    if (trimmedContent.length > 1000) {
      showToast("Nội dung trả lời không được vượt quá 1000 ký tự.", "error");
      return;
    }

    setReplyingReviewId(review.id);

    try {
      const result = await sendAdminMovieReviewReply(review.id, trimmedContent);

      replaceReview(result.review);
      showToast(result.message, "success");
      await loadReviews({ silent: true });
    } catch (replyError) {
      showToast(
        replyError instanceof Error
          ? replyError.message
          : "Không thể gửi trả lời bình luận.",
        "error",
      );
    } finally {
      setReplyingReviewId(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            Quản lý đánh giá
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Quản lý đánh giá phim
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi bình luận, điểm sao và trạng thái hiển thị lấy trực tiếp từ bảng reviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReviews({ silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Tổng đánh giá"
          value={stats.totalReviews.toString()}
          helper={`${stats.totalReplies} phản hồi trong database`}
          icon={<MessageSquare size={21} />}
        />
        <StatBox
          label="Điểm trung bình"
          value={stats.averageRatingLabel}
          helper="Tính trên thang 5 sao"
          icon={<Star size={21} />}
          tone="warning"
        />
        <StatBox
          label="Hiển thị"
          value={stats.visibleReviews.toString()}
          helper="Đang hiển thị trên website"
          icon={<CheckCircle2 size={21} />}
          tone="success"
        />
        <StatBox
          label="Đã ẩn"
          value={stats.hiddenReviews.toString()}
          helper={`${stats.pendingReviews} đánh giá chờ xử lý`}
          icon={<EyeOff size={21} />}
          tone="danger"
        />
      </section>

      {error ? <NoticeBox text={error} /> : null}

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
              placeholder="Tìm theo phim, khách hàng, email, nội dung..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | AdminMovieReviewStatusCode)
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
              Danh sách đánh giá phim
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredReviews.length} đánh giá đang hiển thị
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Phim</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead align="right">Thao tác</TableHead>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Đang tải đánh giá từ database...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    Chưa có đánh giá phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const isActing = actionId === review.id;

                  return (
                    <tr key={review.id} className="border-b border-slate-100 align-top transition hover:bg-slate-50">
                      <TableCell strong>
                        <div className="grid gap-1">
                          <span>{review.movieTitle}</span>
                          <span className="text-xs font-semibold text-slate-400">
                            ID: {review.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid gap-0.5">
                          <span className="font-black text-slate-900">
                            {review.customerName}
                          </span>
                          <span className="break-all text-xs font-semibold text-slate-500">
                            {review.customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm font-black text-slate-950">
                          <Star size={16} className="fill-amber-300 text-amber-400" />
                          {review.ratingLabel}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[420px] text-sm font-medium leading-6 text-slate-700">
                          {review.content || "Khách hàng chỉ chấm điểm, chưa nhập bình luận."}
                        </p>
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {review.replyCount > 0
                            ? `${review.replyCount} phản hồi`
                            : "Chưa có phản hồi"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={review.status} label={review.statusLabel} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-start gap-2 whitespace-nowrap">
                          <Calendar size={16} className="mt-0.5 text-slate-500" />
                          {formatDateTime(review.createdAt)}
                        </span>
                      </TableCell>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <PermissionButton
                            type="button"
                            permissionRule={{ permission: "review.reply" }}
                            onClick={() => setSelectedReview(review)}
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-500 px-3 text-xs font-black text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                          >
                            <MessageSquare size={14} />
                            Trả lời
                          </PermissionButton>
                          <PermissionButton
                            type="button"
                            permissionRule={{ permission: "review.manage" }}
                            disabled={isActing}
                            onClick={() => void handleToggleVisibility(review)}
                            className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 ${
                              review.isHidden
                                ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                : "border-red-500 text-red-600 hover:bg-red-50"
                            }`}
                          >
                            {isActing ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : review.isHidden ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                            {review.isHidden ? "Hiện" : "Ẩn"}
                          </PermissionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedReview ? (
        <ReviewReplyModal
          review={selectedReview}
          isSending={replyingReviewId === selectedReview.id}
          onClose={() => setSelectedReview(null)}
          onReply={handleReply}
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

function NoticeBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
      <AlertCircle size={17} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-4 font-black ${align === "right" ? "text-right" : ""}`}>
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
  status: AdminMovieReviewStatusCode;
  label: string;
}) {
  const className =
    status === "VISIBLE"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${className}`}>
      {label}
    </span>
  );
}

function ReviewReplyModal({
  review,
  isSending,
  onClose,
  onReply,
}: {
  review: AdminMovieReview;
  isSending: boolean;
  onClose: () => void;
  onReply: (review: AdminMovieReview, content: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !isSending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    void onReply(review, draft).then(() => setDraft(""));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="flex max-h-[calc(100vh-48px)] w-full max-w-3xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black text-slate-950">
              {review.movieTitle}
            </h3>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {review.customerName} · {review.ratingLabel} · {review.statusLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hội thoại"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 py-5">
          <div className="grid gap-4">
            <div className="max-w-[86%] rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-950">
                  {review.customerName}
                </p>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700">
                  <Star size={12} className="fill-amber-300 text-amber-400" />
                  {review.ratingLabel}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {review.content || "Khách hàng chỉ chấm điểm, chưa nhập bình luận."}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {formatDateTime(review.createdAt)}
              </p>
            </div>

            {review.replies.length > 0 ? (
              review.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`max-w-[86%] rounded-md px-4 py-3 shadow-sm ${
                    reply.isAdminReply
                      ? "ml-auto bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black">{reply.userName}</p>
                    {reply.isAdminReply ? (
                      <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                        Quản trị
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6">
                    {reply.content}
                  </p>
                  <p className={`mt-2 text-xs font-semibold ${reply.isAdminReply ? "text-blue-100" : "text-slate-400"}`}>
                    {formatDateTime(reply.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm font-bold text-slate-500">
                Chưa có phản hồi cho bình luận này.
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4"
        >
          <textarea
            value={draft}
            maxLength={1000}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nhập trả lời..."
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-400">
              {draft.length}/1000
            </p>
            <PermissionButton
              type="submit"
              permissionRule={{ permission: "review.reply" }}
              disabled={!canSend}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Gửi trả lời
            </PermissionButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value)).replace(",", "");
}
