import type { Session, Throw } from '@/types/techdisc';
import type { Round } from '@/types/udisc';

// YYYY-MM-DD
interface DateFilterParams {
  date?: string;
  endDate?: string;
  startDate?: string;
}

export const isUserUploadedThrows = (throws: Throw[]): boolean => {
  if (throws.length === 0) return false;
  return !throws[0].userId;
};

export const isUserUploadedRounds = (rounds: Round[]): boolean => {
  if (rounds.length === 0) return false;
  return !rounds[0].userId;
};

export const isUserUploadedSessions = (cachedThrows: Throw[]): boolean => {
  return isUserUploadedThrows(cachedThrows);
};

export const filterThrowsByDate = (throws: Throw[], params: DateFilterParams): Throw[] => {
  if (!params.date && !params.startDate && !params.endDate) {
    return throws;
  }

  return throws.filter((t) => {
    const throwDate = t.time.split('T')[0];

    if (params.date) {
      return throwDate === params.date;
    }

    if (params.startDate && throwDate < params.startDate) {
      return false;
    }
    if (params.endDate && throwDate > params.endDate) {
      return false;
    }

    return true;
  });
};

export const filterRoundsByDate = (rounds: Round[], params: DateFilterParams): Round[] => {
  if (!params.date && !params.startDate && !params.endDate) {
    return rounds;
  }

  return rounds.filter((round) => {
    const roundDate = round.startTime.split('T')[0];

    if (params.date) {
      return roundDate === params.date;
    }

    if (params.startDate && roundDate < params.startDate) {
      return false;
    }
    if (params.endDate && roundDate > params.endDate) {
      return false;
    }

    return true;
  });
};

export const hasDateFilters = (params: DateFilterParams): boolean => {
  return !!params.date || !!params.startDate || !!params.endDate;
};

export const filterSessionsByDate = (sessions: Session[], params: DateFilterParams): Session[] => {
  if (!params.date && !params.startDate && !params.endDate) {
    return sessions;
  }

  return sessions.filter((session) => {
    const sessionDate = session.sessionDate;

    if (params.date) {
      return sessionDate === params.date;
    }

    if (params.startDate && sessionDate < params.startDate) {
      return false;
    }
    if (params.endDate && sessionDate > params.endDate) {
      return false;
    }

    return true;
  });
};
