import type { ReactNode } from 'react';
import type { AnyFieldApi, FieldValidators } from '@tanstack/react-form';

export type InputVariant = 'primary' | 'secondary' | 'subtle';

export type AnyFieldValidators = FieldValidators<
  any, // TParentData
  any, // TName
  any, // TData
  any, // TOnMount
  any, // TOnChange
  any, // TOnChangeAsync
  any, // TOnBlur
  any, // TOnBlurAsync
  any, // TOnSubmit
  any, // TOnSubmitAsync
  any, // TOnDynamic
  any // TOnDynamicAsync
>;

export type AnyFormFieldComponent = (props: {
  children: (field: AnyFieldApi) => ReactNode;
  name: string;
  validators?: AnyFieldValidators;
}) => ReactNode;
