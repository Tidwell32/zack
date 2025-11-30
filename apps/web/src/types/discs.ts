export interface FlightNumbers {
  fade: number;
  glide: number;
  speed: number;
  turn: number;
}

export interface Disc {
  _id: string;
  adjustedFlight?: FlightNumbers;
  bagId: string;
  brand: string;
  brandSlug: string;
  catalogDiscId: string;
  category: string;
  categorySlug: string;
  colorHex?: string;
  createdAt: string;
  name: string;
  nameSlug: string;
  notes?: string;
  plastic?: string;
  stockFlight: FlightNumbers;
  updatedAt: string;
  userId: string;
  weight?: number;
}
