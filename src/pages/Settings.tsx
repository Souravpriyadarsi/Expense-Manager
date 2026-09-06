import { useRef, useState } from "react";
import { FileDown, FileUp, Database, Trash2 } from "lucide-react";
import { useExpenseStore } from "../store/useExpenseStore";
import { useToastStore } from "../store/useToastStore";
import {
  exportBackup,
  importBackup,
  importBackupViaPicker,
} from "../lib/storage";
import ConfirmDialog from "../components/ConfirmDialog";

const CURRENCIES = ["₹", "$", "€", "£", "¥", "A$", "C$", "₩", "₽", "R$"];

export default function Settings() {
  const entries = useExpenseStore((s) => s.entries);
  const currency = useExpenseStore((s) => s.currency);
  const setCurrency = useExpenseStore((s) => s.setCurrency);
  const clearAll = useExpenseStore((s) => s.clearAll);
  const loadSampleData = useExpenseStore((s) => s.loadSampleData);
  const notify = useToastStore((s) => s.notify);

  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  async function onExport() {
    try {
      const how = await exportBackup();
      notify(how === "saved" ? "Backup saved" : "Backup downloaded", "success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      notify("Export failed", "error");
    }
  }

  async function onImportClick() {
    try {
      const result = await importBackupViaPicker();
      if (result.status === "unsupported") {
        // Only fall back to the hidden <input> when there's no native picker.
        fileRef.current?.click();
      } else if (result.status === "ok") {
        notify(`Restored ${result.count} entries`, "success");
      }
      // "cancelled" — user dismissed the dialog, do nothing.
    } catch (err) {
      notify(err instanceof Error ? err.message : "Import failed", "error");
    }
  }

  async function onImportFile(file: File) {
    try {
      const count = await importBackup(file);
      notify(`Restored ${count} entries`, "success");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Import failed", "error");
    }
  }

  return (
    <>
      <h1 className="text-[19px] font-semibold tracking-tight">Settings</h1>

      <div className="mt-4 flex flex-col gap-3 max-w-xl">
        <section className="card p-4">
          <h3 className="font-semibold">Currency</h3>
          <p className="mt-1 text-[13px] text-muted">
            Used as a display symbol across the app.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  notify(`Currency set to ${c}`);
                }}
                className="btn seg-btn py-1.5! px-3! tabular-nums"
                data-active={currency === c}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <h3 className="font-semibold">Data</h3>
          <p className="mt-1 text-[13px] text-muted">
            Everything is stored locally in this browser ({entries.length}{" "}
            entries). Export writes a <code>.json</code> file you can keep
            anywhere and restore later.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn" onClick={onExport}>
              <FileUp size={15} /> Export backup (.json)
            </button>
            <button className="btn" onClick={onImportClick}>
              <FileDown size={15} /> Import backup
            </button>
            <button
              className="btn"
              onClick={() => {
                loadSampleData();
                notify("Sample data added", "success");
              }}
            >
              <Database size={15} /> Add sample data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        <section className="card p-4">
          <h3 className="font-semibold text-expense">Danger zone</h3>
          <p className="mt-1 text-[13px] text-muted">
            Permanently delete every entry. Export a backup first if unsure.
          </p>
          <button
            className="btn btn-danger mt-3"
            onClick={() => setConfirmClear(true)}
          >
            <Trash2 size={15} /> Delete all data
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Delete all data?"
        message="This removes every expense, investment, and income entry from this browser. It can't be undone."
        confirmLabel="Delete everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
          notify("All data deleted");
        }}
      />
    </>
  );
}
