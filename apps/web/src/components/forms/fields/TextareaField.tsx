import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface TextareaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  className?: string;
  error?: string;
  label?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
  variant?: InputVariant;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ value, onChange, label, error, onBlur, className, disabled, variant, rows = 4, ...textareaProps }, ref) => {
    return (
      <FieldWrapper label={label} error={error} className={className}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onBlur={onBlur}
          disabled={disabled}
          rows={rows}
          className={inputClassName({ error: !!error, disabled, variant })}
          {...textareaProps}
        />
      </FieldWrapper>
    );
  }
);

TextareaField.displayName = 'TextareaField';
