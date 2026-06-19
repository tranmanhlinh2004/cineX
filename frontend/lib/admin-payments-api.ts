import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminPaymentMethodCode =
  | "CASH"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY"
  | "BANKING"
  | "CARD";

export type AdminPaymentStatusCode = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type AdminPaymentTransaction = {
  id: number;
  bookingId: number;
  bookingCode: string;
  bookingStatus: string;
  transactionCode: string;
  method: AdminPaymentMethodCode;
  methodLabel: string;
  status: AdminPaymentStatusCode;
  statusLabel: string;
  amount: number;
  amountLabel: string;
  paymentUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  updatedAt: string;
  displayAt: string;
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
  } | null;
  movieTitle: string;
  showtime: {
    id: number;
    startTime: string;
    endTime: string;
    date: string;
    time: string;
  } | null;
  room: {
    id: number;
    name: string;
    cinemaName: string;
    cinemaAddress: string;
  } | null;
  seats: {
    count: number;
    codes: string[];
    label: string;
    types: string[];
  };
  tickets: {
    id: number;
    ticketCode: string;
    status: string;
  }[];
};

export type AdminPaymentStats = {
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  onlineTransactions: number;
  successfulRevenue: number;
};

export type AdminPaymentTransactionsResponse = {
  generatedAt: string;
  transactions: AdminPaymentTransaction[];
  stats: AdminPaymentStats;
};

async function requestAdmin<T>(path: string) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để xem giao dịch.");
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
    throw new Error(data?.message || "Không thể tải giao dịch từ database.");
  }

  return data as T;
}

export function getAdminPaymentTransactions() {
  return requestAdmin<AdminPaymentTransactionsResponse>("/admin/payments/transactions");
}
