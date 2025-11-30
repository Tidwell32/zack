import type { InputHTMLAttributes } from 'react';
import { forwardRef, useRef } from 'react';

import { cn } from '@/utils';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface ColorFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  className?: string;
  error?: string;
  label?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  showHex?: boolean;
  value: string;
  variant?: InputVariant;
}

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  ({ value, onChange, label, error, onBlur, className, disabled, variant, showHex = true, ...inputProps }, ref) => {
    const colorInputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
      <FieldWrapper label={label} error={error} className={className}>
        <div ref={containerRef} className="flex gap-2 items-center">
          <input
            ref={(node) => {
              colorInputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="color"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(
              'h-10 w-16 cursor-pointer p-0 text-transparent',
              inputClassName({ error: !!error, disabled, variant })
            )}
            {...inputProps}
          />
          {showHex && (
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const hex = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                  onChange(hex);
                }
              }}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="#22d3ee"
              maxLength={7}
              className={cn(inputClassName({ error: !!error, disabled, variant }), 'font-mono uppercase')}
            />
          )}
        </div>
      </FieldWrapper>
    );
  }
);

ColorField.displayName = 'ColorField';
