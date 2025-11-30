import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  className?: string;
  error?: string;
  label?: string;
  max?: number;
  min?: number;
  onBlur?: () => void;
  onChange: (value: number | '') => void;
  step?: number;
  value: number | '';
  variant?: InputVariant;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ value, onChange, label, error, onBlur, className, disabled, variant, min, max, step, ...inputProps }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;

      if (stringValue === '') {
        onChange('');
        return;
      }

      const numValue = parseFloat(stringValue);

      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    };

    return (
      <FieldWrapper label={label} error={error} className={className}>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={inputClassName({ error: !!error, disabled, variant })}
          {...inputProps}
        />
      </FieldWrapper>
    );
  }
);

NumberField.displayName = 'NumberField';
