import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { TextareaFieldProps } from './fields/TextareaField';
import { TextareaField } from './fields/TextareaField';
import type { AnyFieldValidators, AnyFormFieldComponent } from './shared/form.types';

export interface FormTextareaFieldProps extends Omit<
  TextareaFieldProps,
  'children' | 'error' | 'form' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
}

export const FormTextareaField = ({
  form,
  name,
  validators,
  children,
  ...textareaFieldProps
}: FormTextareaFieldProps) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        return (
          <>
            <TextareaField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? ''}
              onChange={(value) => {
                field.handleChange(value);
              }}
              onBlur={field.handleBlur}
              error={error}
              {...textareaFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
