"use client";

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  ScanQrCode,
  Search,
  ShieldCheck,
  Ticket,
  TicketX,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getAdminTickets,
  type AdminTicket,
  type AdminTicketStats,
  type AdminTicketStatusCode,
} from "@/lib/admin-tickets-api";

type Notice = {
  type: "error" | "success";
  text: string;
};

type BarcodeDetectionResult = {
  rawValue: string;
};

type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectionResult[]>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

const emptyStats: AdminTicketStats = {
  totalTickets: 0,
  validTickets: 0,
  invalidTickets: 0,
  usedTickets: 0,
  unusedTickets: 0,
  onlineTickets: 0,
};

const statusFilterOptions: { value: "ALL" | AdminTicketStatusCode; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "VALID", label: "Vé hợp lệ" },
  { value: "INVALID", label: "Vé không hợp lệ" },
];

export default function AdminTicketsPageClient() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminTicketStats>(emptyStats);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminTicketStatusCode>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadTickets = useCallback(
    async (nextQuery: string, options: { silent?: boolean } = {}) => {
      if (options.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setNotice(null);

      try {
        const data = await getAdminTickets(nextQuery);

        setTickets(data.tickets);
        setStats(data.stats);

        if (nextQuery.trim()) {
          setNotice({
            type: "success",
            text:
              data.tickets.length > 0
                ? `Đã tìm thấy ${data.tickets.length} vé khớp mã kiểm tra.`
                : "Không tìm thấy vé khớp mã kiểm tra.",
          });
        }
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu vé từ database.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets("");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTickets]);

  const handleCheckTicket = useCallback(() => {
    const trimmedQuery = query.trim();

    setActiveQuery(trimmedQuery);
    void loadTickets(trimmedQuery, { silent: true });
  }, [loadTickets, query]);

  const handleScannedCode = useCallback(
    (rawValue: string) => {
      const extractedCode = extractTicketCode(rawValue);

      setQuery(extractedCode);
      setActiveQuery(extractedCode);
      setScannerOpen(false);
      void loadTickets(extractedCode, { silent: true });
    },
    [loadTickets],
  );

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    const Detector = getBarcodeDetectorConstructor();

    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      const timer = window.setTimeout(() => {
        setScannerError(
          "Trình duyệt chưa hỗ trợ quét QR bằng camera. Bạn có thể nhập mã vé hoặc mã QR thủ công.",
        );
      }, 0);

      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    let animationFrame = 0;
    let stream: MediaStream | null = null;

    const stopStream = () => {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const startScanner = async () => {
      setScannerError("");

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (cancelled) {
          stopStream();
          return;
        }

        const video = videoRef.current;

        if (!video) {
          return;
        }

        video.srcObject = stream;
        await video.play();

        const detector = new Detector({ formats: ["qr_code"] });

        const scanFrame = async () => {
          if (cancelled) {
            return;
          }

          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video);
              const rawValue = codes[0]?.rawValue?.trim();

              if (rawValue) {
                handleScannedCode(rawValue);
                return;
              }
            }
          } catch {
            setScannerError("Chưa đọc được mã QR, hãy đưa mã vào giữa khung camera.");
          }

          animationFrame = window.requestAnimationFrame(scanFrame);
        };

        animationFrame = window.requestAnimationFrame(scanFrame);
      } catch {
        setScannerError(
          "Không thể mở camera. Hãy kiểm tra quyền truy cập camera hoặc nhập mã thủ công.",
        );
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      stopStream();
    };
  }, [handleScannedCode, scannerOpen]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      return statusFilter === "ALL" || ticket.status === statusFilter;
    });
  }, [statusFilter, tickets]);

  const validRate =
    stats.totalTickets > 0
      ? Math.round((stats.validTickets / stats.totalTickets) * 100)
      : 0;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-5">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-black uppercase text-red-700">
            Quản lý vé
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Kiểm tra vé online
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Nhập mã vé hoặc quét QR để đối chiếu vé đã đặt online, sau đó xem
            trạng thái vé lấy trực tiếp từ bảng tickets trong database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadTickets(activeQuery, { silent: true })}
          disabled={isLoading || isRefreshing}
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin" : ""} />
          Làm mới
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Tổng vé"
          value={stats.totalTickets.toString()}
          helper={activeQuery ? "Theo mã đang kiểm tra" : "Tổng kết quả từ database"}
          icon={<Ticket size={21} />}
        />
        <StatBox
          label="Vé hợp lệ"
          value={stats.validTickets.toString()}
          helper={`${validRate}% kết quả`}
          icon={<ShieldCheck size={21} />}
          tone="success"
        />
        <StatBox
          label="Chưa sử dụng"
          value={stats.unusedTickets.toString()}
          helper={`${stats.usedTickets} vé đã sử dụng`}
          icon={<ClipboardCheck size={21} />}
          tone="warning"
        />
        <StatBox
          label="Không hợp lệ"
          value={stats.invalidTickets.toString()}
          helper={`${stats.onlineTickets} vé từ luồng online`}
          icon={<TicketX size={21} />}
          tone="danger"
        />
      </section>

      {notice ? <NoticeBox notice={notice} /> : null}

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_210px_auto_auto]">
          <label className="relative block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCheckTicket();
                }
              }}
              placeholder="Nhập mã vé hoặc nội dung QR..."
              className="h-11 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | AdminTicketStatusCode)
            }
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-red-500"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCheckTicket}
            disabled={isLoading || isRefreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {isRefreshing ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
            Kiểm tra
          </button>

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <ScanQrCode size={17} />
            Quét QR
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Kết quả kiểm tra vé
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {activeQuery
                ? `${filteredTickets.length} vé khớp "${activeQuery}"`
                : `${filteredTickets.length} vé đang hiển thị`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="bg-slate-200 text-sm uppercase text-slate-950">
              <tr>
                <TableHead>Mã vé</TableHead>
                <TableHead>Mã đặt vé</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Phim</TableHead>
                <TableHead>Suất chiếu</TableHead>
                <TableHead>Ghế</TableHead>
                <TableHead>Trạng thái vé</TableHead>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    <Loader2 size={20} className="mx-auto mb-2 animate-spin" />
                    Đang tải dữ liệu vé từ database...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm font-bold text-slate-500"
                  >
                    Chưa có vé phù hợp với điều kiện kiểm tra.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <TableCell strong>{ticket.ticketCode}</TableCell>
                    <TableCell>{ticket.booking.bookingCode}</TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span className="font-black text-slate-900">
                          {ticket.customer.fullName}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {ticket.customer.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.movie.title}</TableCell>
                    <TableCell>
                      {ticket.showtime.date} {ticket.showtime.time}
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-0.5">
                        <span>{ticket.seat.seatCode}</span>
                        <span className="text-xs text-slate-500">
                          {ticket.room.cinemaName} - {ticket.room.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge
                        status={ticket.status}
                        label={ticket.statusLabel}
                      />
                    </TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {scannerOpen ? (
        <QrScannerModal
          error={scannerError}
          videoRef={videoRef}
          onClose={() => setScannerOpen(false)}
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
}: {
  children: ReactNode;
}) {
  return <th className="px-4 py-4 font-black">{children}</th>;
}

function TableCell({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-4 text-sm ${
        strong ? "font-black text-slate-950" : "font-semibold text-slate-600"
      }`}
    >
      {children}
    </td>
  );
}

function TicketStatusBadge({
  status,
  label,
}: {
  status: AdminTicketStatusCode;
  label: string;
}) {
  const className =
    status === "VALID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-black ${className}`}>
      {label}
    </span>
  );
}

function QrScannerModal({
  error,
  videoRef,
  onClose,
}: {
  error: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-xl overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-red-600">
              Quét QR vé
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-950">
              Đưa mã QR vào giữa khung camera
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng quét QR"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <XCircle size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-950">
            <video
              ref={videoRef}
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-8 rounded-md border-2 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/80">
              <Camera size={28} />
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getBarcodeDetectorConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window as Window & {
      BarcodeDetector?: BarcodeDetectorConstructor;
    }
  ).BarcodeDetector ?? null;
}

function extractTicketCode(rawValue: string) {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmedValue) as Record<string, unknown>;
    const fromJson = parsed.ticketCode ?? parsed.qrCode ?? parsed.code;

    if (typeof fromJson === "string" && fromJson.trim()) {
      return fromJson.trim();
    }
  } catch {
    // Continue with URL and plain-text QR payload formats.
  }

  try {
    const url = new URL(trimmedValue);
    const fromUrl =
      url.searchParams.get("ticketCode") ??
      url.searchParams.get("qrCode") ??
      url.searchParams.get("code") ??
      url.searchParams.get("ticket");

    if (fromUrl?.trim()) {
      return fromUrl.trim();
    }

    const lastSegment = url.pathname.split("/").filter(Boolean).pop();

    if (lastSegment) {
      return decodeURIComponent(lastSegment);
    }
  } catch {
    // Fall back to using the raw scanned value as the search key.
  }

  return trimmedValue;
}
