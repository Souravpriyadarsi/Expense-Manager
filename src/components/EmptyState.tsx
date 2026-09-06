import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export default function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full mb-1 bg-surface-2">
        <Inbox size={20} className="text-faint" />
      </div>
      <p className="font-medium">{title}</p>
      {hint && (
        <p className="text-[13px] max-w-xs text-muted">{hint}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
