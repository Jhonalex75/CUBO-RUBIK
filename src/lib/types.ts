export interface RubiksCubeHandle {
  scramble: () => Promise<string[]>;
  reset: () => void;
  executeMove: (move: string, duration: number) => Promise<void>;
  getInverseMove: (move: string) => string;
  getCubeState: () => Promise<string>;
}
