import type { Entry } from "../types";
import { useExpenseStore } from "../store/useExpenseStore";

const BACKUP_VERSION = 1;
const APP = "ExpenseManager";

interface Backup {
  app: string;
  version: number;
  exportedAt: string;
  currency: string;
  entries: Entry[];
}

function defaultFileName() {
  return `expense-manager-${new Date().toISOString().split("T")[0]}.json`;
}

// The File System Access API lets the user pick a real folder + filename.
// Available in Chrome/Edge; we fall back to a normal download elsewhere.
interface FsWindow {
  showSaveFilePicker?: (opts: unknown) => Promise<{
    createWritable: () => Promise<{
      write: (data: string) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
  showOpenFilePicker?: (opts: unknown) => Promise<
    { getFile: () => Promise<File> }[]
  >;
}

/** Writes the whole store to a .json file the user chooses (or downloads it). */
export async function exportBackup(): Promise<"saved" | "downloaded"> {
  const { entries, currency } = useExpenseStore.getState();
  const backup: Backup = {
    app: APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    currency,
    entries,
  };
  const json = JSON.stringify(backup, null, 2);
  const fs = window as unknown as FsWindow;

  if (fs.showSaveFilePicker) {
    try {
      const handle = await fs.showSaveFilePicker({
        suggestedName: defaultFileName(),
        types: [
          {
            description: "JSON backup",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return "saved";
    } catch (err) {
      // User cancelled the picker — treat as a no-op, don't fall through.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
      // Any other failure: fall back to a download.
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = defaultFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}

function parseBackup(text: string) {
  const backup = JSON.parse(text) as Partial<Backup>;
  if (backup.app !== APP) {
    throw new Error("This file is not an Expense Manager backup.");
  }
  if (!Array.isArray(backup.entries)) {
    throw new Error("Backup contains no entries.");
  }
  useExpenseStore
    .getState()
    .replaceAll(backup.entries as Entry[], backup.currency);
  return backup.entries.length;
}

/** Restores from a File (chosen via <input type=file>). */
export async function importBackup(file: File) {
  return parseBackup(await file.text());
}

export type PickerResult =
  | { status: "ok"; count: number }
  | { status: "cancelled" }
  | { status: "unsupported" };

/** Restores using the native file picker when available. */
export async function importBackupViaPicker(): Promise<PickerResult> {
  const fs = window as unknown as FsWindow;
  if (!fs.showOpenFilePicker) return { status: "unsupported" };
  try {
    const [handle] = await fs.showOpenFilePicker({
      types: [
        { description: "JSON backup", accept: { "application/json": [".json"] } },
      ],
      multiple: false,
    });
    const file = await handle.getFile();
    return { status: "ok", count: parseBackup(await file.text()) };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { status: "cancelled" };
    }
    throw err;
  }
}
