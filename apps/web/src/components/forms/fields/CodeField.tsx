import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react';
import { useRef } from 'react';

import { cn } from '@/utils';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';
import { inputClassName } from '../shared/inputStyles';

export interface CodeFieldProps {
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  length?: number;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value: string;
  variant?: InputVariant;
}

export const CodeField = ({
  value,
  onChange,
  length = 6,
  label,
  error,
  disabled = false,
  autoFocus = false,
  onBlur,
  className,
  variant,
}: CodeFieldProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const focusInput = (index: number) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  const handleChange = (index: number, digitValue: string) => {
    const sanitized = digitValue.replace(/[^0-9]/g, '');

    if (sanitized.length === 0) {
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (sanitized.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = sanitized;
      onChange(newDigits.join(''));

      if (index < length - 1) {
        focusInput(index + 1);
      }
    } else if (sanitized.length > 1) {
      handlePaste(sanitized, index);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (pastedData: string, startIndex = 0) => {
    const sanitized = pastedData.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    for (let i = 0; i < sanitized.length && startIndex + i < length; i++) {
      newDigits[startIndex + i] = sanitized[i];
    }

    onChange(newDigits.join(''));

    const nextEmptyIndex = newDigits.findIndex((d, i) => !d && i >= startIndex);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(Math.min(startIndex + sanitized.length, length - 1));
    }
  };

  const handlePasteEvent = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePaste(pastedData, index);
  };

  return (
    <FieldWrapper label={label} error={error} className={className}>
      <div className="flex gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              handleChange(index, e.target.value);
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              handleKeyDown(index, e);
            }}
            onPaste={(e: ClipboardEvent<HTMLInputElement>) => {
              handlePasteEvent(e, index);
            }}
            onBlur={onBlur}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={cn(
              'w-12 h-12 text-center text-lg font-mono',
              inputClassName({ error: !!error, disabled, variant })
            )}
          />
        ))}
      </div>
    </FieldWrapper>
  );
};
