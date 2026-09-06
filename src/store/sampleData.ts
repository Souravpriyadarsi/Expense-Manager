import { addDays, format, startOfMonth, subMonths } from "date-fns";
import type { Entry, EntryDraft } from "../types";

/**
 * A few months of realistic-looking entries so the dashboard and reports
 * are not empty on first launch. Users can clear this from Settings.
 */
export function sampleEntries(): Entry[] {
  const out: Entry[] = [];
  const now = new Date();

  const push = (
    dayOffsetFromMonthStart: number,
    monthsAgo: number,
    d: Omit<EntryDraft, "date">,
  ) => {
    const base = startOfMonth(subMonths(now, monthsAgo));
    const date = format(addDays(base, dayOffsetFromMonthStart), "yyyy-MM-dd");
    out.push({
      ...d,
      date,
      id: `sample-${out.length}`,
      createdAt: new Date(date).toISOString(),
    });
  };

  for (let m = 3; m >= 0; m--) {
    push(0, m, {
      type: "income",
      amount: 185000,
      category: "Salary",
      description: "Monthly salary",
      method: "Bank transfer",
    });
    push(1, m, {
      type: "expense",
      amount: 32000,
      category: "Housing & Rent",
      description: "Apartment rent",
      method: "Bank transfer",
    });
    push(2, m, {
      type: "investment",
      amount: 25000,
      category: "Index Funds / ETF",
      description: "Nifty 50 SIP",
      method: "Zerodha",
    });
    push(3, m, {
      type: "investment",
      amount: 15000,
      category: "Mutual Funds",
      description: "Flexi-cap SIP",
      method: "Groww",
    });
    push(5, m, {
      type: "expense",
      amount: 8500 + m * 400,
      category: "Groceries",
      description: "Monthly grocery run",
      method: "Credit card",
    });
    push(9, m, {
      type: "expense",
      amount: 3200,
      category: "Utilities & Bills",
      description: "Electricity + internet",
      method: "UPI",
    });
    push(12, m, {
      type: "expense",
      amount: 2400 + m * 200,
      category: "Dining & Takeout",
      description: "Weekend dinners",
      method: "Credit card",
    });
    push(15, m, {
      type: "expense",
      amount: 1499,
      category: "Subscriptions",
      description: "Streaming + music",
      method: "Credit card",
    });
    push(18, m, {
      type: "expense",
      amount: 4200,
      category: "Transport & Fuel",
      description: "Fuel and cabs",
      method: "UPI",
    });
    push(22, m, {
      type: "investment",
      amount: 10000,
      category: "Gold",
      description: "Digital gold",
      method: "Groww",
    });
    if (m % 2 === 0) {
      push(20, m, {
        type: "expense",
        amount: 12000,
        category: "Shopping",
        description: "Clothing and home",
        method: "Credit card",
      });
    }
    push(25, m, {
      type: "income",
      amount: 6500,
      category: "Dividends",
      description: "Quarterly dividends",
      method: "Bank transfer",
    });
  }

  // A couple of one-off larger expenses
  push(8, 2, {
    type: "expense",
    amount: 48000,
    category: "Travel",
    description: "Weekend trip - flights & stay",
    method: "Credit card",
  });
  push(14, 1, {
    type: "expense",
    amount: 22000,
    category: "Health & Medical",
    description: "Annual health check-up",
    method: "Credit card",
  });

  return out;
}
