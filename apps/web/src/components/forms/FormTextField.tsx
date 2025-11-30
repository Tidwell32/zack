import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { TextFieldProps } from './fields/TextField';
import { TextField } from './fields/TextField';
import type { AnyFieldValidators, AnyFormFieldComponent } from './shared/form.types';

export interface FormTextFieldProps extends Omit<
  TextFieldProps,
  'children' | 'error' | 'form' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
}

export const FormTextField = ({ form, name, validators, children, ...textFieldProps }: FormTextFieldProps) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        return (
          <>
            <TextField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? ''}
              onChange={(value) => {
                field.handleChange(value);
              }}
              onBlur={field.handleBlur}
              error={error}
              {...textFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
