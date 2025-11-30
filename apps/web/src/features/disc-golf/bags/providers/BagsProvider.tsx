import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import type { Bag } from '@/types/bags';
import type { Disc } from '@/types/discs';

interface BagsContextValue {
  selectedBag: Bag | null;
  selectedDisc: Disc | null;
  setSelectedBag: (bag: Bag | null) => void;
  setSelectedDisc: (disc: Disc | null) => void;
}

const BagsContext = createContext<BagsContextValue | undefined>(undefined);

interface DiscsProviderProps {
  bags: Bag[];
  children: ReactNode;
}

export const BagsProvider = ({ bags = [], children }: DiscsProviderProps) => {
  const [selectedBag, setSelectedBag] = useState<Bag | null>(bags[0] ?? null);
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  return (
    <BagsContext.Provider value={{ selectedBag, setSelectedBag, selectedDisc, setSelectedDisc }}>
      {children}
    </BagsContext.Provider>
  );
};

export const useBagsContext = () => {
  const context = useContext(BagsContext);
  if (context === undefined) {
    throw new Error('useBags must be used within a BagsProvider');
  }
  return context;
};
