import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center">
      <AlertTriangle className="mb-3 text-red-400" size={32} />
      <p className="max-w-sm text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-surface-border px-4 py-1.5 text-sm text-gray-200 hover:border-brand-500"
        >
          <RotateCcw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
