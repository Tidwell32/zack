import type { ReactNode } from 'react';

import type { ClippedButtonVariant } from '@/components/ui';
import { ClippedButton } from '@/components/ui';
import { cn } from '@/utils';

import { Button } from '../ui';

type AnyFormSubscribeComponent = (props: {
  children: (selected: any) => ReactNode;
  selector?: (state: any) => any;
}) => ReactNode;

interface FormSubmitProps {
  cancelLabel?: string;
  className?: string;
  color?: 'primary' | 'secondary';
  form: {
    Subscribe: AnyFormSubscribeComponent;
  };
  label: string;
  onCancel?: () => void;
  submittingLabel?: string;
  variant?: ClippedButtonVariant;
}

export const FormSubmit = ({
  form,
  label,
  submittingLabel,
  onCancel,
  cancelLabel = 'Cancel',
  className,
  color = 'primary',
  variant = 'simple',
}: FormSubmitProps) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]: [boolean, boolean]) => (
        <div className={cn('flex gap-4 justify-end pt-4', className)}>
          {!!onCancel && (
            <Button
              variant="primaryGhost"
              onClick={() => {
                onCancel();
              }}
              disabled={isSubmitting}
              color={color === 'primary' ? 'secondary' : 'primary'}
            >
              {cancelLabel}
            </Button>
          )}

          <ClippedButton type="submit" disabled={!canSubmit} color={color} variant={variant} clipSize="sm">
            {isSubmitting ? (submittingLabel ?? label) : label}
          </ClippedButton>
        </div>
      )}
    </form.Subscribe>
  );
};
