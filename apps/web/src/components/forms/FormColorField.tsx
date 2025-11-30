import type { ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

import type { ColorFieldProps } from './fields/ColorField';
import { ColorField } from './fields/ColorField';
import type { AnyFieldValidators, AnyFormFieldComponent } from './shared/form.types';

export interface FormColorFieldProps extends Omit<
  ColorFieldProps,
  'children' | 'error' | 'form' | 'onBlur' | 'onChange' | 'value'
> {
  children?: (field: AnyFieldApi) => ReactNode;
  form: {
    Field: AnyFormFieldComponent;
  };
  name: string;
  validators?: AnyFieldValidators;
}

export const FormColorField = ({ form, name, validators, children, ...colorFieldProps }: FormColorFieldProps) => {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const rawError = field.state.meta.errors[0];
        const error = typeof rawError === 'string' ? rawError : undefined;

        return (
          <>
            <ColorField
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={field.state.value ?? '#22d3ee'}
              onChange={(value) => {
                field.handleChange(value);
              }}
              onBlur={field.handleBlur}
              error={error}
              {...colorFieldProps}
            />
            {children?.(field)}
          </>
        );
      }}
    </form.Field>
  );
};
