import { useMemo, useState } from 'react';

import { Typography } from '@/components/ui';
import type { MetricOption, ScatterSeries } from '@/components/ui/charts';
import { ScatterPlot } from '@/components/ui/charts';
import { useThrows } from '@/data-access/techdisc/techdisc.queries';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';
import { SERIES_COLORS } from '@/lib/chartConstants';
import type { Throw } from '@/types/techdisc';
import { formatTimestampDate } from '@/utils';

import type { ThrowsLoaderData } from '../../throws.loader';

import type { ThrowTypeKey } from './throwsScatterPlot.utils';
import { buildThrowTypeOptions, getAvailableThrowTypes, getThrowTypeKey, THROW_TYPES } from './throwsScatterPlot.utils';
import { ThrowsScatterPlotControls } from './ThrowsScatterPlotControls';

const METRICS = [
  { key: 'speedMph', label: 'Speed', unit: ' mph' },
  { key: 'spinRpm', label: 'Spin', unit: ' rpm' },
  { key: 'launchAngle', label: 'Launch', unit: '°' },
  { key: 'noseAngle', label: 'Nose', unit: '°' },
  { key: 'hyzerAngle', label: 'Hyzer', unit: '°' },
  { key: 'timestamp', label: 'Date', unit: '' },
];

export type MetricKey = (typeof METRICS)[number]['key'];
const ALL_THROW_TYPES: ThrowTypeKey[] = ['RBH', 'RFH', 'LBH', 'LFH'];

interface ThrowWithTimestamp extends Throw {
  timestamp: number;
}

export const ThrowsScatterPlot = () => {
  const { throws: _, ...queryParams } = useTypedLoaderData<ThrowsLoaderData>();
  const hasDates = !!queryParams.date || !!queryParams.endDate || !!queryParams.startDate;
  const { data: throws = [] } = useThrows(queryParams);

  const [xMetric, setXMetric] = useState<MetricKey>('noseAngle');
  const [yMetric, setYMetric] = useState<MetricKey>('speedMph');
  const [selectedThrowTypes, setSelectedThrowTypes] = useState<ThrowTypeKey[]>(ALL_THROW_TYPES);

  const availableThrowTypes = useMemo(() => getAvailableThrowTypes(throws), [throws]);
  const throwTypeOptions = useMemo(() => buildThrowTypeOptions(availableThrowTypes), [availableThrowTypes]);

  const xMetricInfo = METRICS.find((m) => m.key === xMetric)!;
  const yMetricInfo = METRICS.find((m) => m.key === yMetric)!;

  const selectedThrowTypeKeysForUI: ThrowTypeKey[] = useMemo(
    () => selectedThrowTypes.filter((key) => availableThrowTypes.has(key)),
    [selectedThrowTypes, availableThrowTypes]
  );

  const formatValue = (value: number) => {
    // huge number means unix, hopefully
    if (value > 1_000_000_000) {
      const d = new Date(value);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    return value.toFixed(1);
  };

  const throwsWithTimestamp: ThrowWithTimestamp[] = useMemo(() => {
    return throws.map((t) => ({
      ...t,
      timestamp: new Date(t.time).getTime(),
    }));
  }, [throws]);

  const scatterSeries: Array<ScatterSeries<ThrowWithTimestamp>> = useMemo(() => {
    const visibleThrowTypes = THROW_TYPES.filter(
      (t) => availableThrowTypes.has(t.key) && selectedThrowTypes.includes(t.key)
    );

    return visibleThrowTypes.map((throwType) => ({
      name: throwType.label,
      color: throwType.color,
      data: throwsWithTimestamp.filter((t) => {
        if (t.isOutlierDefault) return false;
        return getThrowTypeKey(t) === throwType.key;
      }),
    }));
  }, [throwsWithTimestamp, selectedThrowTypes, availableThrowTypes]);

  const metricOptions: MetricOption[] = METRICS.map((m, i) => ({
    key: m.key,
    label: m.label,
    color: SERIES_COLORS[i],
  }));

  return (
    <div className="flex flex-col gap-4 font-mono">
      <ThrowsScatterPlotControls
        xMetric={xMetric}
        setXMetric={setXMetric}
        yMetric={yMetric}
        setYMetric={setYMetric}
        selectedThrowTypes={selectedThrowTypeKeysForUI}
        setSelectedThrowTypes={setSelectedThrowTypes}
        metricOptions={metricOptions}
        throwTypeOptions={throwTypeOptions}
      />
      {throws.length === 0 && (
        <div className="p-12">
          <Typography>{hasDates ? 'No data for that date range' : 'No data yet, import some throws!'}</Typography>
        </div>
      )}
      {throws.length > 0 && (
        <ScatterPlot
          series={scatterSeries}
          yDataKey={yMetric}
          xDataKey={xMetric}
          xName={xMetricInfo.label}
          yName={yMetricInfo.label}
          xUnit={xMetricInfo.unit}
          yUnit={yMetricInfo.unit}
          xAxisLabel={xMetricInfo.unit ? `${xMetricInfo.label} (${xMetricInfo.unit.trim()})` : xMetricInfo.label}
          yAxisLabel={yMetricInfo.unit ? `${yMetricInfo.label} (${yMetricInfo.unit.trim()})` : yMetricInfo.label}
          xTickFormatter={xMetric === 'timestamp' ? formatTimestampDate : undefined}
          yTickFormatter={yMetric === 'timestamp' ? formatTimestampDate : undefined}
          xDomain={xMetric === 'timestamp' ? ['dataMin', 'dataMax'] : undefined}
          yDomain={yMetric === 'timestamp' ? ['dataMin', 'dataMax'] : undefined}
          valueFormatter={formatValue}
        />
      )}
    </div>
  );
};
