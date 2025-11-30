import { useSearchParams } from 'react-router';

import { DateField } from '@/components/forms';
import { SlidersIcon } from '@/components/icons';
import type { MetricOption } from '@/components/ui';
import { Button, ChartMetricSelector, Popover, Typography } from '@/components/ui';
import { useTypedLoaderData } from '@/hooks/';

import type { SessionsLoaderData } from '../../sessions.loader';

import type { CompareMode, ThrowTypeKey } from './sessionsLineChart.utils';
import type { MetricKey } from './sessionsLineChart.utils';
import { METRICS } from './sessionsLineChart.utils';

interface SessionsLineChartControlsProps {
  compareMode: CompareMode;
  handleChangeMode: (value: CompareMode) => void;
  selectedMetrics: MetricKey[];
  selectedThrowTypes: ThrowTypeKey[];
  setSelectedMetrics: (value: MetricKey[]) => void;
  setSelectedThrowTypes: (value: ThrowTypeKey[]) => void;
  throwTypeOptions: MetricOption[];
}

export const SessionsLineChartControls = ({
  compareMode,
  handleChangeMode,
  selectedMetrics,
  selectedThrowTypes,
  setSelectedMetrics,
  setSelectedThrowTypes,
  throwTypeOptions,
}: SessionsLineChartControlsProps) => {
  const { sessions: _, ...queryParams } = useTypedLoaderData<SessionsLoaderData>();
  const [__, setSearchParams] = useSearchParams();

  const metricOptions = METRICS.map((m) => ({
    key: m.key,
    label: m.label,
    color: m.color,
  }));

  const compareOptions = ['metrics', 'throwTypes'].map((option) => ({
    key: option,
    label: option === 'metrics' ? 'Metrics' : 'Throws',
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 flex-wrap">
        <DateField
          onChange={(value: string) => {
            setSearchParams((searchParams) => {
              searchParams.set('startDate', value);
              return searchParams;
            });
          }}
          value={queryParams.startDate ?? ''}
          className="w-fit"
        />

        <div className="flex flex-row">
          <DateField
            onChange={(value: string) => {
              setSearchParams((searchParams) => {
                searchParams.set('endDate', value);
                return searchParams;
              });
            }}
            value={queryParams.endDate ?? ''}
          />

          <Button
            variant="primaryGhost"
            onClick={() => {
              setSearchParams((searchParams) => {
                searchParams.delete('startDate');
                searchParams.delete('endDate');
                return searchParams;
              });
            }}
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Typography>Compare:</Typography>
        <ChartMetricSelector
          metrics={compareOptions}
          selectedKeys={[compareMode]}
          onChange={(keys) => {
            handleChangeMode(keys[0] as CompareMode);
          }}
          singleSelect
          noDot
        />
      </div>
      <div className="flex items-center gap-2">
        <Typography>Metrics:</Typography>
        <div className="md:hidden">
          <Popover
            trigger={
              <Button variant="secondary" className="text-text-primary">
                <SlidersIcon size={16} />
                <Typography variant="monoStat">
                  {METRICS.find((metric) => metric.key === selectedMetrics[0])?.label}
                </Typography>
              </Button>
            }
          >
            <ChartMetricSelector
              metrics={metricOptions}
              selectedKeys={selectedMetrics}
              onChange={(keys) => {
                setSelectedMetrics(keys as MetricKey[]);
              }}
              singleSelect={compareMode === 'throwTypes'}
              className="flex-col"
            />
          </Popover>
          {selectedMetrics.length > 1 && <Typography>+{selectedMetrics.length - 1} more</Typography>}
        </div>

        <ChartMetricSelector
          className="hidden md:flex"
          metrics={metricOptions}
          selectedKeys={selectedMetrics}
          onChange={(keys) => {
            setSelectedMetrics(keys as MetricKey[]);
          }}
          singleSelect={compareMode === 'throwTypes'}
        />
      </div>

      {throwTypeOptions.length > 0 && (
        <div className="flex flex-row items-center gap-2">
          <Typography>Throw Types:</Typography>
          <ChartMetricSelector
            className="flex-row"
            metrics={throwTypeOptions}
            selectedKeys={selectedThrowTypes}
            onChange={(keys) => {
              setSelectedThrowTypes(keys as ThrowTypeKey[]);
            }}
            singleSelect={compareMode === 'metrics'}
          />
        </div>
      )}
    </div>
  );
};
