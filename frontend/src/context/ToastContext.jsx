import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    // 4 second baad apne aap gayab ho jaayega
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-2 rounded-xl border border-surface-border bg-surface-card p-3 shadow-lg"
          >
            {toast.type === "error" ? (
              <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-400" />
            )}
            <p className="flex-1 text-sm text-gray-200">{toast.message}</p>
            <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-300">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
