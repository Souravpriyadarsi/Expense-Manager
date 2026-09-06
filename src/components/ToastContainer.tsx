import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useToastStore } from "../store/useToastStore";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  default: Info,
} as const;

const TONES = {
  success: "var(--investment)",
  error: "var(--expense)",
  default: "var(--text-muted)",
} as const;

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(320px,calc(100vw-2rem))]">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="card flex items-center gap-2.5 px-3.5 py-3 text-left text-[13px] shadow-elevated animate-in"
          >
            <Icon size={16} className="shrink-0" style={{ color: TONES[t.tone] }} />
            <span>{t.message}</span>
          </button>
        );
      })}
    </div>
  );
}
