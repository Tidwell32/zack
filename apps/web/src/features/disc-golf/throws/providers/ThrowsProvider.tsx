import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import type { Throw } from '@/types/techdisc';

interface ThrowsContextValue {
  selectedThrow: Throw | null;
  setSelectedThrow: (throwItem: Throw | null) => void;
}

const ThrowsContext = createContext<ThrowsContextValue | undefined>(undefined);

interface ThrowsProviderProps {
  children: ReactNode;
  throws: Throw[];
}

export const ThrowsProvider = ({ throws, children }: ThrowsProviderProps) => {
  const [selectedThrow, setSelectedThrow] = useState<Throw | null>(throws[0] ?? null);

  return <ThrowsContext.Provider value={{ selectedThrow, setSelectedThrow }}>{children}</ThrowsContext.Provider>;
};

export const useThrowsContext = () => {
  const context = useContext(ThrowsContext);
  if (context === undefined) {
    throw new Error('useThrowsContext must be used within a ThrowsProvider');
  }
  return context;
};
