"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import {
  getAdminPaymentTransactions,
  type AdminPaymentMethodCode,
  type AdminPaymentStatusCode,
  type AdminPaymentTransaction,
} from "@/lib/admin-payments-api";

type Notice = {
  type: "success" | "error";
  text: string;
};

type InvoiceStatusCode = "READY" | "WAITING" | "INVALID" | "REFUNDED";

type InvoiceRecord = {
  invoiceCode: string;
  transaction: AdminPaymentTransaction;
  status: InvoiceStatusCode;
  statusLabel: string;
  issuedAt: string | null;
};

const statusFilterOptions: { value: "ALL" | InvoiceStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "READY", label: "Sẵn sàng xuất" },
  { value: "WAITING", label: "Chờ thanh toán" },
  { value: "INVALID", label: "Không đủ điều kiện" },
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

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function AdminInvoicesPageClient() {
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceStatusCode>("ALL");
  const [methodFilter, setMethodFilter] = useState<"ALL" | AdminPaymentMethodCode>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportingInvoiceCode, setExportingInvoiceCode] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadInvoices = async (options: { silent?: boolean } = {}) => {
    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setNotice(null);

    try {
      const data = await getAdminPaymentTransactions();

      setTransactions(data.transactions);
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách giao dịch để lập hóa đơn.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInvoices();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const invoices = useMemo(
    () => transactions.map(createInvoiceFromTransaction),
    [transactions],
  );

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return invoices.filter((invoice) => {
      const transaction = invoice.transaction;
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
      const matchesMethod =
        methodFilter === "ALL" || transaction.method === methodFilter;
      const matchesQuery =
        !normalizedQuery ||
        normalizeText(
          [
            invoice.invoiceCode,
            transaction.transactionCode,
            transaction.bookingCode,
            transaction.customer.fullName,
            transaction.customer.email,
            transaction.methodLabel,
            transaction.movieTitle,
            transaction.room?.cinemaName ?? "",
            invoice.statusLabel,
          ].join(" "),
        ).includes(normalizedQuery);

      return matchesStatus && matchesMethod && matchesQuery;
    });
  }, [invoices, methodFilter, query, statusFilter]);

  const readyInvoices = invoices.filter((invoice) => invoice.status === "READY");
  const waitingInvoices = invoices.filter((invoice) => invoice.status === "WAITING");
  const invalidInvoices = invoices.filter((invoice) => invoice.status === "INVALID");
  const totalReadyAmount = readyInvoices.reduce(
    (total, invoice) => total + invoice.transaction.amount,
    0,
  );

  const handleExportInvoice = async (invoice: InvoiceRecord) => {
    setExportingInvoiceCode(invoice.invoiceCode);
    setNotice(null);

    try {
      await exportInvoicePdf(invoice);
      setNotice({
        type: "success",
        text: `Đã tạo file PDF cho hóa đơn ${invoice.invoiceCode}.`,
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể xuất hóa đơn ra PDF.",
      });
    } finally {
      setExportingInvoiceCode(null);
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
            Xuất hóa đơn
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Lập và xem hóa đơn từ danh sách giao dịch thanh toán trong database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadInvoices({ silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Hóa đơn"
          value={invoices.length.toString()}
          helper="Theo danh sách giao dịch"
          icon={<ReceiptText size={21} />}
        />
        <StatBox
          label="Sẵn sàng xuất"
          value={readyInvoices.length.toString()}
          helper="Giao dịch đã thanh toán"
          icon={<CheckCircle2 size={21} />}
          tone="success"
        />
        <StatBox
          label="Giá trị"
          value={formatMoney(totalReadyAmount)}
          helper="Tổng hóa đơn đủ điều kiện"
          icon={<FileText size={21} />}
          tone="danger"
        />
        <StatBox
          label="Cần theo dõi"
          value={(waitingInvoices.length + invalidInvoices.length).toString()}
          helper="Chờ thanh toán hoặc lỗi"
          icon={<AlertCircle size={21} />}
          tone="warning"
        />
      </section>

      {notice ? <NoticeBox notice={notice} /> : null}

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
              placeholder="Tìm mã hóa đơn, mã giao dịch, khách hàng..."
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
              setStatusFilter(event.target.value as "ALL" | InvoiceStatusCode)
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
            <h3 className="text-lg font-black text-slate-950">Danh sách hóa đơn</h3>
            <p className="mt-1 text-sm text-slate-500">
              {filteredInvoices.length} hóa đơn đang hiển thị
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Mã giao dịch</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Kênh</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Ngày xuất</TableHead>
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
                    Đang tải dữ liệu hóa đơn từ danh sách giao dịch...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Chưa có hóa đơn phù hợp.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.invoiceCode}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <TableCell strong>{invoice.invoiceCode}</TableCell>
                    <TableCell>{invoice.transaction.transactionCode}</TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="font-black text-slate-900">
                          {invoice.transaction.customer.fullName}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {invoice.transaction.customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.transaction.methodLabel}</TableCell>
                    <TableCell>{invoice.transaction.amountLabel}</TableCell>
                    <TableCell>{formatDate(invoice.issuedAt)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} label={invoice.statusLabel} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <IconButton
                          label={`Xem hóa đơn ${invoice.invoiceCode}`}
                          onClick={() => setSelectedInvoice(invoice)}
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

      {selectedInvoice ? (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          isExporting={exportingInvoiceCode === selectedInvoice.invoiceCode}
          onClose={() => setSelectedInvoice(null)}
          onExport={() => void handleExportInvoice(selectedInvoice)}
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
  status: InvoiceStatusCode;
  label: string;
}) {
  const className =
    status === "READY"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "REFUNDED"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : status === "INVALID"
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

function InvoiceDetailModal({
  invoice,
  isExporting,
  onClose,
  onExport,
}: {
  invoice: InvoiceRecord;
  isExporting: boolean;
  onClose: () => void;
  onExport: () => void;
}) {
  const transaction = invoice.transaction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-red-600">
              {invoice.invoiceCode}
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              Chi tiết hóa đơn
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
          <DetailLine label="Mã hóa đơn" value={invoice.invoiceCode} />
          <DetailLine label="Mã giao dịch" value={transaction.transactionCode} />
          <DetailLine label="Mã đặt vé" value={transaction.bookingCode} />
          <DetailLine label="Trạng thái hóa đơn" value={invoice.statusLabel} />
          <DetailLine label="Khách hàng" value={transaction.customer.fullName} />
          <DetailLine label="Email" value={transaction.customer.email} />
          <DetailLine
            label="Số điện thoại"
            value={transaction.customer.phone ?? "Chưa cập nhật"}
          />
          <DetailLine label="Kênh thanh toán" value={transaction.methodLabel} />
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
          <DetailLine label="Ghế" value={transaction.seats.label || "Chưa có ghế"} />
          <DetailLine
            label="Mã vé"
            value={
              transaction.tickets.map((ticket) => ticket.ticketCode).join(", ") ||
              "Chưa phát hành"
            }
          />
          <DetailLine label="Số tiền thanh toán" value={transaction.amountLabel} />
          <DetailLine label="Ngày xuất" value={formatDate(invoice.issuedAt)} />
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
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isExporting ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />}
            Xuất PDF
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

function createInvoiceFromTransaction(transaction: AdminPaymentTransaction): InvoiceRecord {
  const issuedAt = transaction.status === "SUCCESS" ? transaction.paidAt ?? transaction.createdAt : null;

  return {
    invoiceCode: createInvoiceCode(transaction),
    transaction,
    issuedAt,
    ...getInvoiceStatus(transaction.status),
  };
}

function createInvoiceCode(transaction: AdminPaymentTransaction) {
  const sourceDate = transaction.paidAt ?? transaction.createdAt;
  const date = new Date(sourceDate);
  const year = Number.isFinite(date.getTime())
    ? String(date.getFullYear()).slice(-2)
    : "00";
  const month = Number.isFinite(date.getTime())
    ? String(date.getMonth() + 1).padStart(2, "0")
    : "00";
  const day = Number.isFinite(date.getTime())
    ? String(date.getDate()).padStart(2, "0")
    : "00";

  return `INV-${year}${month}${day}-${transaction.id.toString().padStart(4, "0")}`;
}

function getInvoiceStatus(status: AdminPaymentStatusCode): {
  status: InvoiceStatusCode;
  statusLabel: string;
} {
  if (status === "SUCCESS") {
    return { status: "READY", statusLabel: "Sẵn sàng xuất" };
  }

  if (status === "PENDING") {
    return { status: "WAITING", statusLabel: "Chờ thanh toán" };
  }

  if (status === "REFUNDED") {
    return { status: "REFUNDED", statusLabel: "Đã hoàn tiền" };
  }

  return { status: "INVALID", statusLabel: "Không đủ điều kiện" };
}

async function exportInvoicePdf(invoice: InvoiceRecord) {
  const [{ default: pdfMake }, pdfFonts] = await Promise.all([
    import("pdfmake/build/pdfmake.js"),
    import("pdfmake/build/vfs_fonts.js"),
  ]);
  const virtualFileSystem = (
    "default" in pdfFonts ? pdfFonts.default : pdfFonts
  ) as unknown as Record<string, string>;

  pdfMake.addVirtualFileSystem(virtualFileSystem);
  await pdfMake.createPdf(buildInvoiceDocument(invoice)).download(
    `${invoice.invoiceCode}.pdf`,
  );
}

function buildInvoiceDocument(invoice: InvoiceRecord): TDocumentDefinitions {
  const transaction = invoice.transaction;
  const ticketCodes =
    transaction.tickets.map((ticket) => ticket.ticketCode).join(", ") || "Chưa phát hành";
  const seatCodes = transaction.seats.label || "Chưa có ghế";
  const showtimeLabel = transaction.showtime
    ? `${transaction.showtime.date} ${transaction.showtime.time}`
    : "Chưa xác định";

  return {
    pageSize: "A4",
    pageMargins: [42, 40, 42, 40],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      lineHeight: 1.2,
    },
    styles: {
      title: {
        fontSize: 20,
        bold: true,
        alignment: "center",
        color: "#0f172a",
      },
      subtitle: {
        fontSize: 10,
        alignment: "center",
        color: "#475569",
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: "#b91c1c",
        margin: [0, 14, 0, 6],
      },
      strong: {
        bold: true,
      },
      small: {
        fontSize: 9,
        color: "#64748b",
      },
    },
    content: [
      { text: "CINEX", style: "title" },
      {
        text: "HÓA ĐƠN THANH TOÁN VÉ XEM PHIM",
        style: "subtitle",
        margin: [0, 4, 0, 16],
      },
      {
        columns: [
          [
            { text: "Đơn vị bán hàng", style: "strong" },
            "Công ty Cổ phần CineX",
            "Địa chỉ: 01 Nguyễn Văn Cừ, Thành phố Vinh, Nghệ An",
            "Email: support@cinex.vn",
          ],
          [
            { text: `Mã hóa đơn: ${invoice.invoiceCode}`, style: "strong" },
            `Ngày xuất: ${formatDate(invoice.issuedAt)}`,
            `Trạng thái: ${invoice.statusLabel}`,
            `Mã giao dịch: ${transaction.transactionCode}`,
          ],
        ],
        columnGap: 24,
      },
      { text: "Thông tin khách hàng", style: "sectionTitle" },
      {
        table: {
          widths: ["32%", "*"],
          body: [
            ["Khách hàng", transaction.customer.fullName],
            ["Email", transaction.customer.email],
            ["Số điện thoại", transaction.customer.phone ?? "Chưa cập nhật"],
            ["Mã đặt vé", transaction.bookingCode],
          ],
        },
        layout: "lightHorizontalLines",
      },
      { text: "Thông tin vé", style: "sectionTitle" },
      {
        table: {
          widths: ["32%", "*"],
          body: [
            ["Phim", transaction.movieTitle],
            ["Suất chiếu", showtimeLabel],
            ["Rạp", transaction.room?.cinemaName ?? "Chưa xác định"],
            ["Phòng", transaction.room?.name ?? "Chưa xác định"],
            ["Ghế", seatCodes],
            ["Mã vé", ticketCodes],
          ],
        },
        layout: "lightHorizontalLines",
      },
      { text: "Chi tiết thanh toán", style: "sectionTitle" },
      {
        table: {
          widths: ["*", "auto", "auto", "auto"],
          body: [
            [
              { text: "Nội dung", style: "strong" },
              { text: "Số lượng", style: "strong", alignment: "right" },
              { text: "Đơn giá", style: "strong", alignment: "right" },
              { text: "Thành tiền", style: "strong", alignment: "right" },
            ],
            [
              `Vé xem phim ${transaction.movieTitle}`,
              { text: String(Math.max(transaction.seats.count, 1)), alignment: "right" },
              { text: formatMoney(transaction.amount / Math.max(transaction.seats.count, 1)), alignment: "right" },
              { text: transaction.amountLabel, alignment: "right" },
            ],
            [
              { text: "Tổng thanh toán", colSpan: 3, bold: true, alignment: "right" },
              {},
              {},
              { text: transaction.amountLabel, bold: true, alignment: "right" },
            ],
          ],
        },
      },
      {
        text: `Phương thức thanh toán: ${transaction.methodLabel}. Thời điểm thanh toán: ${formatDateTime(transaction.paidAt ?? transaction.createdAt)}.`,
        margin: [0, 12, 0, 0],
      },
      {
        text: "Hóa đơn được tạo từ hệ thống quản trị CineX. Vui lòng kiểm tra thông tin trước khi lưu trữ hoặc gửi cho khách hàng.",
        style: "small",
        margin: [0, 18, 0, 0],
      },
    ],
  };
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa xuất";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Chưa xuất";
  }

  return dateFormatter.format(date);
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
