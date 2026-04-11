"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

type ToastType = "warn" | "success" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  detail?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isWarn = toast.type === "warn";
  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "relative flex items-start gap-3 rounded-xl border p-4 shadow-lg min-w-[320px] max-w-[420px]",
        "animate-[slideIn_0.3s_ease-out]",
        isWarn
          ? "border-yellow-200 bg-yellow-100"
          : isSuccess
            ? "border-green-200 bg-green-50"
            : "border-border bg-surface-0",
      ].join(" ")}
      style={
        isWarn
          ? {
              boxShadow: "var(--p-toast-warn-shadow)",
            }
          : undefined
      }
    >
      <div className="shrink-0 mt-0.5">
        {isWarn && (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {isSuccess && (
          <svg
            className="w-5 h-5 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-sm font-semibold",
            isWarn ? "text-yellow-600" : isSuccess ? "text-green-700" : "text-surface-700",
          ].join(" ")}
        >
          {toast.title}
        </p>
        {toast.detail && (
          <p className="text-sm text-surface-700 mt-1">{toast.detail}</p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className={[
          "shrink-0 p-1 rounded-lg transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-yellow-600",
          isWarn
            ? "hover:bg-yellow-200 text-yellow-600"
            : "hover:bg-surface-50 text-surface-700",
        ].join(" ")}
        aria-label="Close"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, detail?: string) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, type, title, detail }]);
    },
    []
  );

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
}
