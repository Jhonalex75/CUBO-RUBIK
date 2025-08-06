"use client";

import * as React from 'react';
import { RubiksCubeView } from '@/components/rubiks-cube-view';
import { SolverPanel } from '@/components/solver-panel';
import type { RubiksCubeHandle } from '@/lib/types';
import { solutionSteps } from '@/lib/cube-constants';
import { explainNextStep } from '@/ai/flows/explain-next-step';
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

  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiHint, setAiHint] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleScramble = async () => {
    if (isRotating || !cubeRef.current) return;
    setIsRotating(true);
    setAiHint(null);
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
    setAiHint(null);
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
    setAiHint(null);
    setIsRotating(false);
  };

  const handleManualMove = async (move: string) => {
    if (isRotating || !cubeRef.current) return;
    setIsRotating(true);
    await cubeRef.current.executeMove(move, 400);
    setIsRotating(false);
  };

  const handleGetAIHint = async () => {
    if (aiLoading || !cubeRef.current || currentMoveIndex < 0) return;
    setAiLoading(true);

    try {
      let movesCount = 0;
      let currentStep = null;
      for (const step of solutionSteps) {
          const stepMoves = step.algorithm.split(' ').filter(m => m);
          if (currentMoveIndex < movesCount + stepMoves.length) {
              currentStep = step;
              break;
          }
          movesCount += stepMoves.length;
      }
      
      if (!currentStep) {
        throw new Error("Could not determine current solution step.");
      }

      const cubeState = await cubeRef.current.getCubeState();
      
      const result = await explainNextStep({
        stepTitle: currentStep.title,
        stepExplanation: currentStep.explanation,
        cubeState: cubeState
      });

      setAiHint(result.simplifiedExplanation);
    } catch (error) {
      console.error("Error getting AI hint:", error);
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: "No se pudo obtener la pista del asistente de IA.",
      });
      setAiHint(null);
    } finally {
      setAiLoading(false);
    }
  };

  if (!isMounted) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col lg:flex-row bg-background text-foreground overflow-hidden">
      <div className="flex-grow relative h-1/2 lg:h-full w-full lg:w-auto">
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
      <aside className="w-full lg:w-[420px] flex-shrink-0 h-1/2 lg:h-full bg-card border-l border-border flex flex-col">
        <SolverPanel
          solutionSequence={solutionSequence}
          currentMoveIndex={currentMoveIndex}
          isScrambled={isScrambled}
          isRotating={isRotating}
          aiHint={aiHint}
          aiLoading={aiLoading}
          onPrevMove={() => playMove('prev')}
          onNextMove={() => playMove('next')}
          onManualMove={handleManualMove}
          onGetAIHint={handleGetAIHint}
        />
      </aside>
    </main>
  );
}
