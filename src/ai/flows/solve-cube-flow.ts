'use server';
/**
 * @fileOverview Un agente de IA para resolver un Cubo de Rubik.
 *
 * - solveCube - Una función que maneja el proceso de resolución del cubo.
 * - SolveCubeInput - El tipo de entrada para la función solveCube.
 * - SolveCubeOutput - El tipo de retorno para la función solveCube.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SolveCubeInputSchema = z.object({
  cubeState: z.string().describe("El estado actual de las caras del Cubo de Rubik."),
});
export type SolveCubeInput = z.infer<typeof SolveCubeInputSchema>;

const SolveCubeOutputSchema = z.object({
  solution: z.string().describe("La secuencia de movimientos para resolver el cubo, en notación estándar (ej. R U R' F')."),
});
export type SolveCubeOutput = z.infer<typeof SolveCubeOutputSchema>;

export async function solveCube(input: SolveCubeInput): Promise<SolveCubeOutput> {
  return solveCubeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveCubePrompt',
  input: {schema: SolveCubeInputSchema},
  output: {schema: SolveCubeOutputSchema},
  prompt: `Eres un experto mundial en resolver el Cubo de Rubik.
Tu tarea es proporcionar una secuencia de movimientos COMPLETA y detallada para resolver un cubo a partir de un estado dado.
La secuencia debe estar en la notación de Singmaster estándar (F, B, U, D, L, R).
- Usa ' para giros antihorarios (ej. R').
- Usa 2 para giros de 180 grados (ej. U2).
- Cada movimiento debe estar separado por un espacio.
Genera la secuencia de solución completa más eficiente que conozcas, sin abreviaturas ni pasos omitidos.

Aquí está el estado actual del cubo:
{{{cubeState}}}

Proporciona solo la secuencia de movimientos como una única cadena de texto.
`,
});

const solveCubeFlow = ai.defineFlow(
  {
    name: 'solveCubeFlow',
    inputSchema: SolveCubeInputSchema,
    outputSchema: SolveCubeOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
