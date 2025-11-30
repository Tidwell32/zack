import { forwardRef } from 'react';

import { cn } from '@/utils';

import type { FieldWrapperProps } from '../shared/FieldWrapper';
import { FieldWrapper } from '../shared/FieldWrapper';

export interface MultiSelectFieldProps {
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  labelPosition?: FieldWrapperProps['labelPosition'];
  onChange: (value: string[]) => void;
  options: Array<{ label: string; value: string }> | readonly string[];
  value: string[];
}

export const MultiSelectField = forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  ({ value, onChange, options, label, labelPosition, error, className, disabled }, ref) => {
    const normalizedOptions = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));

    const handleToggle = (optionValue: string) => {
      if (disabled) return;
      const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
      onChange(newValue);
    };

    return (
      <FieldWrapper label={label} labelPosition={labelPosition} error={error} className={className}>
        <div ref={ref} className="flex flex-col gap-2">
          {normalizedOptions.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-2 text-sm cursor-pointer text-neutral-100',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    handleToggle(option.value);
                  }}
                  disabled={disabled}
                  className="accent-primary"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </FieldWrapper>
    );
  }
);

MultiSelectField.displayName = 'MultiSelectField';
