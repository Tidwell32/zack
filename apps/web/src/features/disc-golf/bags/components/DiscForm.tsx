import { useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';

import {
  FieldWrapperLabel,
  FormColorField,
  FormNumberField,
  FormSearchField,
  FormSubmit,
  FormTextareaField,
  FormTextField,
} from '@/components/forms';
import { Grid } from '@/components/ui';
import type { AddDiscInput } from '@/data-access/bags';
import { useAddDiscToBag } from '@/data-access/bags';
import { useSearchDiscs } from '@/data-access/catalog';
import { useUpdateDisc } from '@/data-access/discs';
import { useDebounce } from '@/hooks';
import type { CatalogDisc } from '@/types';
import { getEffectiveFlightNumbers } from '@/utils';

import { useBagsContext } from '../providers/BagsProvider';

interface DiscFormData {
  brand: string;
  colorHex: string;
  fade: number | undefined;
  glide: number | undefined;
  name: string;
  notes: string;
  plastic: string;
  speed: number | undefined;
  turn: number | undefined;
  weight: number | undefined;
}

interface DiscFormProps {
  edit?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const DiscForm = ({ edit = false, onSuccess, onCancel }: DiscFormProps) => {
  const [catalogDisc, setCatalogDisc] = useState<CatalogDisc | null>(null);
  const { mutate: addDisc } = useAddDiscToBag();
  const { mutate: updateDisc } = useUpdateDisc();
  const { selectedBag, selectedDisc } = useBagsContext();

  const hasDefault = edit && selectedDisc;

  const getDefaultFlightNumbers = () => {
    if (hasDefault) {
      const { speed, glide, turn, fade } = getEffectiveFlightNumbers(selectedDisc);
      return { speed, glide, turn, fade };
    } else {
      return { speed: undefined, glide: undefined, turn: undefined, fade: undefined };
    }
  };

  const form = useForm({
    defaultValues: {
      name: hasDefault ? selectedDisc.name : '',
      colorHex: hasDefault ? selectedDisc.colorHex : '#22d3ee',
      plastic: hasDefault ? selectedDisc.plastic : '',
      weight: hasDefault ? selectedDisc.weight : undefined,
      notes: hasDefault ? selectedDisc.notes : '',
      ...getDefaultFlightNumbers(),
    } as DiscFormData,
    onSubmit: ({ value }) => {
      const { speed, turn, glide, fade, notes, weight, colorHex, plastic } = value;
      const hasAdjustedFlight =
        speed !== catalogDisc?.speed ||
        turn !== catalogDisc?.turn ||
        glide !== catalogDisc?.glide ||
        fade !== catalogDisc?.fade;

      const payload = {
        bagId: selectedBag?._id,
        catalogDiscId: catalogDisc?._id,
        colorHex,
        notes,
        weight,
        plastic,
        adjustedFlight: hasAdjustedFlight
          ? {
              speed,
              fade,
              turn,
              glide,
            }
          : undefined,
      } as AddDiscInput;

      if (selectedBag && !edit) {
        addDisc(payload, {
          onSuccess: () => onSuccess?.(),
        });
      }

      if (hasDefault) {
        updateDisc({ _id: selectedDisc._id, ...payload }, { onSuccess: () => onSuccess?.() });
      }
    },
  });

  const query = useStore(form.store, (state) => state.values.name);
  const debouncedSearch = useDebounce(query, 300);
  const { data, isLoading } = useSearchDiscs({ q: debouncedSearch.length > 2 ? debouncedSearch : '' });

  // Map search results to options
  const searchOptions =
    data?.map((disc) => ({
      id: disc._id,
      label: disc.name,
      data: disc,
    })) ?? [];

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
    >
      <Grid.Parent>
        <Grid.Child xs={12} md={6}>
          <FormSearchField
            form={form}
            name="name"
            label="Disc Name"
            placeholder="Search discs..."
            emptyMessage={debouncedSearch.length < 3 ? 'Type three letters for results' : undefined}
            autoComplete="off"
            options={searchOptions}
            loading={isLoading}
            onOptionSelect={(option) => {
              const disc = option.data!;
              setCatalogDisc(disc);
              form.setFieldValue('speed', disc.speed);
              form.setFieldValue('glide', disc.glide);
              form.setFieldValue('turn', disc.turn);
              form.setFieldValue('fade', disc.fade);
              form.setFieldValue('brand', disc.brand);
            }}
            renderOption={(option) => {
              const disc = option.data!;
              return (
                <div>
                  <div className="font-medium">{disc.name}</div>
                  <div className="text-xs text-neutral-400">
                    {disc.brand} • {disc.speed}/{disc.glide}/{disc.turn}/{disc.fade}
                  </div>
                </div>
              );
            }}
            validators={{
              onChange: ({ value }: { value: string }) => (!value ? 'Required' : undefined),
            }}
            className="mb-4"
          />

          <FieldWrapperLabel>Flight Numbers</FieldWrapperLabel>
          <div className="grid grid-cols-4 mt-2 gap-2">
            <FormNumberField
              form={form}
              name="speed"
              placeholder="S"
              className="text-center"
              min={1}
              max={14}
              step={0.5}
              validators={{
                onChange: ({ value }: { value: number | '' }) =>
                  value === '' || (value >= 1 && value <= 14) ? undefined : '1-14',
              }}
            />
            <FormNumberField
              form={form}
              name="glide"
              placeholder="G"
              className="text-center"
              min={1}
              max={7}
              step={0.5}
              validators={{
                onChange: ({ value }: { value: number | '' }) =>
                  value === '' || (value >= 1 && value <= 7) ? undefined : '1-7',
              }}
            />
            <FormNumberField
              form={form}
              name="turn"
              placeholder="T"
              className="text-center"
              min={-5}
              max={1}
              step={0.5}
              validators={{
                onChange: ({ value }: { value: number | '' }) =>
                  value === '' || (value >= -5 && value <= 1) ? undefined : '-5 to 1',
              }}
            />
            <FormNumberField
              form={form}
              name="fade"
              placeholder="F"
              className="text-center"
              min={0}
              max={5}
              step={0.5}
              validators={{
                onChange: ({ value }: { value: number | '' }) =>
                  value === '' || (value >= 0 && value <= 5) ? undefined : '0-5',
              }}
            />
          </div>
        </Grid.Child>
        <Grid.Child xs={12} md={6}>
          <div className="flex flex-row flex-wrap gap-4 mb-4">
            <FormColorField form={form} name="colorHex" label="Color" showHex={false} />
            <FormNumberField
              form={form}
              name="weight"
              label="Weight"
              placeholder="175"
              min={100}
              max={200}
              validators={{
                onChange: ({ value }: { value: number | '' | undefined }) => {
                  if (value === '' || value === undefined) return undefined;
                  return value >= 100 && value <= 200 ? undefined : '100-200';
                },
              }}
            />
            <FormTextField form={form} name="plastic" label="Plastic" placeholder="Star, ESP, etc." />
          </div>
          <FormTextareaField form={form} name="notes" label="Optional notes..." />
        </Grid.Child>
      </Grid.Parent>
      <FormSubmit
        variant="filled"
        form={form}
        label={edit ? 'Update' : 'Add Disc'}
        submittingLabel={edit ? 'Updating...' : 'Adding...'}
        onCancel={onCancel}
        color="secondary"
      />
    </form>
  );
};
