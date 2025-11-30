import { useForm } from '@tanstack/react-form';

import { FormSubmit, FormTextField } from '@/components/forms';
import { useCreateBag } from '@/data-access/bags/bags.mutations';
import type { Bag } from '@/types';

interface BagFormProps {
  onCancel?: () => void;
  onSuccess?: (bag: Bag) => void;
}

export const BagForm = ({ onSuccess, onCancel }: BagFormProps) => {
  const { mutate: addBag } = useCreateBag();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: ({ value }) => {
      addBag(
        { name: value.name },
        {
          onSuccess,
        }
      );
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <FormTextField label="Bag Name" name="name" form={form} />
      <FormSubmit
        variant="filled"
        form={form}
        label="Add Bag"
        submittingLabel="Adding..."
        onCancel={onCancel}
        color="secondary"
      />
    </form>
  );
};
