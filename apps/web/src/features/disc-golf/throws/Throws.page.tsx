import { Suspense, useState } from 'react';
import { Await } from 'react-router';

import { SelectField } from '@/components/forms';
import { ClippedButton, ClippedDialog, CsvImportCard, Typography } from '@/components/ui';
import { DialogDescription, DialogTitle, VisuallyHidden } from '@/components/ui/ClippedDialog';
import { Loading } from '@/components/ui/Loading';
import { useImportTechDiscCsv } from '@/data-access/techdisc';
import { useTypedLoaderData } from '@/hooks';
import type { Handedness, Throw } from '@/types';

import { ThrowsScatterPlot, ThrowsTable } from './components';
import { ThrowsProvider } from './providers/ThrowsProvider';
import type { ThrowsLoaderData } from './throws.loader';
import { ThrowsSkeleton } from './ThrowsSkeleton';

export const Throws = () => {
  const { throws } = useTypedLoaderData<ThrowsLoaderData>();

  const [handedness, setHandedness] = useState<Handedness>('right');
  const [showWarning, setShowWarning] = useState(false);
  const { mutate: importCsv, isPending } = useImportTechDiscCsv();

  const handleImport = (file: File) => {
    importCsv({ file, handedness });
  };

  return (
    <Suspense fallback={<ThrowsSkeleton />}>
      <Await resolve={throws}>
        {(resolvedThrows: Throw[]) => (
          <ThrowsProvider throws={resolvedThrows}>
            <div className="flex flex-col gap-4">
              <CsvImportCard onImport={handleImport}>
                <SelectField
                  labelPosition="left"
                  label="Handedness:"
                  value={handedness}
                  onChange={(val) => {
                    if (val === 'ambidextrous') setShowWarning(true);
                    setHandedness(val as Handedness);
                  }}
                  placeholder="Handedness"
                  options={[
                    { value: 'left', label: 'Left' },
                    { value: 'right', label: 'Right' },
                    { value: 'ambidextrous', label: 'Ambidextrous' },
                  ]}
                />
              </CsvImportCard>
              <Loading overlay isLoading={isPending} />
              <ThrowsScatterPlot />
              <ThrowsTable />
            </div>
            <ClippedDialog
              open={showWarning}
              onOpenChange={() => {
                setShowWarning(false);
              }}
            >
              <div className="flex flex-col gap-4 p-4">
                <VisuallyHidden>
                  <DialogTitle>Ambidextrous Handedness Warning</DialogTitle>
                </VisuallyHidden>
                <DialogDescription asChild>
                  <Typography variant="monoStat">
                    Hey fellow ambi-thrower! TechDisc does not include handedness in their csv export, so for this to
                    accurately capture your throws, you must tag each throw as right and left. Yeah it's annoying,
                    sorry.
                  </Typography>
                </DialogDescription>
                <ClippedButton
                  onClick={() => {
                    setShowWarning(false);
                  }}
                >
                  Got it
                </ClippedButton>
              </div>
            </ClippedDialog>
          </ThrowsProvider>
        )}
      </Await>
    </Suspense>
  );
};
