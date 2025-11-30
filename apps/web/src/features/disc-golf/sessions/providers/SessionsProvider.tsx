import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

import type { Session } from '@/types/techdisc';

interface SessionsContextValue {
  selectedSession: Session | null;
  setSelectedSession: (sessionItem: Session | null) => void;
}

const SessionsContext = createContext<SessionsContextValue | undefined>(undefined);

interface SessionsProviderProps {
  children: ReactNode;
  sessions: Session[];
}

export const SessionsProvider = ({ sessions, children }: SessionsProviderProps) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(sessions[0] ?? null);

  return (
    <SessionsContext.Provider value={{ selectedSession, setSelectedSession }}>{children}</SessionsContext.Provider>
  );
};

export const useSessionsContext = () => {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessionsContext must be used within a SessionsProvider');
  }
  return context;
};
