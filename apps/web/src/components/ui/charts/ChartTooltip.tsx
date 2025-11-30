import type { Payload } from 'recharts/types/component/DefaultTooltipContent';

import { CHART_COLORS } from '@/lib/chartConstants';

export interface ChartTooltipProps {
  active?: boolean;
  label?: number | string;
  labelFormatter?: (label: string) => string;
  payload?: Array<Payload<any, any>>;
  valueFormatter?: (value: number) => string;
}

const getContextInfo = (data: any): string | null => {
  if (!data) return null;

  const parts: string[] = [];

  if (typeof data.time === 'string') {
    const d = new Date(data.time);
    parts.push(
      d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
    );
  }

  if (data.handedness && data.primaryThrowType) {
    const hand = String(data.handedness).charAt(0).toUpperCase();
    parts.push(`${hand} ${String(data.primaryThrowType)}`);
  }

  return parts.length ? parts.join(' · ') : null;
};

export const ChartTooltip = ({ active, payload, label, labelFormatter, valueFormatter }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const first = payload[0];
  const contextInfo = getContextInfo(first.payload);
  const formattedLabel = label != null ? String(label) : '';
  const title = contextInfo ?? (labelFormatter ? labelFormatter(formattedLabel) : formattedLabel);

  // Dedupe entries by name to avoid duplicates from scatter plots
  const seen = new Set<string>();
  const rows = payload.filter((entry) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const name = entry.name ?? '';
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });

  return (
    <div
      className="rounded border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: CHART_COLORS.tooltip.bg,
        borderColor: CHART_COLORS.tooltip.border,
      }}
    >
      {title && (
        <p className="mb-1 text-xs font-medium" style={{ color: CHART_COLORS.tooltip.label }}>
          {title}
        </p>
      )}

      <div className="space-y-0.5">
        {rows.map((entry, index) => {
          const rawValue = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? NaN);
          const displayValue = !isNaN(rawValue) && valueFormatter ? valueFormatter(rawValue) : rawValue;

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? CHART_COLORS.primary }} />
              <span style={{ color: CHART_COLORS.tooltip.text }}>
                {entry.name}: <span className="font-medium">{displayValue}</span>
                {entry.unit && <span className="ml-0.5 text-xs opacity-70">{entry.unit}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
