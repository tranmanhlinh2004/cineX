import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type AdminContactMessageStatusCode =
  | "PENDING"
  | "IN_PROGRESS"
  | "REPLIED"
  | "NEED_FOLLOW_UP";

export type AdminContactMessageReply = {
  id: number;
  contactMessageId: number;
  adminUserId: number | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  adminUser: {
    id: number;
    fullName: string;
    email: string;
  } | null;
};

export type AdminContactMessage = {
  id: number;
  code: string;
  customerName: string;
  email: string;
  phone: string | null;
  subject: string;
  content: string;
  channel: string;
  status: AdminContactMessageStatusCode;
  statusLabel: string;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  replies: AdminContactMessageReply[];
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
};

export type AdminContactMessageStats = {
  totalMessages: number;
  pendingMessages: number;
  repliedMessages: number;
};

export type AdminContactMessagesResponse = {
  generatedAt: string;
  messages: AdminContactMessage[];
  stats: AdminContactMessageStats;
};

export type AdminContactMessageMutationResponse = {
  message: string;
  contactMessage: AdminContactMessage;
};

export type AdminContactMessageReplyResponse = {
  message: string;
  reply: AdminContactMessageReply;
  contactMessage: AdminContactMessage;
};

type RequestAdminOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function requestAdmin<T>(path: string, options: RequestAdminOptions = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập quản trị để xem tin nhắn liên hệ.");
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
    throw new Error(data?.message || "Không thể tải tin nhắn liên hệ từ database.");
  }

  return data as T;
}

export function getAdminContactMessages() {
  return requestAdmin<AdminContactMessagesResponse>("/admin/contact-messages");
}

export function updateAdminContactMessageStatus(
  id: number,
  status: AdminContactMessageStatusCode,
) {
  return requestAdmin<AdminContactMessageMutationResponse>(
    `/admin/contact-messages/${id}/status`,
    {
      method: "POST",
      body: { status },
    },
  );
}

export function sendAdminContactMessageReply(id: number, content: string) {
  return requestAdmin<AdminContactMessageReplyResponse>(
    `/admin/contact-messages/${id}/replies`,
    {
      method: "POST",
      body: { content },
    },
  );
}
