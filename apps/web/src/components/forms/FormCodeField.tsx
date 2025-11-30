import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { CodeFieldProps } from './fields/CodeField';
import { CodeField } from './fields/CodeField';
import type { AnyFieldValidators, AnyFormFieldComponent } from './shared/form.types';

export interface FormCodeFieldProps extends Omit<
  CodeFieldProps,
  'children' | 'error' | 'form' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
}

export const FormCodeField = ({ form, name, validators, children, ...codeFieldProps }: FormCodeFieldProps) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        return (
          <>
            <CodeField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? ''}
              onChange={(value) => {
                field.handleChange(value);
              }}
              onBlur={field.handleBlur}
              error={error}
              {...codeFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
