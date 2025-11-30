export type Handedness = 'ambidextrous' | 'left' | 'right';

export interface Throw {
  _id: string;
  advanceRatio: number;
  createdAt: string;
  distanceFeet: number;
  distanceMeters: number;
  handedness?: Handedness;
  hyzerAngle: number;
  isOutlierDefault: boolean;
  isOutlierStrict: boolean;
  launchAngle: number;
  noseAngle: number;
  notes?: string;
  primaryThrowType: string;
  speedKmh: number;
  speedMph: number;
  spinRpm: number;
  tags: string[];
  techDiscId: number;
  throwType: string;
  time: string;
  updatedAt: string;
  userId?: string;
  wobbleAngle: number;
}

export interface ImportTechDiscCSVInput {
  file: File;
  handedness?: Handedness;
}

export interface ImportTechDiscCSVResponse {
  persisted: boolean;
  throws: Throw[];
}

export interface Session {
  avgHyzerAngle: number;
  avgLaunchAngle: number;
  avgNoseAngle: number;
  avgSpeedMph: number;
  avgSpinRpm: number;
  cleanThrowCount: number;
  handedness?: string;
  primaryThrowType: string;
  sessionDate: string;
  throwCount: number;
}
