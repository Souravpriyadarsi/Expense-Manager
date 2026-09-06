import { format, parseISO } from "date-fns";

export function formatCurrency(
  amount: number,
  currency: string,
  opts: { compact?: boolean } = {},
): string {
  const abs = Math.abs(amount);
  let body: string;

  if (opts.compact && abs >= 1000) {
    if (abs >= 1_00_00_000) body = (abs / 1_00_00_000).toFixed(2) + "Cr";
    else if (abs >= 1_00_000) body = (abs / 1_00_000).toFixed(2) + "L";
    else body = (abs / 1000).toFixed(1) + "k";
  } else {
    body = abs.toLocaleString(undefined, {
      minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  }

  return `${amount < 0 ? "-" : ""}${currency}${body}`;
}

export function formatDate(iso: string, pattern = "d MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthLabel(key: string): string {
  try {
    return format(parseISO(`${key}-01`), "MMMM yyyy");
  } catch {
    return key;
  }
}

export function shortMonthLabel(key: string): string {
  try {
    return format(parseISO(`${key}-01`), "MMM");
  } catch {
    return key;
  }
}
