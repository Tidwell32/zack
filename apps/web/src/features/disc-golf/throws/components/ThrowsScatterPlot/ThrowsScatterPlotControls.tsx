import { useSearchParams } from 'react-router';

import { DateField } from '@/components/forms';
import { SlidersIcon } from '@/components/icons/SlidersIcon';
import { Button, Popover, Typography } from '@/components/ui';
import type { MetricOption } from '@/components/ui/charts';
import { ChartMetricSelector } from '@/components/ui/charts';
import { useTypedLoaderData } from '@/hooks/useTypedLoaderData';

import type { ThrowsLoaderData } from '../../throws.loader';

import type { MetricKey } from './ThrowsScatterPlot';
import type { ThrowTypeKey } from './throwsScatterPlot.utils';

interface ThrowsScatterPlotControlsProps {
  metricOptions: MetricOption[];
  selectedThrowTypes: ThrowTypeKey[];
  setSelectedThrowTypes: (value: ThrowTypeKey[]) => void;
  setXMetric: (value: MetricKey) => void;
  setYMetric: (value: MetricKey) => void;
  throwTypeOptions: MetricOption[];
  xMetric: MetricKey;
  yMetric: MetricKey;
}

export const ThrowsScatterPlotControls = ({
  metricOptions,
  xMetric,
  selectedThrowTypes,
  setSelectedThrowTypes,
  setXMetric,
  setYMetric,
  throwTypeOptions,
  yMetric,
}: ThrowsScatterPlotControlsProps) => {
  const { throws: _, ...queryParams } = useTypedLoaderData<ThrowsLoaderData>();
  const [__, setSearchParams] = useSearchParams();

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
        <Typography variant="monoStat">X Axis:</Typography>
        <div className="md:hidden">
          <Popover
            trigger={
              <Button variant="secondary">
                <SlidersIcon size={16} /> {metricOptions.find((metric) => metric.key === xMetric)?.label}
              </Button>
            }
          >
            <ChartMetricSelector
              metrics={metricOptions}
              selectedKeys={[xMetric]}
              onChange={(keys) => {
                setXMetric(keys[0]);
              }}
              singleSelect
              className="flex-col"
            />
          </Popover>
        </div>

        <ChartMetricSelector
          className="hidden md:flex"
          metrics={metricOptions}
          selectedKeys={[xMetric]}
          onChange={(keys) => {
            setXMetric(keys[0]);
          }}
          singleSelect
        />
      </div>
      <div className="flex items-center gap-2">
        <Typography variant="monoStat">Y Axis:</Typography>
        <div className="md:hidden">
          <Popover
            trigger={
              <Button variant="secondary">
                <SlidersIcon size={16} />
                {metricOptions.find((metric) => metric.key === yMetric)?.label}
              </Button>
            }
          >
            <ChartMetricSelector
              metrics={metricOptions}
              selectedKeys={[yMetric]}
              onChange={(keys) => {
                setYMetric(keys[0]);
              }}
              singleSelect
              className="flex-col"
            />
          </Popover>
        </div>

        <ChartMetricSelector
          className="hidden md:flex"
          metrics={metricOptions}
          selectedKeys={[yMetric]}
          onChange={(keys) => {
            setYMetric(keys[0]);
          }}
          singleSelect
        />
      </div>

      {throwTypeOptions.length > 0 && (
        <div className="flex flex-row items-center gap-2">
          <Typography variant="monoStat">Throw Types:</Typography>
          <ChartMetricSelector
            className="flex-row"
            metrics={throwTypeOptions}
            selectedKeys={selectedThrowTypes}
            onChange={(keys) => {
              setSelectedThrowTypes(keys as ThrowTypeKey[]);
            }}
          />
        </div>
      )}
    </div>
  );
};
