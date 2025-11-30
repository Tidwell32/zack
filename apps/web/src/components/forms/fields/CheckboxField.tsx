import type { ChangeEventHandler, InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/utils';

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  checked: boolean;
  className?: string;
  error?: string;
  label?: string;
  nativeOnChange?: ChangeEventHandler<HTMLInputElement>;
  onChange?: (e: boolean) => void;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ checked, onChange, nativeOnChange, label, error, className, disabled, ...inputProps }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <label
          className={cn(
            'flex items-center gap-2 text-sm cursor-pointer text-neutral-100',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => nativeOnChange?.(e) ?? onChange?.(e.target.checked)}
            disabled={disabled}
            className="accent-primary"
            {...inputProps}
          />
          {label}
        </label>
        {error && <div className="text-sm text-red-500">{error}</div>}
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
