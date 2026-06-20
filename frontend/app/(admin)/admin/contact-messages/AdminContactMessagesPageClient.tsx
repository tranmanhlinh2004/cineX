"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { PermissionButton } from "@/components/admin/PermissionControls";
import {
  getAdminContactMessages,
  sendAdminContactMessageReply,
  type AdminContactMessage,
  type AdminContactMessageStats,
  type AdminContactMessageStatusCode,
} from "@/lib/admin-contact-messages-api";
import { showToast } from "@/lib/toast";

const emptyStats: AdminContactMessageStats = {
  totalMessages: 0,
  pendingMessages: 0,
  repliedMessages: 0,
};

const statusFilterOptions: { value: "ALL" | AdminContactMessageStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ phản hồi" },
  { value: "REPLIED", label: "Đã phản hồi" },
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

export default function AdminContactMessagesPageClient() {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [stats, setStats] = useState<AdminContactMessageStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | AdminContactMessageStatusCode>("ALL");
  const [selectedMessage, setSelectedMessage] =
    useState<AdminContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [replyingMessageId, setReplyingMessageId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async (options: { silent?: boolean } = {}) => {
    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError("");

    try {
      const data = await getAdminContactMessages();

      setMessages(data.messages);
      setStats(data.stats);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải tin nhắn liên hệ từ database.";

      setError(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return messages.filter((message) => {
      const matchesStatus =
        statusFilter === "ALL" || message.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          [
            message.code,
            message.customerName,
            message.email,
            message.phone ?? "",
            message.subject,
            message.content,
            message.channel,
          ].join(" "),
        ).includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [messages, query, statusFilter]);

  const replaceMessage = (nextMessage: AdminContactMessage) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === nextMessage.id ? nextMessage : message,
      ),
    );
    setSelectedMessage((current) =>
      current?.id === nextMessage.id ? nextMessage : current,
    );
  };

  const handleReply = async (message: AdminContactMessage, content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    setReplyingMessageId(message.id);

    try {
      const result = await sendAdminContactMessageReply(message.id, trimmedContent);

      replaceMessage(result.contactMessage);
      showToast(result.message, "success");
      await loadMessages({ silent: true });
    } catch (replyError) {
      showToast(
        replyError instanceof Error
          ? replyError.message
          : "Không thể gửi phản hồi cho khách hàng.",
        "error",
      );
    } finally {
      setReplyingMessageId(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            Hỗ trợ khách hàng
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Tin nhắn liên hệ
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo dõi thông tin khách hàng, thời gian liên hệ, nội dung liên hệ và trạng thái phản hồi từ database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMessages({ silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatBox
          label="Tổng tin nhắn"
          value={stats.totalMessages.toString()}
          helper="Tất cả liên hệ của khách hàng"
          icon={<MessageSquare size={21} />}
        />
        <StatBox
          label="Chờ phản hồi"
          value={stats.pendingMessages.toString()}
          helper="Tin nhắn cần xử lý"
          icon={<Clock3 size={21} />}
          tone="warning"
        />
        <StatBox
          label="Đã phản hồi"
          value={stats.repliedMessages.toString()}
          helper="Tin nhắn đã có phản hồi admin"
          icon={<CheckCircle2 size={21} />}
          tone="success"
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
              placeholder="Tìm theo tên, email, số điện thoại, nội dung..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | AdminContactMessageStatusCode)
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
              Danh sách tin nhắn liên hệ
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredMessages.length} tin nhắn đang hiển thị
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead align="right">Thao tác</TableHead>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Đang tải tin nhắn liên hệ từ database...
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-bold text-slate-500">
                    Chưa có tin nhắn liên hệ phù hợp.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="border-b border-slate-100 align-top transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <Avatar initials={getInitials(message.customerName)} />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950">
                            {message.customerName}
                          </p>
                          <ContactLine icon={<Mail size={14} />} tone="blue">
                            {message.email}
                          </ContactLine>
                          <ContactLine icon={<Phone size={14} />} tone="green">
                            {message.phone || "Chưa có số điện thoại"}
                          </ContactLine>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-slate-950">
                        {message.subject}
                      </p>
                      <p className="mt-1 max-w-[520px] text-sm font-medium leading-6 text-slate-600">
                        {message.content}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-400">
                        {message.code}
                      </p>
                    </td>
                    <TableCell>{message.channel}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-start gap-2 whitespace-nowrap">
                        <Calendar size={16} className="mt-0.5 text-slate-500" />
                        {formatDateTime(message.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={message.status} label={message.statusLabel} />
                    </TableCell>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedMessage(message)}
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-blue-500 px-3 text-xs font-black text-blue-600 transition hover:bg-blue-50"
                        >
                          <MessageSquare size={14} />
                          Mở hội thoại
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedMessage ? (
        <ConversationModal
          message={selectedMessage}
          isSending={replyingMessageId === selectedMessage.id}
          onClose={() => setSelectedMessage(null)}
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
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
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

function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-4 py-4 text-sm font-semibold text-slate-600">{children}</td>;
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
      {initials}
    </span>
  );
}

function ContactLine({
  icon,
  tone,
  children,
}: {
  icon: ReactNode;
  tone: "blue" | "green";
  children: ReactNode;
}) {
  const toneClass = tone === "green" ? "text-emerald-600" : "text-blue-600";

  return (
    <p className="mt-1 flex min-w-0 items-center gap-1 text-xs font-medium text-slate-600">
      <span className={`shrink-0 ${toneClass}`}>{icon}</span>
      <span className="truncate">{children}</span>
    </p>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: AdminContactMessageStatusCode;
  label: string;
}) {
  const className =
    status === "REPLIED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${className}`}>
      {label}
    </span>
  );
}

function ConversationModal({
  message,
  isSending,
  onClose,
  onReply,
}: {
  message: AdminContactMessage;
  isSending: boolean;
  onClose: () => void;
  onReply: (message: AdminContactMessage, content: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0 && !isSending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    void onReply(message, draft).then(() => setDraft(""));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="flex max-h-[calc(100vh-48px)] w-full max-w-2xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-950">
              {message.customerName}
            </h3>
            <p className="mt-1 text-sm font-bold text-emerald-600">
              {message.statusLabel}
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
            <div className="max-w-[82%] rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                {message.customerName}
              </p>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {message.content}
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {formatDateTime(message.createdAt)}
              </p>
            </div>

            {message.replies.map((reply) => (
              <div
                key={reply.id}
                className="ml-auto max-w-[82%] rounded-md bg-blue-600 px-4 py-3 text-white shadow-sm"
              >
                <p className="text-sm font-black">
                  {reply.adminUser?.fullName ?? "Admin"}
                </p>
                <p className="mt-2 text-sm font-medium leading-6">
                  {reply.content}
                </p>
                <p className="mt-2 text-xs font-semibold text-blue-100">
                  {formatDateTime(reply.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Nhập tin nhắn..."
            className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
          />
          <PermissionButton
            type="submit"
            permissionRule={{ permission: "support.message.reply" }}
            disabled={!canSend}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Gửi
          </PermissionButton>
        </form>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "KH";
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
