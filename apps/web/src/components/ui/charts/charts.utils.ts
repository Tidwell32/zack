import { CHART_COLORS, CHART_STYLES } from '@/lib/chartConstants';

export const axisProps = {
  axisLine: CHART_STYLES.axis.axisLine,
  tickLine: CHART_STYLES.axis.tickLine,
  fontSize: CHART_STYLES.axis.fontSize,
  stroke: CHART_COLORS.axis,
};

export const makeAxisLabel = (
  value?: string,
  opts: { angle?: number; offset?: number; position?: string } = {}
): any =>
  value
    ? ({
        value,
        fill: CHART_COLORS.axis,
        style: { textAnchor: 'middle' },
        ...opts,
        // gross any cast but it's recharts fault!
      } as any)
    : undefined;
