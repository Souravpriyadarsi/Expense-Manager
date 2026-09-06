import { useMemo, useState } from "react";
import { useExpenseStore } from "../store/useExpenseStore";
import { useToastStore } from "../store/useToastStore";
import EntryForm from "../components/EntryForm";
import EntryRow from "../components/EntryRow";
import ConfirmDialog from "../components/ConfirmDialog";
import type { Entry } from "../types";
import { formatCurrency } from "../lib/format";

export default function AddEntry() {
  const entries = useExpenseStore((s) => s.entries);
  const currency = useExpenseStore((s) => s.currency);
  const addEntry = useExpenseStore((s) => s.addEntry);
  const deleteEntry = useExpenseStore((s) => s.deleteEntry);
  const notify = useToastStore((s) => s.notify);

  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);

  const recent = useMemo(
    () =>
      [...entries]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [entries],
  );

  return (
    <>
      <h1 className="text-[19px] font-semibold tracking-tight">Add entry</h1>
      <p className="mt-1 text-[13px] text-muted">
        Record an expense, an investment, or income. The form stays open so you
        can add several in a row.
      </p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
        <div className="card p-4 sm:p-5">
          <EntryForm
            onSubmit={(draft) => {
              addEntry(draft);
              notify(
                `${formatCurrency(draft.amount, currency)} ${draft.type} added`,
                "success",
              );
            }}
          />
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Recently added</h3>
          <div className="mt-1 divide-y divide-line">
            {recent.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted">
                Nothing added yet.
              </p>
            ) : (
              recent.map((e) => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  currency={currency}
                  onDelete={setPendingDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

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
