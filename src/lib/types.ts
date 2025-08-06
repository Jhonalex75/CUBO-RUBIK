export interface RubiksCubeHandle {
  scramble: () => Promise<string[]>;
  reset: () => void;
  executeMove: (move: string, duration: number) => Promise<void>;
  getInverseMove: (move: string) => string;
  getCubeState: () => Promise<string>;
  isSolved: (state: string) => boolean;
}

// Type definition for js-cube-solver solve result
export type JscsSolve = string;
