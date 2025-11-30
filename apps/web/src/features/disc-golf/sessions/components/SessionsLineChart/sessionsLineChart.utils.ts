import type { ThrowTypeKey } from '@/features/disc-golf/throws/components/ThrowsScatterPlot/throwsScatterPlot.utils';
import { getThrowTypeKey } from '@/features/disc-golf/throws/components/ThrowsScatterPlot/throwsScatterPlot.utils';
import { SERIES_COLORS } from '@/lib/chartConstants';
import type { Session } from '@/types/techdisc';

export const METRICS = [
  { key: 'avgSpeedMph', label: 'Speed', unit: ' mph', color: SERIES_COLORS[0] },
  { key: 'avgLaunchAngle', label: 'Launch', unit: '°', color: SERIES_COLORS[1] },
  { key: 'avgNoseAngle', label: 'Nose', unit: '°', color: SERIES_COLORS[2] },
  { key: 'avgHyzerAngle', label: 'Hyzer', unit: '°', color: SERIES_COLORS[3] },
  { key: 'avgSpinRpm', label: 'Spin', unit: ' rpm', color: SERIES_COLORS[4] },
] as const;

export type MetricKey = (typeof METRICS)[number]['key'];
export type CompareMode = 'metrics' | 'throwTypes';
export type { ThrowTypeKey };

type PivotRow = Partial<Record<ThrowTypeKey, number>> & {
  sessionDate: string;
};

type PivotMetricsRow = Partial<Record<MetricKey, number>> & {
  sessionDate: string;
};

export const getDataByThrowType = (sessions: Session[], metric: MetricKey): PivotRow[] => {
  const groupedSessions = sessions.reduce<Record<string, PivotRow | undefined>>((acc, session) => {
    const throwKey = getThrowTypeKey(session);
    if (!throwKey) return acc;
    const date = session.sessionDate;

    acc[date] ??= { sessionDate: date };
    acc[date][throwKey] = session[metric];
    return acc;
  }, {});

  return Object.values(groupedSessions)
    .filter((row) => row !== undefined)
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
};

export const getDataByMetrics = (sessions: Session[], throwType: ThrowTypeKey, metrics: MetricKey[]) => {
  const groupedSessions = sessions.reduce<Record<string, PivotMetricsRow | undefined>>((acc, session) => {
    const throwKey = getThrowTypeKey(session);
    if (throwKey !== throwType) return acc;

    const date = session.sessionDate;

    acc[date] ??= { sessionDate: date };
    for (const metric of metrics) {
      acc[date][metric] = session[metric];
    }
    return acc;
  }, {});

  return Object.values(groupedSessions)
    .filter((row) => row !== undefined)
    .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
};
