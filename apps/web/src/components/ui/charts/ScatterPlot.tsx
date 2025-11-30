import type { CSSProperties, ReactNode } from 'react';
import { CartesianGrid, Legend, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

import { CHART_ASPECT_RATIO, CHART_COLORS, CHART_STYLES } from '@/lib/chartConstants';

import { axisProps, makeAxisLabel } from './charts.utils';
import { ChartTooltip } from './ChartTooltip';

export interface ScatterSeries<T> {
  color?: string;
  data: T[];
  name: string;
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';
}

export interface ScatterPlotProps<T extends object> {
  aspectRatio?: number;
  children?: ReactNode;
  className?: string;
  labelFormatter?: (label: string) => string;
  series: Array<ScatterSeries<T>>;
  showGrid?: boolean;
  showLegend?: boolean;
  style?: CSSProperties;
  valueFormatter?: (value: number) => string;
  xAxisLabel?: string;
  xDataKey: string;
  xDomain?: [number | 'auto' | 'dataMax' | 'dataMin', number | 'auto' | 'dataMax' | 'dataMin'];
  xName?: string;
  xTickFormatter?: (value: number) => string;
  xUnit?: string;
  yAxisLabel?: string;
  yDataKey: string;
  yDomain?: [number | 'auto' | 'dataMax' | 'dataMin', number | 'auto' | 'dataMax' | 'dataMin'];
  yName?: string;
  yTickFormatter?: (value: number) => string;
  yUnit?: string;
  zDataKey?: string;
  zName?: string;
  zRange?: [number, number];
  zUnit?: string;
}

export const ScatterPlot = <T extends object>({
  series,
  xDataKey,
  yDataKey,
  zDataKey,
  xName,
  yName,
  zName,
  xUnit,
  yUnit,
  zUnit,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  aspectRatio = CHART_ASPECT_RATIO,
  style,
  className,
  labelFormatter,
  valueFormatter,
  xTickFormatter,
  yTickFormatter,
  xDomain,
  yDomain,
  zRange = CHART_STYLES.scatter.sizeRange,
  children,
}: ScatterPlotProps<T>) => (
  <ScatterChart
    margin={CHART_STYLES.margin}
    className={className}
    responsive
    style={{
      width: '100%',
      maxWidth: '100%',
      maxHeight: '70vh',
      aspectRatio,
      ...style,
    }}
  >
    {showGrid && (
      <CartesianGrid
        stroke={CHART_COLORS.grid}
        strokeDasharray={CHART_STYLES.grid.strokeDasharray}
        strokeOpacity={CHART_STYLES.grid.strokeOpacity}
      />
    )}

    <XAxis
      {...axisProps}
      type="number"
      dataKey={xDataKey}
      name={xName ?? xDataKey}
      unit={xUnit}
      tickFormatter={xTickFormatter}
      domain={xDomain}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      label={makeAxisLabel(xAxisLabel, {
        position: 'insideBottom',
        offset: -5,
      })}
    />

    <YAxis
      {...axisProps}
      type="number"
      dataKey={yDataKey}
      name={yName ?? yDataKey}
      unit={yUnit}
      tickFormatter={yTickFormatter}
      domain={yDomain}
      width="auto"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      label={makeAxisLabel(yAxisLabel, {
        angle: -90,
        position: 'insideLeft',
      })}
    />

    {zDataKey && <ZAxis type="number" dataKey={zDataKey} name={zName ?? zDataKey} unit={zUnit} range={zRange} />}

    <Tooltip
      content={<ChartTooltip labelFormatter={labelFormatter} valueFormatter={valueFormatter} />}
      cursor={{ strokeDasharray: '3 3', stroke: CHART_COLORS.primary, strokeOpacity: 0.5 }}
      isAnimationActive={false}
    />

    {showLegend && (
      <Legend
        wrapperStyle={{
          paddingTop: 10,
          fontSize: CHART_STYLES.axis.fontSize,
        }}
      />
    )}

    {series.map((s, index) => {
      const color = s.color ?? CHART_COLORS.series[index % CHART_COLORS.series.length];

      return (
        <Scatter
          key={s.name}
          name={s.name}
          data={s.data}
          fill={color}
          shape={s.shape ?? 'circle'}
          animationDuration={CHART_STYLES.animation.duration}
          animationEasing={CHART_STYLES.animation.easing}
        />
      );
    })}

    {children}
  </ScatterChart>
);
