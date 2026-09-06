import type { EntryType } from "../types";

export const TYPE_META: Record<
  EntryType,
  { label: string; color: string; noun: string }
> = {
  expense: { label: "Expense", color: "var(--expense)", noun: "spent" },
  investment: {
    label: "Investment",
    color: "var(--investment)",
    noun: "invested",
  },
  income: { label: "Income", color: "var(--income)", noun: "earned" },
};

export const CATEGORIES: Record<EntryType, string[]> = {
  expense: [
    "Housing & Rent",
    "Groceries",
    "Dining & Takeout",
    "Transport & Fuel",
    "Utilities & Bills",
    "Health & Medical",
    "Shopping",
    "Entertainment",
    "Travel",
    "Education",
    "Subscriptions",
    "Insurance",
    "Loan / EMI",
    "Family & Gifts",
    "Other",
  ],
  investment: [
    "Stocks",
    "Mutual Funds",
    "Index Funds / ETF",
    "Crypto",
    "Bonds",
    "Real Estate",
    "Gold",
    "Retirement / PF",
    "Fixed Deposit",
    "Emergency Fund",
    "Other",
  ],
  income: [
    "Salary",
    "Freelance",
    "Business",
    "Bonus",
    "Dividends",
    "Interest",
    "Rental Income",
    "Refund / Reimbursement",
    "Gift",
    "Other",
  ],
};

/** Restrained qualitative palette for charts — no purples. */
export const CHART_COLORS = [
  "#d97706",
  "#0d9488",
  "#2563eb",
  "#65a30d",
  "#b45309",
  "#0891b2",
  "#4b5563",
  "#a16207",
  "#15803d",
  "#c2410c",
  "#0e7490",
  "#525252",
];
