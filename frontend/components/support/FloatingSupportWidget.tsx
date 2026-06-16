"use client";

import Link from "next/link";
import {
  Bot,
  Headphones,
  LoaderCircle,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  askChatbot,
  type ChatbotAction,
} from "@/lib/chatbot-api";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestions?: string[];
  actions?: ChatbotAction[];
  isError?: boolean;
};

const demoHotline = "0868066018";
const initialSuggestions = [
  "Phim nào đang chiếu hôm nay?",
  "Lịch chiếu ngày mai",
  "Giá vé hiện tại",
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const initialMessage: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Xin chào, mình là Chat AI/Admin của CineX. Bạn có thể hỏi về phim, lịch chiếu, giá vé, khuyến mãi, rạp hoặc cách đặt vé.",
  suggestions: initialSuggestions,
};

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages, isSending]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await askChatbot(trimmedMessage);
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: response.answer,
        suggestions: response.suggestions,
        actions: response.actions,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error) {
      const fallbackMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Chat AI/Admin chưa thể trả lời lúc này.",
        suggestions: initialSuggestions,
        isError: true,
      };

      setMessages((currentMessages) => [...currentMessages, fallbackMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3 sm:right-6">
      {isOpen && (
        <section
          aria-label="Chat AI/Admin"
          className="mb-2 flex max-h-[min(620px,calc(100vh-8rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111318] text-white shadow-2xl shadow-black/40 sm:w-[390px]"
        >
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-[#171a21] px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white">
                <Bot size={22} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">Chat AI/Admin</p>
                <p className="truncate text-xs font-semibold text-white/45">
                  CineX support
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Đóng Chat AI/Admin"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              <X size={19} />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex min-h-[320px] flex-1 flex-col gap-3 overflow-y-auto bg-[#0d0f14] px-4 py-4"
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSuggestionClick={sendMessage}
                disabled={isSending}
              />
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-md bg-white/8 px-3 py-2 text-sm font-semibold text-white/70">
                  <LoaderCircle size={16} className="animate-spin" />
                  Đang trả lời
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-white/10 bg-[#171a21] p-3"
          >
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              maxLength={700}
              placeholder="Nhập câu hỏi..."
              className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-medium text-white outline-none transition placeholder:text-white/35 focus:border-blue-500"
            />
            <button
              type="submit"
              aria-label="Gửi câu hỏi"
              disabled={isSending || inputValue.trim().length === 0}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
            >
              {isSending ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </section>
      )}

      <div className="flex flex-col items-end gap-2">
        <a
          href={`https://zalo.me/${demoHotline}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full bg-[#2f86ff] px-5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-[#2376e6]"
        >
          <MessageSquareText size={18} />
          Zalo
        </a>

        <a
          href={`tel:${demoHotline}`}
          className="inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full bg-[#009b72] px-5 text-sm font-black text-white shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#008564]"
        >
          <PhoneCall size={18} />
          Hotline
        </a>

        <button
          type="button"
          aria-label={isOpen ? "Đóng Chat AI/Admin" : "Mở Chat AI/Admin"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-black text-white shadow-xl shadow-blue-950/25 transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          {isOpen ? <X size={19} /> : <MessageCircle size={19} />}
          Chat AI/Admin
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSuggestionClick,
  disabled,
}: {
  message: ChatMessage;
  onSuggestionClick: (suggestion: string) => void;
  disabled: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-6 ${
          isUser
            ? "bg-blue-600 text-white"
            : message.isError
              ? "border border-red-500/35 bg-red-500/10 text-red-100"
              : "bg-white/8 text-white/82"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-500/20 text-blue-300">
              {message.isError ? <Headphones size={13} /> : <Sparkles size={13} />}
            </span>
          )}
          <p className="whitespace-pre-line">{message.content}</p>
        </div>

        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className="rounded-md bg-white px-2.5 py-1.5 text-xs font-black text-[#111318] transition hover:bg-blue-100"
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}

        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.slice(0, 3).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={disabled}
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 text-left text-xs font-bold text-white/70 transition hover:border-blue-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
