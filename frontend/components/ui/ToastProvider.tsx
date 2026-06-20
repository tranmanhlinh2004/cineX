"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastPayload, type ToastTone } from "@/lib/toast";

type ToastItem = Required<ToastPayload> & {
  id: number;
  phase: "visible" | "leaving";
};

const toastDurationMs = 2000;
const toastExitMs = 240;

const toneClass: Record<ToastTone, { icon: typeof Info; card: string; progress: string }> = {
  info: {
    icon: Info,
    card: "border-slate-200 bg-white text-slate-900 shadow-slate-950/10",
    progress: "bg-slate-500",
  },
  success: {
    icon: CheckCircle2,
    card: "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-950/10",
    progress: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    card: "border-red-200 bg-red-50 text-red-900 shadow-red-950/10",
    progress: "bg-red-500",
  },
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef(new Map<number, number[]>());

  const clearToastTimers = useCallback((id: number) => {
    const timers = timersRef.current.get(id);

    if (!timers) {
      return;
    }

    timers.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.delete(id);
  }, []);

  const removeToast = useCallback(
    (id: number) => {
      clearToastTimers(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearToastTimers],
  );

  const dismissToast = useCallback(
    (id: number) => {
      clearToastTimers(id);
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, phase: "leaving" } : toast,
        ),
      );

      const removeTimer = window.setTimeout(() => {
        removeToast(id);
      }, toastExitMs);

      timersRef.current.set(id, [removeTimer]);
    },
    [clearToastTimers, removeToast],
  );

  useEffect(() => {
    const toastTimers = timersRef.current;

    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastPayload>).detail;

      if (!detail?.message) {
        return;
      }

      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current,
        {
          id,
          message: detail.message,
          tone: detail.tone ?? "info",
          phase: "visible",
        },
      ]);

      const dismissTimer = window.setTimeout(() => {
        dismissToast(id);
      }, toastDurationMs);

      toastTimers.set(id, [dismissTimer]);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      toastTimers.forEach((timers) =>
        timers.forEach((timer) => window.clearTimeout(timer)),
      );
      toastTimers.clear();
    };
  }, [dismissToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[120] grid w-[calc(100vw-32px)] max-w-sm gap-2">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const tone = toneClass[toast.tone];
  const Icon = tone.icon;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`cinex-toast-card overflow-hidden rounded-md border text-sm font-bold shadow-lg ${
        toast.phase === "leaving" ? "cinex-toast-card-out" : "cinex-toast-card-in"
      } ${tone.card}`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <p className="min-w-0 flex-1 leading-6">{toast.message}</p>
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={onDismiss}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X size={15} />
        </button>
      </div>
      <div className="h-1 bg-black/5">
        <div
          className={`cinex-toast-progress h-full ${tone.progress}`}
          style={{ animationDuration: `${toastDurationMs}ms` }}
        />
      </div>
    </div>
  );
}
