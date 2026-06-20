import { getAuthToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export type ChatbotAction = {
  label: string;
  href: string;
};

export type ChatbotResponse = {
  source: string;
  generatedAt: string;
  answer: string;
  suggestions: string[];
  actions: ChatbotAction[];
};

export type SupportContactMessageResponse = {
  message: string;
  contactMessage: {
    id: number;
    code: string;
    customerName: string;
    email: string;
    phone: string | null;
    subject: string;
    content: string;
    channel: string;
    status: string;
    statusLabel: string;
    createdAt: string;
  };
};

type ErrorPayload = {
  message?: string;
};

async function readErrorPayload(response: Response) {
  try {
    return (await response.json()) as ErrorPayload;
  } catch {
    return {};
  }
}

export async function askChatbot(message: string) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/chatbot/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error("Không kết nối được Chat AI/Admin. Hãy kiểm tra backend ở cổng 4000.");
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);

    throw new Error(payload.message ?? "Chat AI/Admin chưa thể trả lời lúc này.");
  }

  return (await response.json()) as ChatbotResponse;
}

export async function sendSupportContactMessage(payload: {
  subject?: string;
  content: string;
}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Vui lòng đăng nhập để gửi tin nhắn liên hệ cho admin.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/support/contact-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Không kết nối được backend. Hãy kiểm tra backend ở cổng 4000.");
  }

  const data = (await response.json().catch(() => null)) as
    | ({ message?: string } & Partial<SupportContactMessageResponse>)
    | null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Không thể gửi tin nhắn liên hệ lúc này.");
  }

  return data as SupportContactMessageResponse;
}
