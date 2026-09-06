import { useMemo, useState } from "react";
import type { Entry, EntryDraft, EntryType } from "../types";
import { CATEGORIES, TYPE_META } from "../lib/categories";
import { todayISO } from "../lib/format";
import Select from "./Select";
import DatePicker from "./DatePicker";

const TYPES: EntryType[] = ["expense", "investment", "income"];

const METHOD_LABEL: Record<EntryType, string> = {
  expense: "Paid with",
  investment: "Platform / account",
  income: "Source / account",
};

interface Props {
  initial?: Entry;
  submitLabel?: string;
  onSubmit: (draft: EntryDraft) => void;
  onCancel?: () => void;
}

export default function EntryForm({
  initial,
  submitLabel = "Save entry",
  onSubmit,
  onCancel,
}: Props) {
  const [type, setType] = useState<EntryType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : "",
  );
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [method, setMethod] = useState(initial?.method ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");

  const categoryOptions = useMemo(() => CATEGORIES[type], [type]);

  function pickType(next: EntryType) {
    setType(next);
    if (category && !CATEGORIES[next].includes(category)) setCategory("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return setError("Enter an amount greater than zero.");
    if (!category) return setError("Pick a category.");
    if (!date) return setError("Pick a date.");
    setError("");

    onSubmit({
      type,
      amount: Math.round(value * 100) / 100,
      category,
      description: description.trim(),
      date,
      method: method.trim() || undefined,
      note: note.trim() || undefined,
    });

    if (!initial) {
      setAmount("");
      setDescription("");
      setNote("");
      // keep type, date, category, method for fast repeat entry
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4"
      autoComplete="off"
      // stop browser history + password-manager popups on these fields
      data-1p-ignore
      data-lpignore="true"
    >
      <div className="grid grid-cols-3 gap-1.5 rounded-lg p-1 bg-surface-2">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => pickType(t)}
            className="type-btn flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px] font-medium transition-colors"
            data-active={t === type}
          >
            <span className="dot" style={{ background: TYPE_META[t].color }} />
            {TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="amount">Amount</label>
          <input
            id="amount"
            className="input tabular-nums"
            inputMode="decimal"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus={!initial}
          />
        </div>
        <div>
          <label className="label" htmlFor="date">Date</label>
          <DatePicker id="date" value={date} max={todayISO()} onChange={setDate} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="category">Category</label>
        <Select
          id="category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="Select a category…"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <input
          id="description"
          className="input"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          placeholder="e.g. Weekly groceries at the market"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="method">{METHOD_LABEL[type]}</label>
        <input
          id="method"
          className="input"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          placeholder="Optional"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="note">Note</label>
        <textarea
          id="note"
          className="textarea"
          autoComplete="off"
          placeholder="Optional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && <p className="text-[12.5px] text-expense">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
