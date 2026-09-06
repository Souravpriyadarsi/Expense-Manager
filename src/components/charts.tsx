import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "../lib/categories";
import { formatCurrency } from "../lib/format";

export interface Slice {
  name: string;
  value: number;
}

export function MoneyTooltip({
  active,
  payload,
  currency,
  total,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload?: { fill?: string } }[];
  currency: string;
  total?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-[12.5px] shadow-elevated">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          {p.payload?.fill && (
            <span className="dot" style={{ background: p.payload.fill }} />
          )}
          <span className="text-muted">{p.name}</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(p.value, currency)}
          </span>
          {total ? (
            <span className="text-faint">
              {Math.round((p.value / total) * 100)}%
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CategoryDonut({
  data,
  currency,
  centerLabel,
  centerValue,
}: {
  data: Slice[];
  currency: string;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="relative h-60">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={68}
            outerRadius={100}
            paddingAngle={data.length > 1 ? 2 : 0}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<MoneyTooltip currency={currency} total={total} />}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wide text-muted">
            {centerLabel}
          </span>
          <span className="text-[17px] font-semibold tabular-nums">
            {centerValue}
          </span>
        </div>
      )}
    </div>
  );
}

export function ChartLegend({
  data,
  currency,
}: {
  data: Slice[];
  currency: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ul className="flex flex-col gap-1.5">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center gap-2 text-[12.5px]">
          <span
            className="dot"
            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="flex-1 truncate text-muted">{d.name}</span>
          <span className="tabular-nums font-medium">
            {formatCurrency(d.value, currency, { compact: true })}
          </span>
          <span className="tabular-nums w-9 text-right text-faint">
            {total ? Math.round((d.value / total) * 100) : 0}%
          </span>
        </li>
      ))}
    </ul>
  );
}
