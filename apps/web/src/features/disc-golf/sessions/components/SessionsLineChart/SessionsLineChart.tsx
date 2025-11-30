import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import type { LineSeries } from '@/components/ui';
import { LineChart, Typography } from '@/components/ui';
import { useSessions } from '@/data-access/techdisc/techdisc.queries';
import {
  buildThrowTypeOptions,
  getAvailableThrowTypes,
  THROW_TYPES,
} from '@/features/disc-golf/throws/components/ThrowsScatterPlot/throwsScatterPlot.utils';
import { useTypedLoaderData } from '@/hooks';
import { formatSessionDate } from '@/utils';

import type { SessionsLoaderData } from '../../sessions.loader';

import type { CompareMode, MetricKey, ThrowTypeKey } from './sessionsLineChart.utils';
import { getDataByMetrics, getDataByThrowType, METRICS } from './sessionsLineChart.utils';
import { SessionsLineChartControls } from './SessionsLineChartControls';

// Left axis: speed, spin | Right axis: launch, nose, hyzer
const LEFT_AXIS_METRICS: MetricKey[] = ['avgSpeedMph', 'avgSpinRpm'];
const RIGHT_AXIS_METRICS: MetricKey[] = ['avgLaunchAngle', 'avgNoseAngle', 'avgHyzerAngle'];

export const SessionsLineChart = () => {
  const navigate = useNavigate();
  const { sessions: _, ...queryParams } = useTypedLoaderData<SessionsLoaderData>();
  const hasDates = !!queryParams.date || !!queryParams.endDate || !!queryParams.startDate;
  const { data: sessions = [] } = useSessions(queryParams);

  const [compareMode, setCompareMode] = useState<CompareMode>('throwTypes');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['avgSpeedMph']);
  const [selectedThrowTypes, setSelectedThrowTypes] = useState<ThrowTypeKey[]>(['RBH', 'RFH', 'LBH', 'LFH']);
  const [prevSelectedMetrics, setPrevSelectedMetrics] = useState<MetricKey[]>(['avgSpeedMph']);
  const [prevSelectedThrowTypes, setPrevSelectedThrowTypes] = useState<ThrowTypeKey[]>(['RBH', 'RFH', 'LBH', 'LFH']);

  const availableThrowTypes = useMemo(() => getAvailableThrowTypes(sessions), [sessions]);
  const throwTypeOptions = useMemo(() => buildThrowTypeOptions(availableThrowTypes), [availableThrowTypes]);

  const data = useMemo(() => {
    if (compareMode === 'throwTypes') {
      return getDataByThrowType(sessions, selectedMetrics[0]);
    } else {
      return getDataByMetrics(sessions, selectedThrowTypes[0], selectedMetrics);
    }
  }, [compareMode, selectedMetrics, selectedThrowTypes, sessions]);

  const { leftMetrics, rightMetrics } = useMemo(() => {
    if (compareMode === 'throwTypes') {
      return { leftMetrics: selectedMetrics, rightMetrics: [] };
    }

    const left = selectedMetrics.filter((m) => LEFT_AXIS_METRICS.includes(m));
    const right = selectedMetrics.filter((m) => RIGHT_AXIS_METRICS.includes(m));

    // If only left-axis metrics selected (speed & spin), move spin to the right
    if (right.length === 0 && left.includes('avgSpeedMph') && left.includes('avgSpinRpm')) {
      return {
        leftMetrics: ['avgSpeedMph'],
        rightMetrics: ['avgSpinRpm'],
      };
    }

    return { leftMetrics: left, rightMetrics: right };
  }, [compareMode, selectedMetrics]);

  const leftAxisLabel = useMemo(() => {
    if (compareMode === 'throwTypes') {
      const metricInfo = METRICS.find((m) => m.key === selectedMetrics[0])!;
      return `${metricInfo.label} (${metricInfo.unit.trim()})`;
    }
    if (leftMetrics.length === 0) return undefined;
    const labels = leftMetrics.map((key) => METRICS.find((m) => m.key === key)!.label);
    return labels.join(' / ');
  }, [compareMode, selectedMetrics, leftMetrics]);

  const rightAxisLabel = useMemo(() => {
    if (rightMetrics.length === 0) return undefined;
    const labels = rightMetrics.map((key) => METRICS.find((m) => m.key === key)!.label);
    return labels.join(' / ');
  }, [rightMetrics]);

  const series: LineSeries[] = useMemo(() => {
    if (compareMode === 'throwTypes') {
      const metricInfo = METRICS.find((m) => m.key === selectedMetrics[0])!;
      return THROW_TYPES.filter(
        (throwType) => selectedThrowTypes.includes(throwType.key) && availableThrowTypes.has(throwType.key)
      ).map((throwType) => ({
        dataKey: throwType.key,
        name: throwType.fullLabel,
        color: throwType.color,
        unit: metricInfo.unit,
        yAxisId: 'left',
      }));
    } else {
      return selectedMetrics.map((metricKey) => {
        const metricInfo = METRICS.find((m) => m.key === metricKey)!;
        const yAxisId = rightMetrics.includes(metricKey) ? 'right' : 'left';
        return {
          dataKey: metricKey,
          name: metricInfo.label,
          color: metricInfo.color,
          unit: metricInfo.unit,
          yAxisId,
        };
      });
    }
  }, [compareMode, selectedMetrics, selectedThrowTypes, rightMetrics, availableThrowTypes]);

  const handleChangeMode = (newMode: CompareMode) => {
    if (newMode === compareMode) return;

    if (newMode === 'throwTypes') {
      setPrevSelectedMetrics(selectedMetrics);
      if (selectedMetrics.length > 1) {
        setSelectedMetrics([selectedMetrics[0]]);
      }
      if (prevSelectedThrowTypes.length > 0) {
        setSelectedThrowTypes(prevSelectedThrowTypes);
      }
    } else {
      setPrevSelectedThrowTypes(selectedThrowTypes);
      if (selectedThrowTypes.length > 1) {
        setSelectedThrowTypes([selectedThrowTypes[0]]);
      }
      if (prevSelectedMetrics.length > 0) {
        setSelectedMetrics(prevSelectedMetrics);
      }
    }

    setCompareMode(newMode);
  };

  return (
    <div className="flex flex-col gap-4 font-mono">
      <SessionsLineChartControls
        compareMode={compareMode}
        handleChangeMode={handleChangeMode}
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
        selectedThrowTypes={selectedThrowTypes}
        setSelectedThrowTypes={setSelectedThrowTypes}
        throwTypeOptions={throwTypeOptions}
      />
      {sessions.length === 0 && (
        <div className="p-12">
          <Typography>{hasDates ? 'No data for that date range' : 'No data yet, import some throws!'}</Typography>
        </div>
      )}
      {sessions.length > 0 && (
        <LineChart
          connectNulls
          data={data}
          dualAxis={selectedMetrics.length > 1}
          labelFormatter={formatSessionDate}
          leftAxisLabel={leftAxisLabel}
          rightAxisLabel={rightAxisLabel}
          series={series}
          valueFormatter={(v) => v.toFixed(1)}
          xDataKey="sessionDate"
          xTickFormatter={formatSessionDate}
          onPointClick={(d) =>
            navigate(`/playground/disc-golf/throws?startDate=${d.sessionDate}&endDate=${d.sessionDate}`)
          }
        />
      )}
    </div>
  );
};
