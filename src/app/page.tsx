"use client";

import * as React from 'react';
import { RubiksCubeView } from '@/components/rubiks-cube-view';
import { SolutionSequencePanel } from '@/components/solution-sequence-panel';
import { ManualControlsPanel } from '@/components/manual-controls-panel';
import type { RubiksCubeHandle } from '@/lib/types';
import { solutionSteps } from '@/lib/cube-constants';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

export default function Home() {
  const cubeRef = React.useRef<RubiksCubeHandle>(null);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isRotating, setIsRotating] = React.useState(false);
  const [isScrambled, setIsScrambled] = React.useState(false);
  const [solutionSequence, setSolutionSequence] = React.useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(-1);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScramble = async () => {
    if (isRotating || !cubeRef.current) return;
    setIsRotating(true);
    const sequence = await cubeRef.current.scramble();
    setSolutionSequence(sequence);
    setCurrentMoveIndex(-1);
    setIsScrambled(true);
    setIsRotating(false);
  };

  const handleReset = () => {
    if (isRotating || !cubeRef.current) return;
    cubeRef.current.reset();
    setSolutionSequence([]);
    setCurrentMoveIndex(-1);
    setIsScrambled(false);
  };

  const playMove = async (direction: 'next' | 'prev') => {
    if (isRotating || !cubeRef.current) return;
    setIsRotating(true);

    let move: string | undefined;
    let newIndex = currentMoveIndex;

    if (direction === 'next' && currentMoveIndex < solutionSequence.length - 1) {
      newIndex = currentMoveIndex + 1;
      move = solutionSequence[newIndex];
      await cubeRef.current.executeMove(move, 400);
    } else if (direction === 'prev' && currentMoveIndex >= 0) {
      move = solutionSequence[currentMoveIndex];
      await cubeRef.current.executeMove(cubeRef.current.getInverseMove(move), 400);
      newIndex = currentMoveIndex - 1;
    }
    
    setCurrentMoveIndex(newIndex);
    setIsRotating(false);
  };

  const handleManualMove = async (move: string) => {
    if (isRotating || !cubeRef.current) return;
    setIsRotating(true);
    await cubeRef.current.executeMove(move, 400);
    setIsRotating(false);
  };

  if (!isMounted) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
       </div>
    );
  }
  
  const currentStep = solutionSteps.find(step => {
      const stepMovesCount = step.algorithm.split(' ').filter(m => m).length;
      const stepEndIndex = (solutionSequence.findIndex(s => s === step.algorithm.split(' ').filter(m=>m)[0]) ?? -1) + stepMovesCount;
      return isScrambled && currentMoveIndex < stepEndIndex && currentMoveIndex >= (stepEndIndex - stepMovesCount);
  });
  
  let movesCount = 0;
  let currentStepTitle = "";
  let currentStepExplanation = "";
  if (isScrambled) {
    for (const step of solutionSteps) {
        const stepMoves = step.algorithm.split(' ').filter(m => m);
        if (currentMoveIndex < movesCount + stepMoves.length) {
            currentStepTitle = step.title;
            currentStepExplanation = step.explanation;
            break;
        }
        movesCount += stepMoves.length;
    }
  }


  return (
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <aside className="w-1/4 lg:w-[calc(100%/8)] h-full bg-card border-r border-border flex flex-col">
        <SolutionSequencePanel
            solutionSequence={solutionSequence}
            currentMoveIndex={currentMoveIndex}
            isScrambled={isScrambled}
            isRotating={isRotating}
            onPrevMove={() => playMove('prev')}
            onNextMove={() => playMove('next')}
            currentStepTitle={currentStepTitle}
            currentStepExplanation={currentStepExplanation}
        />
      </aside>

      <div className="flex-grow relative h-full w-3/4 lg:w-6/8">
        <RubiksCubeView ref={cubeRef} isRotating={isRotating} setIsRotating={setIsRotating} />
        
        <div className="absolute top-5 left-5 bg-card/80 backdrop-blur-sm p-4 rounded-lg border max-w-sm shadow-lg">
           <h1 className="text-xl font-bold mb-2 text-card-foreground">Asistente de Cubo de Rubik</h1>
           <p className="text-sm text-muted-foreground">
             Usa el mouse para rotar la cámara. Mezcla el cubo y sigue la solución o practica con los controles manuales.
           </p>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-card/80 backdrop-blur-sm rounded-lg border shadow-lg">
          <button onClick={handleScramble} disabled={isRotating} className="btn-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold">
            Mezclar
          </button>
          <button onClick={handleReset} disabled={isRotating} className="btn-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold">
            Reiniciar
          </button>
        </div>
      </div>

      <aside className="w-1/4 lg:w-[calc(100%/8)] h-full bg-card border-l border-border flex flex-col">
        <ManualControlsPanel
          isRotating={isRotating}
          onManualMove={handleManualMove}
        />
      </aside>
    </main>
  );
}
