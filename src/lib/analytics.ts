import { format, subMonths } from "date-fns";
import type { Entry, EntryType } from "../types";
import { monthKey, shortMonthLabel } from "./format";

export type RangeKey =
  | "thisMonth"
  | "lastMonth"
  | "last3"
  | "thisYear"
  | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "last3", label: "Last 3 months" },
  { key: "thisYear", label: "This year" },
  { key: "all", label: "All time" },
];

export function filterByRange(entries: Entry[], range: RangeKey): Entry[] {
  const now = new Date();
  const thisMonth = monthKey(format(now, "yyyy-MM-dd"));

  switch (range) {
    case "thisMonth":
      return entries.filter((e) => monthKey(e.date) === thisMonth);
    case "lastMonth": {
      const k = monthKey(format(subMonths(now, 1), "yyyy-MM-dd"));
      return entries.filter((e) => monthKey(e.date) === k);
    }
    case "last3": {
      const cutoff = format(subMonths(now, 3), "yyyy-MM-dd");
      return entries.filter((e) => e.date >= cutoff);
    }
    case "thisYear": {
      const year = format(now, "yyyy");
      return entries.filter((e) => e.date.startsWith(year));
    }
    case "all":
    default:
      return entries;
  }
}

export function filterByMonth(entries: Entry[], key: string): Entry[] {
  return entries.filter((e) => monthKey(e.date) === key);
}

export function totalsByType(entries: Entry[]): Record<EntryType, number> {
  const totals: Record<EntryType, number> = {
    expense: 0,
    investment: 0,
    income: 0,
  };
  for (const e of entries) totals[e.type] += e.amount;
  return totals;
}

export interface CategoryGroup {
  category: string;
  total: number;
  count: number;
  entries: Entry[];
}

export function groupByCategory(
  entries: Entry[],
  type: EntryType,
): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();
  for (const e of entries) {
    if (e.type !== type) continue;
    const g = map.get(e.category) ?? {
      category: e.category,
      total: 0,
      count: 0,
      entries: [],
    };
    g.total += e.amount;
    g.count += 1;
    g.entries.push(e);
    map.set(e.category, g);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function topEntries(
  entries: Entry[],
  type: EntryType,
  n: number,
): Entry[] {
  return entries
    .filter((e) => e.type === type)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}

export interface MonthPoint {
  key: string;
  label: string;
  expense: number;
  investment: number;
  income: number;
  net: number;
}

export function monthlySeries(
  entries: Entry[],
  monthsBack: number,
  endDate = new Date(),
): MonthPoint[] {
  const points: MonthPoint[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = subMonths(endDate, i);
    const key = format(d, "yyyy-MM");
    const monthEntries = filterByMonth(entries, key);
    const t = totalsByType(monthEntries);
    points.push({
      key,
      label: shortMonthLabel(key),
      expense: t.expense,
      investment: t.investment,
      income: t.income,
      net: t.income - t.expense - t.investment,
    });
  }
  return points;
}

export function listMonthKeys(entries: Entry[]): string[] {
  const set = new Set(entries.map((e) => monthKey(e.date)));
  set.add(format(new Date(), "yyyy-MM"));
  return [...set].sort((a, b) => b.localeCompare(a));
}
