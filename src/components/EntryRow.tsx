import { Pencil, Trash2 } from "lucide-react";
import type { Entry } from "../types";
import { TYPE_META } from "../lib/categories";
import { formatCurrency, formatDate } from "../lib/format";

interface Props {
  entry: Entry;
  currency: string;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
  showDate?: boolean;
}

export default function EntryRow({
  entry,
  currency,
  onEdit,
  onDelete,
  showDate = true,
}: Props) {
  const meta = TYPE_META[entry.type];
  return (
    <div className="group flex items-center gap-3 py-2.5">
      <span className="dot" style={{ background: meta.color }} title={meta.label} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-medium">
          {entry.description || entry.category}
        </div>
        <div className="truncate text-[12px] text-muted">
          {entry.category}
          {entry.method ? ` · ${entry.method}` : ""}
          {showDate ? ` · ${formatDate(entry.date)}` : ""}
        </div>
      </div>
      <div
        className={`tabular-nums text-[13.5px] font-semibold ${
          entry.type === "income" ? "text-income" : "text-ink"
        }`}
      >
        {entry.type === "income" ? "+" : ""}
        {formatCurrency(entry.amount, currency)}
      </div>
      {(onEdit || onDelete) && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              className="btn btn-ghost p-1.5!"
              onClick={() => onEdit(entry)}
              aria-label="Edit entry"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              className="btn btn-ghost btn-danger p-1.5!"
              onClick={() => onDelete(entry)}
              aria-label="Delete entry"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
