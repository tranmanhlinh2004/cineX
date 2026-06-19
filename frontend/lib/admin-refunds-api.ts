import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminRefundStatusCode = "PENDING" | "APPROVED" | "REJECTED";

export type AdminRefundRequest = {
  id: number;
  refundCode: string;
  bookingId: number;
  bookingCode: string;
  ticketCode: string;
  customer: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  };
  customerName: string;
  reason: string;
  status: AdminRefundStatusCode;
  statusLabel: string;
  amount: number;
  amountLabel: string;
  bookedAt: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewer: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  reviewerNote: string | null;
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
  };
  payment: {
    id: number;
    method: string;
    status: string;
    transactionCode: string | null;
    paidAt: string | null;
  } | null;
};

export type AdminRefundStats = {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  overdueRequests: number;
  approvedAmount: number;
};

export type AdminRefundRequestsResponse = {
  generatedAt: string;
  refundRequests: AdminRefundRequest[];
  stats: AdminRefundStats;
};

export type AdminRefundMutationResponse = {
  message: string;
  refundRequest: AdminRefundRequest | null;
};

type RequestAdminOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để xử lý hoàn tiền.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error("Không kết nối được backend.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải dữ liệu hoàn tiền từ database.");
  }

  return data as T;
}

export function getAdminRefundRequests() {
  return requestAdmin<AdminRefundRequestsResponse>("/admin/refund-requests");
}

export function approveAdminRefundRequest(id: number, reviewerNote?: string) {
  return requestAdmin<AdminRefundMutationResponse>(`/admin/refund-requests/${id}/approve`, {
    method: "POST",
    body: reviewerNote ? { reviewerNote } : {},
  });
}

export function rejectAdminRefundRequest(id: number, reviewerNote?: string) {
  return requestAdmin<AdminRefundMutationResponse>(`/admin/refund-requests/${id}/reject`, {
    method: "POST",
    body: reviewerNote ? { reviewerNote } : {},
  });
}
