import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: ReactNode;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        {accent && <span className="dot" style={{ background: accent }} />}
        <span className="text-[12px] font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
      </div>
      <div className="mt-2 text-[22px] font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      {sub && <div className="mt-1 text-[12.5px] text-muted">{sub}</div>}
    </div>
  );
}
