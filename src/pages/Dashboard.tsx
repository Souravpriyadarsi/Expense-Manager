import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useExpenseStore } from "../store/useExpenseStore";
import {
  filterByMonth,
  groupByCategory,
  listMonthKeys,
  monthlySeries,
  topEntries,
  totalsByType,
} from "../lib/analytics";
import { formatCurrency, monthLabel } from "../lib/format";
import { TYPE_META } from "../lib/categories";
import StatCard from "../components/StatCard";
import EntryRow from "../components/EntryRow";
import EmptyState from "../components/EmptyState";
import { CategoryDonut, ChartLegend, MoneyTooltip } from "../components/charts";

export default function Dashboard() {
  const entries = useExpenseStore((s) => s.entries);
  const currency = useExpenseStore((s) => s.currency);

  const months = useMemo(() => listMonthKeys(entries), [entries]);
  const [monthIdx, setMonthIdx] = useState(0);
  const month = months[Math.min(monthIdx, months.length - 1)] ?? months[0];

  const monthEntries = useMemo(
    () => filterByMonth(entries, month),
    [entries, month],
  );
  const totals = useMemo(() => totalsByType(monthEntries), [monthEntries]);
  const net = totals.income - totals.expense - totals.investment;
  const savingsRate =
    totals.income > 0
      ? Math.round(((totals.investment + Math.max(net, 0)) / totals.income) * 100)
      : 0;

  const catData = useMemo(
    () =>
      groupByCategory(monthEntries, "expense").map((g) => ({
        name: g.category,
        value: g.total,
      })),
    [monthEntries],
  );

  const trend = useMemo(
    () => monthlySeries(entries, 6, new Date(`${month}-01T00:00:00`)),
    [entries, month],
  );

  const topExp = useMemo(
    () => topEntries(monthEntries, "expense", 5),
    [monthEntries],
  );
  const recent = useMemo(
    () => [...monthEntries].slice(0, 6),
    [monthEntries],
  );

  if (entries.length === 0) {
    return (
      <>
        <PageTitle month={month} months={months} monthIdx={monthIdx} setMonthIdx={setMonthIdx} />
        <div className="card mt-4">
          <EmptyState
            title="No entries yet"
            hint="Add your first expense, investment, or income to see your dashboard come to life."
            action={
              <Link to="/add" className="btn btn-primary">
                Add an entry
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle month={month} months={months} monthIdx={monthIdx} setMonthIdx={setMonthIdx} />

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Income"
          value={formatCurrency(totals.income, currency, { compact: true })}
          accent={TYPE_META.income.color}
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(totals.expense, currency, { compact: true })}
          accent={TYPE_META.expense.color}
        />
        <StatCard
          label="Investments"
          value={formatCurrency(totals.investment, currency, { compact: true })}
          accent={TYPE_META.investment.color}
        />
        <StatCard
          label="Net cash flow"
          value={formatCurrency(net, currency, { compact: true })}
          sub={`${savingsRate}% of income saved / invested`}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card p-4">
          <h3 className="font-semibold">Spending by category</h3>
          {catData.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-muted">
              No expenses recorded this month.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <CategoryDonut
                data={catData}
                currency={currency}
                centerLabel="Total"
                centerValue={formatCurrency(totals.expense, currency, { compact: true })}
              />
              <ChartLegend data={catData.slice(0, 7)} currency={currency} />
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Last 6 months</h3>
          <div className="mt-3 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barGap={2} barCategoryGap="22%">
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickFormatter={(v) => formatCurrency(v, currency, { compact: true })}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-hover)" }}
                  content={<MoneyTooltip currency={currency} />}
                />
                <Bar dataKey="income" name="Income" fill={TYPE_META.income.color} radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill={TYPE_META.expense.color} radius={[3, 3, 0, 0]} />
                <Bar dataKey="investment" name="Investments" fill={TYPE_META.investment.color} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Legend />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Biggest expenses</h3>
            <Link
              to="/reports"
              className="text-[12.5px] flex items-center gap-1 text-accent-strong"
            >
              Reports <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-1 divide-y divide-line">
            {topExp.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted">
                Nothing here yet.
              </p>
            ) : (
              topExp.map((e) => (
                <EntryRow key={e.id} entry={e} currency={currency} showDate={false} />
              ))
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent activity</h3>
            <Link
              to="/add"
              className="text-[12.5px] flex items-center gap-1 text-accent-strong"
            >
              Add entry <ArrowRight size={13} />
            </Link>
          </div>
          <div className="mt-1 divide-y divide-line">
            {recent.map((e) => (
              <EntryRow key={e.id} entry={e} currency={currency} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {(["income", "expense", "investment"] as const).map((t) => (
        <span key={t} className="flex items-center gap-1.5 text-[12px] text-muted">
          <span className="dot" style={{ background: TYPE_META[t].color }} />
          {TYPE_META[t].label}
        </span>
      ))}
    </div>
  );
}

function PageTitle({
  month,
  months,
  monthIdx,
  setMonthIdx,
}: {
  month: string;
  months: string[];
  monthIdx: number;
  setMonthIdx: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h1 className="text-[19px] font-semibold tracking-tight">Dashboard</h1>
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost p-1.5!"
          onClick={() => setMonthIdx(Math.min(monthIdx + 1, months.length - 1))}
          disabled={monthIdx >= months.length - 1}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[130px] text-center text-[13.5px] font-medium">
          {monthLabel(month)}
        </span>
        <button
          className="btn btn-ghost p-1.5!"
          onClick={() => setMonthIdx(Math.max(monthIdx - 1, 0))}
          disabled={monthIdx <= 0}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
