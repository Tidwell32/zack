import type { InputHTMLAttributes } from 'react';
import { forwardRef, useRef } from 'react';

import { Button, Typography } from '@/components/ui';
import { cn } from '@/utils';

import { FieldWrapper } from '../shared/FieldWrapper';
import type { InputVariant } from '../shared/form.types';

export interface FileFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  buttonText?: string;
  className?: string;
  error?: string;
  label?: string;
  onBlur?: () => void;
  onChange: (file: File | null) => void;
  value?: File | null;
  variant?: InputVariant;
}

export const FileField = forwardRef<HTMLInputElement, FileFieldProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      onBlur,
      className,
      disabled,
      variant = 'primary',
      buttonText = 'Choose File',
      accept,
      ...inputProps
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onChange(file);
    };

    const handleClear = () => {
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <FieldWrapper
        label={label}
        error={error}
        className={cn('flex flex-row items-center flex-wrap gap-2 min-w-max', className)}
      >
        <input
          ref={(node) => {
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
            (fileInputRef as any).current = node;
          }}
          type="file"
          onChange={handleFileChange}
          onBlur={onBlur}
          disabled={disabled}
          accept={accept}
          className="hidden"
          {...inputProps}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          variant={variant === 'primary' ? 'primary' : 'secondary'}
          className="opacity-80"
        >
          {buttonText}
        </Button>

        {value && (
          <>
            <Typography variant="monoStat">{value.name}</Typography>
            <Button variant="secondaryGhost" onClick={handleClear} disabled={disabled}>
              Clear
            </Button>
          </>
        )}
      </FieldWrapper>
    );
  }
);

FileField.displayName = 'FileField';
