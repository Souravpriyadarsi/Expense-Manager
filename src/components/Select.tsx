import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: (Option | string)[];
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
}

function normalize(o: Option | string): Option {
  return typeof o === "string" ? { value: o, label: o } : o;
}

/**
 * A theme-aware replacement for a native <select>. The browser's native
 * option popup can't be styled (the highlight stays OS-blue), so we render
 * our own listbox that follows the app's design tokens.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
  ariaLabel,
  className = "",
}: Props) {
  const opts = options.map(normalize);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = opts.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openMenu() {
    const idx = opts.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function choose(v: string) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, opts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (opts[active]) choose(opts[active].value);
    } else if (e.key === "Home") {
      setActive(0);
    } else if (e.key === "End") {
      setActive(opts.length - 1);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        className="select text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? "text-ink" : "text-faint"}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          id={listId}
          tabIndex={-1}
          className="absolute z-30 mt-1 w-full max-h-66 overflow-y-auto py-1 card shadow-elevated"
        >
          {opts.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o.value)}
                className="opt flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-[13px]"
                data-selected={isSelected}
                data-active={i === active}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
