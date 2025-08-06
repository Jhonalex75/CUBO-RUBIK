"use client";

import * as React from 'react';
import { RubiksCubeView } from '@/components/rubiks-cube-view';
import { SolutionSequencePanel } from '@/components/solution-sequence-panel';
import { ManualControlsPanel } from '@/components/manual-controls-panel';
import type { RubiksCubeHandle } from '@/lib/types';
import { solutionSteps } from '@/lib/cube-constants';
import { useToast } from "@/hooks/use-toast";
import { Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type {JscsSolve} from 'js-cube-solver';

declare global {
  interface Window {
    Cube: any;
  }
}


export default function Home() {
  const cubeRef = React.useRef<RubiksCubeHandle>(null);
  const { toast } = useToast();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isRotating, setIsRotating] = React.useState(false);
  const [isSolving, setIsSolving] = React.useState(false);
  const [isScrambled, setIsScrambled] = React.useState(false);
  const [solutionSequence, setSolutionSequence] = React.useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = React.useState(-1);
  const [solverReady, setSolverReady] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Check if the solver script has loaded.
     const checkSolver = () => {
        if (typeof window.Cube !== 'undefined') {
            try {
                // The library is loaded. Now we can initialize the engine.
                window.Cube.initSolver();
                setSolverReady(true);
            } catch (e) {
                console.error("Failed to initialize solver:", e);
                 toast({
                    title: "Error del Solucionador",
                    description: "No se pudo inicializar el motor de resolución.",
                    variant: "destructive",
                });
            }
        } else {
            // The library isn't ready yet, check again.
            setTimeout(checkSolver, 100);
        }
    };
    checkSolver();
  }, [toast]);

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

  const handleSolveFromCurrentState = async () => {
    if (isRotating || !cubeRef.current || !isScrambled) return;
    setIsSolving(true);
    
    // Ensure solver is ready before using it.
    if (!solverReady) {
        toast({
            title: "El solucionador no está listo",
            description: "Por favor, espera a que el motor de resolución termine de cargarse.",
            variant: "destructive"
        });
        setIsSolving(false);
        return;
    }

    try {
      const cubeState = await cubeRef.current.getCubeState();
      const solution: JscsSolve = window.Cube.solve(cubeState);
      if (!solution || solution.length === 0) {
        throw new Error("El solucionador no pudo encontrar una solución.");
      }
      const newSequence = solution.split(' ').filter((m: string) => m);
      setSolutionSequence(newSequence);
      setCurrentMoveIndex(-1);
    } catch (error) {
      console.error("Error solving cube:", error);
      toast({
        title: "Error del Solucionador",
        description: "No se pudo generar una solución. Por favor, intenta mezclar de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSolving(false);
    }
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
    setSolutionSequence([]);
    setCurrentMoveIndex(-1);
    setIsScrambled(true); // After a manual move, it's considered scrambled
    setIsRotating(false);
  };

  if (!isMounted) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
       </div>
    );
  }
  
  return (
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden" suppressHydrationWarning>
      <aside className="w-1/4 lg:w-[calc(100%/8)] h-full bg-card border-r border-border flex flex-col">
        <SolutionSequencePanel
            solutionSequence={solutionSequence}
            currentMoveIndex={currentMoveIndex}
            isScrambled={isScrambled}
            isRotating={isRotating || isSolving}
            onPrevMove={() => playMove('prev')}
            onNextMove={() => playMove('next')}
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

        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="absolute top-5 right-5 bg-card/80 backdrop-blur-sm border shadow-lg">
                    <HelpCircle />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Ayuda</DialogTitle>
                    <DialogDescription>
                        Información sobre cómo resolver el Cubo de Rubik y usar los controles.
                    </DialogDescription>
                </DialogHeader>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Controles Manuales</AccordionTrigger>
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
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Pasos de la Solución (Principiante)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {solutionSteps.map((step, index) => (
                           <div key={index}>
                               <h4 className="font-bold">{step.title}</h4>
                               <p className="text-sm text-muted-foreground">{step.explanation}</p>
                           </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </DialogContent>
        </Dialog>


        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-card/80 backdrop-blur-sm rounded-lg border shadow-lg">
          <Button onClick={handleScramble} disabled={isRotating || isSolving} className="btn-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold">
            Mezclar
          </Button>
          <Button onClick={handleSolveFromCurrentState} disabled={isRotating || isSolving || !solverReady || !isScrambled} className="btn-primary bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold">
            {isSolving || !solverReady ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {solverReady ? 'Resolviendo...' : 'Cargando Motor...'}</> : 'Analizar y Resolver'}
          </Button>
          <Button onClick={handleReset} disabled={isRotating || isSolving} className="btn-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-semibold">
            Reiniciar
          </Button>
        </div>
      </div>

      <aside className="w-1/4 lg:w-[calc(100%/8)] h-full bg-card border-l border-border flex flex-col">
        <ManualControlsPanel
          isRotating={isRotating || isSolving}
          onManualMove={handleManualMove}
        />
      </aside>
    </main>
  );
}
