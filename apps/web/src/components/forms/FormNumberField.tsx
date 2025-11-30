import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { NumberFieldProps } from './fields/NumberField';
import { NumberField } from './fields/NumberField';
import type { AnyFieldValidators, AnyFormFieldComponent } from './shared/form.types';

export interface FormNumberFieldProps extends Omit<
  NumberFieldProps,
  'children' | 'error' | 'form' | 'name' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
}

export const FormNumberField = ({ form, name, validators, children, ...numberFieldProps }: FormNumberFieldProps) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        return (
          <>
            <NumberField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? ''}
              onChange={(value) => {
                field.handleChange(value);
              }}
              onBlur={field.handleBlur}
              error={error}
              {...numberFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
