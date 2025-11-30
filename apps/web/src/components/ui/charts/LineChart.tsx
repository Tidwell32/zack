import type { CSSProperties, ReactNode } from 'react';
import { CartesianGrid, Legend, Line, LineChart as RechartsLineChart, Tooltip, XAxis, YAxis } from 'recharts';

import { CHART_ASPECT_RATIO, CHART_COLORS, CHART_STYLES } from '@/lib/chartConstants';

import { axisProps, makeAxisLabel } from './charts.utils';
import { ChartTooltip } from './ChartTooltip';

export interface LineSeries {
  color?: string;
  dataKey: string;
  name?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  unit?: string;
  yAxisId?: 'left' | 'right';
}

export interface LineChartProps<T extends object> {
  aspectRatio?: number;
  children?: ReactNode;
  className?: string;
  connectNulls?: boolean;
  data: T[];
  dualAxis?: boolean;
  labelFormatter?: (label: string) => string;
  leftAxisLabel?: string;
  leftTickFormatter?: (value: number) => string;
  onPointClick?: (data: T, index: number) => void;
  rightAxisLabel?: string;
  rightTickFormatter?: (value: number) => string;
  series: LineSeries[];
  showGrid?: boolean;
  showLegend?: boolean;
  style?: CSSProperties;
  valueFormatter?: (value: number) => string;
  xAxisLabel?: string;
  xInterval?: number;
  xDataKey: string;
  xTickFormatter?: (value: string) => string;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const makeActiveDot = <T,>(color: string, onPointClick?: (data: T, index: number) => void) =>
  onPointClick
    ? {
        fill: CHART_COLORS.tooltip.bg,
        r: CHART_STYLES.stroke.activeDotRadius,
        stroke: color,
        strokeWidth: 2,
        cursor: 'pointer',
        onClick: (_event: unknown, payload: unknown) => {
          const typedPayload = payload as { index: number; payload: T };
          onPointClick(typedPayload.payload, typedPayload.index);
        },
      }
    : {
        fill: CHART_COLORS.tooltip.bg,
        r: CHART_STYLES.stroke.activeDotRadius,
        stroke: color,
        strokeWidth: 2,
      };

interface RenderYAxesProps {
  dualAxis?: boolean;
  leftAxisLabel?: string;
  leftTickFormatter?: (value: number) => string;
  rightAxisLabel?: string;
  rightTickFormatter?: (value: number) => string;
}

const renderYAxes = ({
  dualAxis,
  leftAxisLabel,
  rightAxisLabel,
  leftTickFormatter,
  rightTickFormatter,
}: RenderYAxesProps) => (
  <>
    <YAxis
      {...axisProps}
      orientation="left"
      yAxisId="left"
      tickFormatter={leftTickFormatter}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      label={makeAxisLabel(leftAxisLabel, { angle: -90, position: 'insideLeft' })}
    />

    {dualAxis && (
      <YAxis
        {...axisProps}
        orientation="right"
        yAxisId="right"
        tickFormatter={rightTickFormatter}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        label={makeAxisLabel(rightAxisLabel, { angle: 90, position: 'insideRight' })}
      />
    )}
  </>
);

export const LineChart = <T extends object>({
  aspectRatio = CHART_ASPECT_RATIO,
  children,
  className,
  connectNulls = false,
  data,
  dualAxis = false,
  labelFormatter,
  leftAxisLabel,
  leftTickFormatter,
  onPointClick,
  rightAxisLabel,
  rightTickFormatter,
  series,
  showGrid = true,
  showLegend = true,
  style,
  valueFormatter,
  xAxisLabel,
  xDataKey,
  xInterval,
  xTickFormatter,
}: LineChartProps<T>) => {
  const margin = dualAxis ? CHART_STYLES.marginDualAxis : CHART_STYLES.margin;

  return (
    <RechartsLineChart
      className={className}
      data={data}
      margin={margin}
      responsive
      style={{
        aspectRatio,
        maxHeight: '70vh',
        minHeight: '400px',
        width: '100%',
        ...style,
      }}
    >
      {showGrid && (
        <CartesianGrid
          stroke={CHART_COLORS.grid}
          strokeDasharray={CHART_STYLES.grid.strokeDasharray}
          strokeOpacity={CHART_STYLES.grid.strokeOpacity}
          vertical={false}
        />
      )}

      <XAxis
        {...axisProps}
        interval={xInterval}
        dataKey={xDataKey}
        tickFormatter={xTickFormatter}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        label={makeAxisLabel(xAxisLabel, {
          offset: -5,
          position: 'insideBottom',
        })}
      />

      {renderYAxes({
        dualAxis,
        leftAxisLabel,
        rightAxisLabel,
        leftTickFormatter,
        rightTickFormatter,
      })}

      <Tooltip
        content={<ChartTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
        cursor={{ stroke: CHART_COLORS.primary, strokeOpacity: 0.3 }}
        isAnimationActive={false}
      />

      {showLegend && (
        <Legend
          verticalAlign="bottom"
          wrapperStyle={{
            fontSize: CHART_STYLES.axis.fontSize,
            paddingTop: 10,
            maxHeight: 60,
            overflowY: 'auto',
          }}
        />
      )}

      {series.map((s, index) => {
        const color = s.color ?? CHART_COLORS.series[index % CHART_COLORS.series.length];

        return (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name ?? s.dataKey}
            stroke={color}
            strokeWidth={s.strokeWidth ?? CHART_STYLES.stroke.width}
            strokeDasharray={s.strokeDasharray}
            yAxisId={s.yAxisId ?? 'left'}
            unit={s.unit}
            connectNulls={connectNulls}
            dot
            activeDot={makeActiveDot(color, onPointClick)}
            animationDuration={CHART_STYLES.animation.duration}
            animationEasing={CHART_STYLES.animation.easing}
          />
        );
      })}

      {children}
    </RechartsLineChart>
  );
};
