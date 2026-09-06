export type EntryType = "expense" | "investment" | "income";

export interface Entry {
  id: string;
  type: EntryType;
  /** Always stored as a positive number. */
  amount: number;
  category: string;
  description: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** Payment method, account, or platform. Optional. */
  method?: string;
  note?: string;
  createdAt: string;
}

export type EntryDraft = Omit<Entry, "id" | "createdAt">;

export interface Settings {
  currency: string;
}
