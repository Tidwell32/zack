import { useState } from 'react';

import { SelectField } from '@/components/forms';
import { CirclePlusIcon } from '@/components/icons';
import { ClippedButton, ClippedCard, Grid, HudDrawer, IconButton } from '@/components/ui';
import { useBags } from '@/data-access/bags';
import { useDeleteDisc, useDiscsForBag } from '@/data-access/discs/';
import { cn, getEffectiveFlightNumbers, toSentenceCase } from '@/utils';

import { useBagsContext } from '../providers/BagsProvider';

import { BagForm } from './BagForm';
import { DiscForm } from './DiscForm';
import { DiscRow } from './DiscRow';

type DiscSort = 'speed-asc' | 'speed-desc' | 'stability-asc' | 'stability-desc';

export const DiscList = () => {
  const { selectedBag, setSelectedBag, selectedDisc, setSelectedDisc } = useBagsContext();
  const { data: discs = [] } = useDiscsForBag({ bagId: selectedBag?._id });
  const { data: bags = [] } = useBags({});
  const [hudDrawer, setHudDrawer] = useState<'addDisc' | 'deleteDisc?' | 'editDisc' | 'newBag' | null>(null);
  const [sort, setSort] = useState<DiscSort>('speed-desc');

  const { mutate: deleteDisc } = useDeleteDisc();

  const handleDeleteDisc = () => {
    if (selectedDisc && selectedBag) {
      deleteDisc(
        { _id: selectedDisc._id, bagId: selectedBag._id },
        {
          onSuccess: () => {
            setHudDrawer(null);
          },
        }
      );
    }
  };

  const sortedDiscs = [...discs].sort((a, b) => {
    const { speed: aSpeed, turn: aTurn, fade: aFade } = getEffectiveFlightNumbers(a);
    const { speed: bSpeed, turn: bTurn, fade: bFade } = getEffectiveFlightNumbers(b);

    switch (sort) {
      default:
      case 'speed-desc':
        return bSpeed - aSpeed;
      case 'speed-asc':
        return aSpeed - bSpeed;
      case 'stability-desc':
        return bTurn + bFade - (aTurn + aFade);
      case 'stability-asc':
        return aTurn + aFade - (bTurn + bFade);
    }
  });

  const bagOptions = bags.map((bag) => ({
    value: bag._id,
    label: bag.name,
  }));

  const handleSelectBag = (_id: string) => {
    setSelectedBag(bags.find((bag) => bag._id === _id) ?? bags[0]);
  };

  return (
    <>
      <ClippedCard className="w-full md:w-1/2 font-mono" accents={['bottom-right']}>
        <div className="flex flex-row gap-4 flex-wrap items-center pb-4 border-b border-primary-soft">
          <SelectField
            options={bagOptions}
            value={selectedBag?._id ?? ''}
            onChange={(value) => {
              handleSelectBag(value);
            }}
          />
          <IconButton
            variant="primaryGhost"
            onClick={() => {
              setHudDrawer('newBag');
            }}
          >
            <CirclePlusIcon size={24} />
          </IconButton>

          <ClippedButton
            clipSize="sm"
            className={cn('ml-auto rotate', sort === 'speed-asc' && 'rotate-180')}
            variant="simple"
            color={sort.includes('speed') ? 'secondary' : 'primary'}
            onClick={() => {
              setSort((prevValue) => (prevValue === 'speed-desc' ? 'speed-asc' : 'speed-desc'));
            }}
          >
            Speed
          </ClippedButton>

          <ClippedButton
            clipSize="sm"
            className={cn('rotate', sort === 'stability-asc' && 'rotate-180')}
            variant="simple"
            color={sort.includes('stability') ? 'secondary' : 'primary'}
            onClick={() => {
              setSort((prevValue) => (prevValue === 'stability-desc' ? 'stability-asc' : 'stability-desc'));
            }}
          >
            Stability
          </ClippedButton>
        </div>

        <Grid.Parent className=" h-[500px] overflow-y-auto py-4">
          {sortedDiscs.map((disc) => {
            const isSelected = disc._id === selectedDisc?._id;
            return (
              <Grid.Child key={disc._id}>
                <ClippedCard
                  className="w-full cursor-pointer"
                  clipSize="sm"
                  borderWidth={isSelected ? 3 : 1}
                  borderColor={disc.colorHex}
                  onClick={() => {
                    setSelectedDisc(disc);
                  }}
                >
                  <DiscRow
                    disc={disc}
                    isSelected={isSelected}
                    onDelete={() => {
                      setHudDrawer('deleteDisc?');
                    }}
                    onEdit={() => {
                      setHudDrawer('editDisc');
                    }}
                  />
                </ClippedCard>
              </Grid.Child>
            );
          })}
        </Grid.Parent>

        <div className="flex flex-row w-full justify-center items-center pt-4 border-t border-primary-soft">
          <ClippedButton
            onClick={() => {
              setHudDrawer('addDisc');
            }}
            variant="simple"
            clipSize="sm"
          >
            Add Disc
          </ClippedButton>
        </div>
      </ClippedCard>

      <HudDrawer
        title={toSentenceCase(hudDrawer ?? '')}
        open={!!hudDrawer}
        onOpenChange={() => {
          setHudDrawer(null);
        }}
      >
        {(hudDrawer === 'editDisc' || hudDrawer === 'addDisc') && (
          <DiscForm
            edit={hudDrawer === 'editDisc'}
            onCancel={() => {
              setHudDrawer(null);
            }}
            onSuccess={() => {
              setHudDrawer(null);
            }}
          />
        )}

        {hudDrawer === 'deleteDisc?' && (
          <div className="flex flex-row gap-4 mt-10 min-h-[200px] justify-center items-start w-full">
            <ClippedButton
              color="primary"
              variant="filled"
              clipSize="sm"
              onClick={() => {
                setHudDrawer(null);
              }}
            >
              Cancel
            </ClippedButton>
            <ClippedButton color="secondary" variant="filled" clipSize="sm" onClick={handleDeleteDisc}>
              Delete
            </ClippedButton>
          </div>
        )}

        {hudDrawer === 'newBag' && (
          <div className="w-full p-4">
            <BagForm
              onCancel={() => {
                setHudDrawer(null);
              }}
              onSuccess={(bag) => {
                setSelectedBag(bag);
                setHudDrawer(null);
              }}
            />
          </div>
        )}
      </HudDrawer>
    </>
  );
};
