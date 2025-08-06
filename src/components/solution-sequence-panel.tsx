"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SolutionSequencePanelProps {
  solutionSequence: string[];
  currentMoveIndex: number;
  isScrambled: boolean;
  isRotating: boolean;
  onPrevMove: () => void;
  onNextMove: () => void;
}

export function SolutionSequencePanel({
  solutionSequence,
  currentMoveIndex,
  isScrambled,
  isRotating,
  onPrevMove,
  onNextMove,
}: SolutionSequencePanelProps) {

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card className="flex flex-col flex-grow">
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
          <div className="flex justify-between items-center mt-4">
            <Button onClick={onPrevMove} disabled={isRotating || currentMoveIndex < 0} variant="secondary" size="icon">
              <ArrowLeft className="h-4 w-4" /> 
            </Button>
            <span className="text-xs text-muted-foreground">{currentMoveIndex + 1} / {solutionSequence.length}</span>
            <Button onClick={onNextMove} disabled={isRotating || currentMoveIndex >= solutionSequence.length - 1} variant="secondary" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
