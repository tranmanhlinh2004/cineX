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
