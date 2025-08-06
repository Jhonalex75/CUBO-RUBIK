"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Bot, Loader2 } from "lucide-react";
import { solutionSteps } from "@/lib/cube-constants";

interface SolverPanelProps {
  solutionSequence: string[];
  currentMoveIndex: number;
  isScrambled: boolean;
  isRotating: boolean;
  aiHint: string | null;
  aiLoading: boolean;
  onPrevMove: () => void;
  onNextMove: () => void;
  onManualMove: (move: string) => void;
  onGetAIHint: () => void;
}

export function SolverPanel({
  solutionSequence,
  currentMoveIndex,
  isScrambled,
  isRotating,
  aiHint,
  aiLoading,
  onPrevMove,
  onNextMove,
  onManualMove,
  onGetAIHint,
}: SolverPanelProps) {

  const manualMoves = [
    "U", "F", "R", "U'", "F'", "R'",
    "D", "B", "L", "D'", "B'", "L'"
  ];

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
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Secuencia de Solución</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <ScrollArea className="h-48 w-full pr-4">
            <div className="flex flex-wrap gap-2">
              {isScrambled ? (
                solutionSequence.map((move, index) => (
                  <Badge
                    key={index}
                    variant={index === currentMoveIndex ? "default" : "secondary"}
                    className="text-lg font-mono"
                  >
                    {move}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Mezcla el cubo para ver la solución...</p>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-between mt-4">
            <Button onClick={onPrevMove} disabled={isRotating || currentMoveIndex < 0} variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button onClick={onNextMove} disabled={isRotating || currentMoveIndex >= solutionSequence.length - 1} variant="secondary">
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isScrambled && (
        <Card>
            <CardHeader>
                <CardTitle>{currentStepTitle || 'Paso Actual'}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{currentStepExplanation || 'Sigue los pasos para resolver el cubo.'}</p>
                <Button onClick={onGetAIHint} disabled={aiLoading || isRotating || currentMoveIndex < 0} className="w-full">
                    {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                    Obtener pista de IA
                </Button>
                {aiHint && (
                    <div className="mt-4 p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{aiHint}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Controles Manuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {manualMoves.map((move) => (
              <Button key={move} onClick={() => onManualMove(move)} disabled={isRotating} variant="secondary" className="font-mono text-lg">
                {move}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
