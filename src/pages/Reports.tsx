import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useExpenseStore } from "../store/useExpenseStore";
import { useToastStore } from "../store/useToastStore";
import type { Entry, EntryType } from "../types";
import {
  filterByRange,
  groupByCategory,
  RANGE_OPTIONS,
  topEntries,
  totalsByType,
  type RangeKey,
} from "../lib/analytics";
import { formatCurrency, formatDate } from "../lib/format";
import { TYPE_META } from "../lib/categories";
import EntryRow from "../components/EntryRow";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EntryForm from "../components/EntryForm";
import { CategoryDonut, ChartLegend } from "../components/charts";
import Select from "../components/Select";

type Tab = "expenses" | "investments" | "biggest" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "expenses", label: "Expenses by category" },
  { key: "investments", label: "Investments" },
  { key: "biggest", label: "Biggest expenses" },
  { key: "all", label: "All transactions" },
];

export default function Reports() {
  const entries = useExpenseStore((s) => s.entries);
  const currency = useExpenseStore((s) => s.currency);
  const updateEntry = useExpenseStore((s) => s.updateEntry);
  const deleteEntry = useExpenseStore((s) => s.deleteEntry);
  const notify = useToastStore((s) => s.notify);

  const [range, setRange] = useState<RangeKey>("thisMonth");
  const [tab, setTab] = useState<Tab>("expenses");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);

  const scoped = useMemo(
    () => filterByRange(entries, range),
    [entries, range],
  );
  const totals = useMemo(() => totalsByType(scoped), [scoped]);

  const rowActions = {
    onEdit: setEditing,
    onDelete: setPendingDelete,
  };

  return (
    <>
      <h1 className="text-[19px] font-semibold tracking-tight">Reports</h1>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className="btn seg-btn py-1.5! px-3! text-[12.5px]!"
            data-active={range === r.key}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Summary label="Expenses" value={formatCurrency(totals.expense, currency, { compact: true })} color={TYPE_META.expense.color} />
        <Summary label="Investments" value={formatCurrency(totals.investment, currency, { compact: true })} color={TYPE_META.investment.color} />
        <Summary label="Income" value={formatCurrency(totals.income, currency, { compact: true })} color={TYPE_META.income.color} />
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="tab whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors"
            data-active={tab === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "expenses" && (
          <CategoryBreakdown entries={scoped} type="expense" currency={currency} {...rowActions} />
        )}
        {tab === "investments" && (
          <InvestmentsView entries={scoped} currency={currency} {...rowActions} />
        )}
        {tab === "biggest" && (
          <BiggestExpenses entries={scoped} currency={currency} {...rowActions} />
        )}
        {tab === "all" && (
          <AllTransactions entries={scoped} currency={currency} {...rowActions} />
        )}
      </div>

      <Modal
        open={!!editing}
        title="Edit entry"
        onClose={() => setEditing(null)}
        width={480}
      >
        {editing && (
          <EntryForm
            initial={editing}
            submitLabel="Save changes"
            onCancel={() => setEditing(null)}
            onSubmit={(draft) => {
              updateEntry(editing.id, draft);
              setEditing(null);
              notify("Entry updated", "success");
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete entry?"
        message={
          pendingDelete
            ? `Remove "${pendingDelete.description || pendingDelete.category}" (${formatCurrency(pendingDelete.amount, currency)})? This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteEntry(pendingDelete.id);
            notify("Entry deleted");
          }
          setPendingDelete(null);
        }}
      />
    </>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-wide text-muted">
        <span className="dot" style={{ background: color }} />
        {label}
      </div>
      <div className="mt-1 text-[17px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

interface ViewProps {
  entries: Entry[];
  currency: string;
  onEdit: (e: Entry) => void;
  onDelete: (e: Entry) => void;
}

function CategoryBreakdown({
  entries,
  type,
  currency,
  onEdit,
  onDelete,
}: ViewProps & { type: EntryType }) {
  const groups = useMemo(() => groupByCategory(entries, type), [entries, type]);
  const total = groups.reduce((s, g) => s + g.total, 0);
  const max = groups[0]?.total ?? 1;
  const [open, setOpen] = useState<string | null>(null);

  if (groups.length === 0) {
    return (
      <div className="card">
        <EmptyState title="No expenses in this period" hint="Try a wider date range, or add some entries." />
      </div>
    );
  }

  return (
    <div className="card divide-y divide-line">
      {groups.map((g) => {
        const isOpen = open === g.category;
        return (
          <div key={g.category}>
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
              onClick={() => setOpen(isOpen ? null : g.category)}
            >
              <ChevronDown
                size={15}
                className="shrink-0 text-faint transition-transform duration-150"
                style={{ transform: isOpen ? "none" : "rotate(-90deg)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-medium truncate">{g.category}</span>
                  <span className="tabular-nums text-[13.5px] font-semibold">
                    {formatCurrency(g.total, currency)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(g.total / max) * 100}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-[11.5px] w-16 text-right text-muted">
                    {Math.round((g.total / total) * 100)}% · {g.count}
                  </span>
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-2 pl-11 divide-y divide-line">
                {g.entries.map((e) => (
                  <EntryRow key={e.id} entry={e} currency={currency} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InvestmentsView({ entries, currency, onEdit, onDelete }: ViewProps) {
  const groups = useMemo(() => groupByCategory(entries, "investment"), [entries]);
  const total = groups.reduce((s, g) => s + g.total, 0);
  const slices = groups.map((g) => ({ name: g.category, value: g.total }));

  if (groups.length === 0) {
    return (
      <div className="card">
        <EmptyState title="No investments in this period" hint="Log a contribution from the Add Entry page." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="card p-4">
        <h3 className="font-semibold">Allocation</h3>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <CategoryDonut
            data={slices}
            currency={currency}
            centerLabel="Invested"
            centerValue={formatCurrency(total, currency, { compact: true })}
          />
          <ChartLegend data={slices} currency={currency} />
        </div>
      </div>
      <div className="card divide-y divide-line">
        {groups.map((g) => (
          <details key={g.category} className="group">
            <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 list-none">
              <span className="text-[13.5px] font-medium">{g.category}</span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums text-[13.5px] font-semibold">
                  {formatCurrency(g.total, currency)}
                </span>
                <span className="chip">{Math.round((g.total / total) * 100)}%</span>
              </span>
            </summary>
            <div className="px-4 pb-2 divide-y divide-line">
              {g.entries.map((e) => (
                <EntryRow key={e.id} entry={e} currency={currency} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function BiggestExpenses({ entries, currency, onEdit, onDelete }: ViewProps) {
  const top = useMemo(() => topEntries(entries, "expense", 15), [entries]);
  const total = entries
    .filter((e) => e.type === "expense")
    .reduce((s, e) => s + e.amount, 0);

  if (top.length === 0) {
    return (
      <div className="card">
        <EmptyState title="No expenses in this period" />
      </div>
    );
  }

  return (
    <div className="card divide-y divide-line">
      {top.map((e, i) => (
        <div key={e.id} className="flex items-center gap-3 px-4">
          <span className="tabular-nums text-[12px] w-4 text-faint">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <EntryRow entry={e} currency={currency} onEdit={onEdit} onDelete={onDelete} />
          </div>
          <span className="tabular-nums text-[11.5px] w-10 text-right text-muted">
            {total ? Math.round((e.amount / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function AllTransactions({ entries, currency, onEdit, onDelete }: ViewProps) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<EntryType | "all">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (!needle) return true;
      return (
        e.description.toLowerCase().includes(needle) ||
        e.category.toLowerCase().includes(needle) ||
        (e.method ?? "").toLowerCase().includes(needle)
      );
    });
  }, [entries, q, type]);

  const sum = filtered.reduce(
    (s, e) => s + (e.type === "income" ? e.amount : -e.amount),
    0,
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          className="input flex-1 min-w-45"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          placeholder="Search description, category, account…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          className="w-40"
          ariaLabel="Filter by type"
          value={type}
          onChange={(v) => setType(v as EntryType | "all")}
          options={[
            { value: "all", label: "All types" },
            { value: "expense", label: "Expenses" },
            { value: "investment", label: "Investments" },
            { value: "income", label: "Income" },
          ]}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
        <span>{filtered.length} entries</span>
        <span className="tabular-nums">Net {formatCurrency(sum, currency)}</span>
      </div>

      <div className="card mt-2 divide-y divide-line">
        {filtered.length === 0 ? (
          <EmptyState title="Nothing matches" hint="Adjust your search or filters." />
        ) : (
          groupByDate(filtered).map(([date, list]) => (
            <div key={date} className="px-4 py-1">
              <div className="pt-2 pb-1 text-[11.5px] font-medium uppercase tracking-wide text-faint">
                {formatDate(date, "EEEE, d MMM yyyy")}
              </div>
              <div className="divide-y divide-line">
                {list.map((e) => (
                  <EntryRow key={e.id} entry={e} currency={currency} showDate={false} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function groupByDate(entries: Entry[]): [string, Entry[]][] {
  const map = new Map<string, Entry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}
