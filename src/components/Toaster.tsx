"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";

// ---------------------------------------------------------------------------
// Types & context
// ---------------------------------------------------------------------------

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastCtx = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

const STYLES: Record<ToastType, string> = {
  success: "border-green-500/40 bg-green-500/15 text-green-100",
  error:   "border-red-500/40   bg-red-500/15   text-red-100",
  info:    "border-brand/40     bg-brand/15     text-blue-100",
};

function ToastEl({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Tiny delay so the enter transition actually fires
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl transition-all duration-300 ${STYLES[item.type]} ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
    >
      <span className="mt-0.5 shrink-0">{ICONS[item.type]}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="mt-0.5 shrink-0 opacity-50 transition-opacity hover:opacity-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider — wrap the app once in layout.tsx
// ---------------------------------------------------------------------------

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      // Cap at 5 toasts at once
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Sits above mobile action bar (bottom-24) on phones, near edge on desktop */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-24 right-3 z-[200] flex w-80 max-w-[calc(100vw-1.5rem)] flex-col-reverse gap-2 sm:bottom-6 sm:right-4"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastEl item={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
