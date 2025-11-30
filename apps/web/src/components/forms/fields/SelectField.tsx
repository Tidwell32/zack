import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import type { FieldWrapperProps } from '../shared/FieldWrapper';
import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  className?: string;
  error?: string;
  label?: string;
  labelPosition?: FieldWrapperProps['labelPosition'];
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }> | readonly string[];
  placeholder?: string;
  value: string;
  variant?: InputVariant;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      value,
      onChange,
      options,
      label,
      labelPosition,
      error,
      onBlur,
      className,
      disabled,
      variant,
      placeholder,
      ...selectProps
    },
    ref
  ) => {
    const normalizedOptions = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));

    return (
      <FieldWrapper label={label} labelPosition={labelPosition} error={error} className={className}>
        <select
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClassName({ error: !!error, disabled, variant })}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldWrapper>
    );
  }
);

SelectField.displayName = 'SelectField';
