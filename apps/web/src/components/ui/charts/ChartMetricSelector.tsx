import { SERIES_COLORS } from '@/lib/chartConstants';
import { cn } from '@/utils';

import { Button } from '../Button';
import { Dot } from '../Dot';
import { Typography } from '../Typography';

export interface MetricOption {
  color?: string;
  key: string;
  label: string;
}

export interface ChartMetricSelectorProps {
  className?: string;
  metrics: MetricOption[];
  noDot?: boolean;
  onChange: (selectedKeys: string[]) => void;
  selectedKeys: string[];
  singleSelect?: boolean;
}

export const ChartMetricSelector = ({
  className,
  metrics,
  noDot = false,
  selectedKeys,
  onChange,
  singleSelect = false,
}: ChartMetricSelectorProps) => {
  const toggleMetric = (key: string) => {
    if (singleSelect) {
      onChange([key]);
    } else if (selectedKeys.includes(key)) {
      if (selectedKeys.length > 1) {
        onChange(selectedKeys.filter((k) => k !== key));
      }
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {metrics.map((metric, index) => {
        const isSelected = selectedKeys.includes(metric.key);
        const color = metric.color ?? SERIES_COLORS[index % SERIES_COLORS.length];

        return (
          <Button
            selected={isSelected}
            onClick={() => {
              toggleMetric(metric.key);
            }}
            muted={!isSelected}
            key={metric.key}
          >
            {!noDot && <Dot color={color} className={cn(!isSelected && 'opacity-40')} />}

            <Typography variant="monoStat">{metric.label}</Typography>
          </Button>
        );
      })}
    </div>
  );
};
