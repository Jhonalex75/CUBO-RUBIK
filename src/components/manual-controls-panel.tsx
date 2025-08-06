"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ManualControlsPanelProps {
  isRotating: boolean;
  onManualMove: (move: string) => void;
}

export function ManualControlsPanel({
  isRotating,
  onManualMove,
}: ManualControlsPanelProps) {

  const manualMoves = [
    "U", "F", "R", "L", "B", "D",
    "U'", "F'", "R'", "L'", "B'", "D'",
    "U2", "F2", "R2", "L2", "B2", "D2",
  ];

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Controles Manuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
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
