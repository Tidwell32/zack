export interface Round {
  _id: string;
  courseName: string;
  createdAt: string;
  endTime: string;
  holeCount: number;
  layoutName: string;
  normalizedCourseId: string;
  normalizedCourseName: string;
  pars: number[];
  players: PlayerScore[];
  startTime: string;
  totalPar: number;
  updatedAt: string;
  userId?: string;
}

interface PlayerScore {
  holeCount: number;
  isComplete: boolean;
  playerName: string;
  plusMinus: number;
  plusMinusInt?: number;
  roundRating?: number;
  scores: number[];
  total?: number;
}

export interface RoundsResponse {
  primaryPlayer: string;
  rounds: Round[];
}

export interface ImportUDiscResponse {
  courses: CourseInfo[];
  persisted: boolean;
  players: string[];
  primaryPlayer: string;
  rounds: Round[];
}

export interface CourseInfo {
  courseName: string;
  layoutName: string;
}
