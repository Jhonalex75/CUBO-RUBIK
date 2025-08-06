// Explain Next Step
'use server';
/**
 * @fileOverview Explains the next step in the Rubik's Cube solution using AI.
 *
 * - explainNextStep - A function that explains the next step in simple terms.
 * - ExplainNextStepInput - The input type for the explainNextStep function.
 * - ExplainNextStepOutput - The return type for the explainNextStep function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainNextStepInputSchema = z.object({
  stepTitle: z.string().describe('The title of the current solution step.'),
  stepExplanation: z.string().describe('The general explanation of the solution step.'),
  cubeState: z.string().describe('The current state of the Rubik\'s Cube represented as a string.'),
});
export type ExplainNextStepInput = z.infer<typeof ExplainNextStepInputSchema>;

const ExplainNextStepOutputSchema = z.object({
  simplifiedExplanation: z.string().describe('A simplified explanation of the current step, specific to the current cube state.'),
});
export type ExplainNextStepOutput = z.infer<typeof ExplainNextStepOutputSchema>;

export async function explainNextStep(input: ExplainNextStepInput): Promise<ExplainNextStepOutput> {
  return explainNextStepFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainNextStepPrompt',
  input: {schema: ExplainNextStepInputSchema},
  output: {schema: ExplainNextStepOutputSchema},
  prompt: `You are a Rubik\'s Cube tutor. A student is trying to solve a Rubik\'s Cube using the beginner\'s method.

You are teaching the student the following step:

Step: {{{stepTitle}}}
Explanation: {{{stepExplanation}}}

Given the current state of the cube:

Cube State: {{{cubeState}}}

Explain this step in simpler terms so the student can understand how to apply it to their specific cube configuration. Focus on how to identify the pieces needed for this step and how to manipulate them into the correct position. Give concrete examples related to the cube state.
`,
});

const explainNextStepFlow = ai.defineFlow(
  {
    name: 'explainNextStepFlow',
    inputSchema: ExplainNextStepInputSchema,
    outputSchema: ExplainNextStepOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
