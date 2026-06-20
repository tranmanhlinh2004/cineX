import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminTicketStatusCode = "VALID" | "INVALID";
export type AdminTicketSourceCode = "ONLINE" | "COUNTER";

export type AdminTicket = {
  id: number;
  ticketCode: string;
  qrCode: string | null;
  price: number;
  priceLabel: string;
  status: AdminTicketStatusCode;
  statusLabel: string;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  source: AdminTicketSourceCode;
  sourceLabel: string;
  booking: {
    id: number;
    bookingCode: string;
    status: string;
    createdAt: string;
  };
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  movie: {
    id: number;
    slug: string;
    title: string;
  };
  showtime: {
    id: number;
    startTime: string;
    endTime: string;
    date: string;
    time: string;
  };
  room: {
    id: number;
    name: string;
    cinemaName: string;
    cinemaAddress: string;
    cinemaCity: string;
  };
  seat: {
    id: number;
    seatCode: string;
    typeName: string;
  };
  payment: {
    id: number;
    method: string;
    methodLabel: string;
    status: string;
    statusLabel: string;
    transactionCode: string;
    paidAt: string | null;
  } | null;
};

export type AdminTicketStats = {
  totalTickets: number;
  validTickets: number;
  invalidTickets: number;
  usedTickets: number;
  unusedTickets: number;
  onlineTickets: number;
};

export type AdminTicketsResponse = {
  generatedAt: string;
  query: string;
  tickets: AdminTicket[];
  stats: AdminTicketStats;
};

async function requestAdmin<T>(path: string) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để kiểm tra vé.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải dữ liệu vé từ database.");
  }

  return data as T;
}

export function getAdminTickets(query = "") {
  const trimmedQuery = query.trim();
  const search = trimmedQuery
    ? `?query=${encodeURIComponent(trimmedQuery)}`
    : "";

  return requestAdmin<AdminTicketsResponse>(`/admin/tickets${search}`);
}
