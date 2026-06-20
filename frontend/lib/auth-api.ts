import { getAuthToken, type AuthUser } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type AuthResponse = {
  token: string;
  user: AuthUser;
  redirectTo?: string;
};

export class AuthApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    Object.setPrototypeOf(this, AuthApiError.prototype);
  }
}

export function isAuthApiError(error: unknown): error is AuthApiError {
  return error instanceof AuthApiError;
}

type LoginPayload = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

type ProfilePayload = {
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
};

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

type BookingPaymentPayload = {
  method: PaymentMethodCode;
};

type RefundRequestPayload = {
  reason: string;
};

export type PaymentMethodCode = "CASH" | "MOMO" | "VNPAY" | "ZALOPAY" | "BANKING" | "CARD";
export type PaymentStatusCode = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type BookingStatusCode = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
export type TicketStatusCode = "VALID" | "INVALID";
export type RefundStatusCode = "PENDING" | "APPROVED" | "REJECTED";

export type BookingRefundRequest = {
  id: number;
  refundCode: string;
  reason: string;
  status: RefundStatusCode;
  statusLabel: string;
  amount: number;
  amountLabel: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
};

export type BookingHistoryItem = {
  id: number;
  bookingCode: string;
  bookingStatus: BookingStatusCode;
  note: string | null;
  customer: {
    fullName: string;
    email: string;
    phone: string | null;
  };
  amounts: {
    total: number;
    totalLabel: string;
    discount: number;
    discountLabel: string;
    final: number;
    finalLabel: string;
  };
  movie: {
    id: number;
    slug: string;
    title: string;
    posterUrl: string;
    bannerUrl: string;
    duration: string;
    language: string | null;
    ageLimit: string | null;
  } | null;
  showtime: {
    id: number;
    startTime: string;
    endTime: string;
    time: string;
    date: string;
    room: {
      id: number;
      name: string;
      cinema: {
        id: number;
        name: string;
        address: string;
        city: string;
      };
    } | null;
  } | null;
  seats: {
    count: number;
    codes: string[];
    label: string;
    types: string[];
  };
  payment: {
    id: number | null;
    method: PaymentMethodCode;
    status: PaymentStatusCode;
    amount: number;
    amountLabel: string;
    transactionCode: string | null;
    paymentUrl: string | null;
    createdAt: string;
    paidAt: string | null;
    displayTime: string;
    deadlineAt: string | null;
    remainingSeconds: number;
  };
  tickets: {
    id: number;
    ticketCode: string;
    qrCode: string | null;
    status: TicketStatusCode;
    statusLabel: string;
    usedAt: string | null;
    seat: {
      id: number;
      seatCode: string;
    };
  }[];
  refund: {
    canRequest: boolean;
    windowSeconds: number;
    requestDeadlineAt: string;
    remainingSeconds: number;
    reasonOptions: readonly string[];
    request: BookingRefundRequest | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type BookingHistoryResponse = {
  paymentWindowSeconds: number;
  refundWindowSeconds: number;
  refundReasonOptions: readonly string[];
  paymentMethods: PaymentMethodCode[];
  bookings: BookingHistoryItem[];
};

export type RefundRequestResponse = {
  message: string;
  refundRequest: {
    id: number;
    refundCode: string;
    status: RefundStatusCode;
    statusLabel: string;
    requestedAt: string;
  };
  booking: BookingHistoryItem | null;
};

export type AccountNotification = {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "REFUND_APPROVED" | "REFUND_REJECTED";
  isRead: boolean;
  metadata: unknown;
  readAt: string | null;
  createdAt: string;
};

export type AccountNotificationsResponse = {
  generatedAt: string;
  unreadCount: number;
  notifications: AccountNotification[];
};

async function postAuth(path: string, payload: LoginPayload | RegisterPayload) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthApiError(
      "Không kết nối được backend. Hãy chạy backend ở cổng 4000 bằng: npm.cmd run start",
    );
  }

  const data = (await response.json().catch(() => null)) as
    | (Partial<AuthResponse> & { message?: string })
    | null;

  if (!response.ok) {
    throw new AuthApiError(
      data?.message || "Không thể kết nối đến máy chủ.",
      response.status,
    );
  }

  if (!data?.token || !data.user) {
    throw new AuthApiError("Phản hồi đăng nhập không hợp lệ.");
  }

  return data as AuthResponse;
}

async function requestAccount<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT";
    payload?: ProfilePayload | PasswordPayload | BookingPaymentPayload | RefundRequestPayload;
  } = {},
) {
  const token = getAuthToken();

  if (!token) {
    throw new AuthApiError("Vui lòng đăng nhập để sử dụng chức năng tài khoản.", 401);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.payload ? JSON.stringify(options.payload) : undefined,
    });
  } catch {
    throw new AuthApiError(
      "Không kết nối được backend. Hãy chạy backend ở cổng 4000 bằng: npm.cmd run start",
    );
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<T>)
    | null;

  if (!response.ok) {
    throw new AuthApiError(
      data?.message || "Không thể kết nối đến máy chủ.",
      response.status,
    );
  }

  return data as T;
}

export function login(payload: LoginPayload) {
  return postAuth("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return postAuth("/auth/register", payload);
}

export function getProfile() {
  return requestAccount<{ user: AuthUser }>("/account/profile");
}

export function updateProfile(payload: ProfilePayload) {
  return requestAccount<{ user: AuthUser }>("/account/profile", {
    method: "PUT",
    payload,
  });
}

export function changePassword(payload: PasswordPayload) {
  return requestAccount<{ message: string }>("/account/password", {
    method: "PUT",
    payload,
  });
}

export function getBookingHistory() {
  return requestAccount<BookingHistoryResponse>("/account/bookings");
}

export function payBooking(bookingId: number, payload: BookingPaymentPayload) {
  return requestAccount<{ message: string; booking: BookingHistoryItem | null }>(
    `/account/bookings/${bookingId}/pay`,
    {
      method: "POST",
      payload,
    },
  );
}

export function requestBookingRefund(bookingId: number, payload: RefundRequestPayload) {
  return requestAccount<RefundRequestResponse>(`/account/bookings/${bookingId}/refund`, {
    method: "POST",
    payload,
  });
}

export function getAccountNotifications() {
  return requestAccount<AccountNotificationsResponse>("/account/notifications");
}

export function markAllNotificationsRead() {
  return requestAccount<{ message: string }>("/account/notifications/read-all", {
    method: "POST",
  });
}
