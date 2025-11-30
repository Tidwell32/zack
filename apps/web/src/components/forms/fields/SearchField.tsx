import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils';

import type { InputVariant } from '../shared/form.types';
import { variantClasses } from '../shared/inputStyles';

import type { TextFieldProps } from './TextField';
import { TextField } from './TextField';

export interface SearchOption<T = any> {
  data?: T;
  id: string;
  label: string;
}

export interface SearchFieldProps<T = any> extends Omit<TextFieldProps, 'onChange'> {
  emptyMessage?: string;
  loading?: boolean;
  onChange: (value: string, option?: SearchOption<T>) => void;
  onOptionSelect?: (option: SearchOption<T>) => void;
  options?: Array<SearchOption<T>>;
  renderOption?: (option: SearchOption<T>) => ReactNode;
  variant?: InputVariant;
}

export const SearchField = <T,>({
  value,
  onChange,
  options = [],
  loading = false,
  onOptionSelect,
  renderOption,
  emptyMessage = 'No results found',
  onBlur,
  variant = 'primary',
  ...textFieldProps
}: SearchFieldProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasResults = options.length > 0;
  const showDropdown = isOpen && value.length > 0 && (loading || hasResults || !!emptyMessage);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Reset selected index when options change (e.g., from search filtering)
    queueMicrotask(() => {
      setSelectedIndex(-1);
    });
  }, [options]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleOptionClick = (option: SearchOption<T>) => {
    onChange(option.label, option);
    onOptionSelect?.(option);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          handleOptionClick(options[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      onBlur?.();
    }, 150);
  };

  return (
    <div ref={containerRef} className="relative">
      <TextField
        ref={inputRef}
        value={value}
        variant={variant}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsOpen(true);
        }}
        {...textFieldProps}
      />

      {showDropdown && (
        <div
          className={cn(
            'absolute z-40 w-full mt-1 rounded border-2 shadow-lg max-h-60 overflow-auto',
            variantClasses[variant]
          )}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-neutral-400">Loading...</div>
          ) : options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-neutral-400">{emptyMessage}</div>
          ) : (
            <ul className="py-1">
              {options.map((option, index) => (
                <li
                  key={option.id}
                  onClick={() => {
                    handleOptionClick(option);
                  }}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    index === selectedIndex
                      ? 'bg-neutral-700 text-neutral-100'
                      : 'text-neutral-200 hover:bg-neutral-800'
                  )}
                >
                  {renderOption ? renderOption(option) : option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
