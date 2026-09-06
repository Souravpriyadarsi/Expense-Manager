import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Entry, EntryDraft } from "../types";
import { sampleEntries } from "./sampleData";

export const STORAGE_KEY = "expense-manager-storage";

interface ExpenseState {
  entries: Entry[];
  currency: string;

  addEntry: (draft: EntryDraft) => Entry;
  updateEntry: (id: string, draft: EntryDraft) => void;
  deleteEntry: (id: string) => void;
  setCurrency: (currency: string) => void;
  clearAll: () => void;
  loadSampleData: () => void;
  replaceAll: (entries: Entry[], currency?: string) => void;
}

function makeId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

const sortByDate = (a: Entry, b: Entry) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set) => ({
      entries: [],
      currency: "₹",

      addEntry: (draft) => {
        const entry: Entry = {
          ...draft,
          id: makeId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ entries: [entry, ...s.entries].sort(sortByDate) }));
        return entry;
      },

      updateEntry: (id, draft) =>
        set((s) => ({
          entries: s.entries
            .map((e) => (e.id === id ? { ...e, ...draft } : e))
            .sort(sortByDate),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      setCurrency: (currency) => set({ currency }),

      clearAll: () => set({ entries: [] }),

      loadSampleData: () =>
        set((s) => ({ entries: [...sampleEntries(), ...s.entries].sort(sortByDate) })),

      replaceAll: (entries, currency) =>
        set((s) => ({
          entries: [...entries].sort(sortByDate),
          currency: currency ?? s.currency,
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      // v1 shipped with seeded "sample-*" entries. Drop those on upgrade so
      // the app starts empty; any real entries the user added are kept.
      migrate: (state, from) => {
        const s = state as ExpenseState;
        if (from < 2 && Array.isArray(s?.entries)) {
          return {
            ...s,
            entries: s.entries.filter((e) => !e.id.startsWith("sample-")),
          };
        }
        return s;
      },
    },
  ),
);
