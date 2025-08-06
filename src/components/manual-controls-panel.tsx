"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Cómo usar los controles?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm space-y-2">
              <p><span className="font-mono font-bold">F</span>: Cara Frontal (Front)</p>
              <p><span className="font-mono font-bold">B</span>: Cara Trasera (Back)</p>
              <p><span className="font-mono font-bold">U</span>: Cara Superior (Up)</p>
              <p><span className="font-mono font-bold">D</span>: Cara Inferior (Down)</p>
              <p><span className="font-mono font-bold">L</span>: Cara Izquierda (Left)</p>
              <p><span className="font-mono font-bold">R</span>: Cara Derecha (Right)</p>
              <p>El apóstrofo (<span className="font-mono font-bold">'</span>) indica un giro antihorario. El número <span className="font-mono font-bold">2</span> indica un giro de 180 grados.</p>
              <p>La vista por defecto te muestra la cara frontal (verde), la superior (blanca) y la derecha (roja).</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    