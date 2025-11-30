import { CHART_COLORS, CHART_STYLES } from '@/lib/chartConstants';

export const axisProps = {
  axisLine: CHART_STYLES.axis.axisLine,
  tickLine: CHART_STYLES.axis.tickLine,
  fontSize: CHART_STYLES.axis.fontSize,
  stroke: CHART_COLORS.axis,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeAxisLabel = (
  value?: string,
  opts: { angle?: number; offset?: number; position?: string } = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any =>
  value
    ? ({
        value,
        fill: CHART_COLORS.axis,
        style: { textAnchor: 'middle' },
        ...opts,
        // gross any cast but it's recharts fault!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    : undefined;
