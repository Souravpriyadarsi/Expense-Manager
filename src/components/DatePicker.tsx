import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface Props {
  value: string;
  onChange: (iso: string) => void;
  id?: string;
  max?: string;
  min?: string;
}

/**
 * Theme-aware date picker. Chrome's native <input type="date"> calendar popup
 * is a closed shadow tree we can't style, so we render our own.
 */
export default function DatePicker({ value, onChange, id, max, min }: Props) {
  const selected = useMemo(() => (value ? parseISO(value) : null), [value]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(selected ?? new Date());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const maxDate = max ? parseISO(max) : null;
  const minDate = min ? parseISO(min) : null;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(view), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(view), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [view]);

  const isDisabled = (d: Date) =>
    (maxDate != null && isAfter(d, maxDate)) ||
    (minDate != null && isBefore(d, minDate));

  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
    } else {
      setView(selected ?? new Date());
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        className="input flex cursor-pointer items-center justify-between text-left"
        onClick={toggle}
      >
        <span className={selected ? "text-ink" : "text-faint"}>
          {selected ? format(selected, "d MMM yyyy") : "Select a date"}
        </span>
        <CalIcon size={15} className="shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 card p-3 w-64.5 shadow-elevated">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="btn btn-ghost p-1.5!"
              onClick={() => setView((v) => addMonths(v, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[13px] font-semibold">
              {format(view, "MMMM yyyy")}
            </span>
            <button
              type="button"
              className="btn btn-ghost p-1.5!"
              onClick={() => setView((v) => addMonths(v, 1))}
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="text-center text-[11px] font-medium text-faint"
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((d) => {
              const iso = format(d, "yyyy-MM-dd");
              return (
                <button
                  key={iso}
                  type="button"
                  className="cal-day"
                  disabled={isDisabled(d)}
                  data-outside={!isSameMonth(d, view)}
                  data-today={isToday(d)}
                  data-selected={selected ? isSameDay(d, selected) : false}
                  onClick={() => pick(iso)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-end border-t border-line pt-2">
            <button
              type="button"
              className="text-[12px] font-medium text-accent-strong"
              onClick={() => {
                const t = new Date();
                if (!isDisabled(t)) pick(format(t, "yyyy-MM-dd"));
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
