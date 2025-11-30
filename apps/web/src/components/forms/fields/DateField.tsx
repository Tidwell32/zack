import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  className?: string;
  error?: string;
  label?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
  variant?: InputVariant;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ value, onChange, label, error, onBlur, className, disabled, variant, ...inputProps }, ref) => {
    return (
      <FieldWrapper label={label} error={error} className={className}>
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClassName({ error: !!error, disabled, variant })}
          style={{ colorScheme: 'dark' }}
          {...inputProps}
        />
      </FieldWrapper>
    );
  }
);

DateField.displayName = 'DateField';
