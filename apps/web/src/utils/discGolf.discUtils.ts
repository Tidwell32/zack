import type { Disc, FlightNumbers } from '@/types/discs';

export const getEffectiveFlightNumbers = (disc: Disc): FlightNumbers => {
  return disc.adjustedFlight ?? disc.stockFlight;
};
