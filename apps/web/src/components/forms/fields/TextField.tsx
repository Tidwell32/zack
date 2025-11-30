import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  error?: string;
  label?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
  variant?: InputVariant;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ value, onChange, label, error, onBlur, className, disabled, variant, ...inputProps }, ref) => {
    return (
      <FieldWrapper label={label} error={error} className={className}>
        <input
          ref={ref}
          type={inputProps.type ?? 'text'}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClassName({ error: !!error, disabled, variant })}
          {...inputProps}
        />
      </FieldWrapper>
    );
  }
);

TextField.displayName = 'TextField';
