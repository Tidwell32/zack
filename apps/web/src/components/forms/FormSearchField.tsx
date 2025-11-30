import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { SearchFieldProps, SearchOption } from './fields/SearchField';
import { SearchField } from './fields/SearchField';
import type { AnyFieldValidators, AnyFormFieldComponent, InputVariant } from './shared/form.types';

export interface FormSearchFieldProps<T> extends Omit<
  SearchFieldProps<T>,
  'children' | 'error' | 'form' | 'name' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
  variant?: InputVariant;
}

export const FormSearchField = <T,>({
  form,
  name,
  validators,
  children,
  onOptionSelect,
  ...searchFieldProps
}: FormSearchFieldProps<T>) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        const handleChange = (value: string) => {
          field.handleChange(value);
        };

        const handleOptionSelect = (option: SearchOption<T>) => {
          onOptionSelect?.(option);
        };

        return (
          <>
            <SearchField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? ''}
              onChange={handleChange}
              onBlur={field.handleBlur}
              onOptionSelect={handleOptionSelect}
              error={error}
              {...searchFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
